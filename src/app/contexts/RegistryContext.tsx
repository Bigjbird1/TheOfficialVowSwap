"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface RegistryItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
    description: string;
  };
  quantity: number;
  purchased: number;
  priority: number;
  addedAt: Date;
  updatedAt: Date;
}

interface Registry {
  id: string;
  title: string;
  eventDate: Date;
  description?: string;
  isPublic: boolean;
  shareableLink: string;
  items: RegistryItem[];
}

interface RegistryContextType {
  registry: Registry | null;
  isLoading: boolean;
  createRegistry: (data: { title: string; eventDate: Date; description?: string; isPublic?: boolean }) => Promise<void>;
  updateRegistry: (data: { title?: string; eventDate?: Date; description?: string; isPublic?: boolean }) => Promise<void>;
  addToRegistry: (productId: string, quantity: number, priority?: number) => Promise<void>;
  removeFromRegistry: (productId: string) => Promise<void>;
  updateRegistryItem: (productId: string, updates: { quantity?: number; priority?: number }) => Promise<void>;
  isInRegistry: (productId: string) => boolean;
}

const RegistryContext = createContext<RegistryContextType | undefined>(undefined);

export function RegistryProvider({ children }: { children: React.ReactNode }) {
  const [registry, setRegistry] = useState<Registry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user) {
      fetchRegistry();
    } else {
      setRegistry(null);
      setIsLoading(false);
    }
  }, [session]);

  const fetchRegistry = async (retryCount = 0) => {
    const MAX_RETRIES = 3;
    const BASE_DELAY = 1000; // 1 second
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch('/api/registry', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      // Check response content type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: text
        });
        throw new Error('Server returned invalid response format');
      }

      if (!response.ok) {
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch registry');
        } catch (jsonError) {
          const text = await response.text();
          console.error('Error parsing error response:', {
            error: jsonError,
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            body: text
          });
          throw new Error('Failed to fetch registry - invalid error format');
        }
      }
      
      try {
        const text = await response.text();
        // Validate JSON structure before parsing
        if (!text.trim().startsWith('{') || !text.trim().endsWith('}')) {
          console.error('Invalid JSON structure:', text);
          throw new Error('Invalid JSON structure in response');
        }
        
        const data = JSON.parse(text);
        if (!data.registry) {
          console.error('Missing registry in response:', data);
          throw new Error('Response missing required registry data');
        }
        setRegistry(data.registry);
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            console.error('Request timed out');
          } else {
            console.error('Error fetching registry:', error.message);
          }
        } else {
          console.error('Unknown error occurred:', error);
        }
        
        if (retryCount < MAX_RETRIES) {
          const delay = BASE_DELAY * Math.pow(2, retryCount);
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchRegistry(retryCount + 1);
        }
        
        // Set error state if all retries fail
        setRegistry(null);
        throw new Error('Failed to load registry after multiple attempts');
      } finally {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error in fetchRegistry:', error);
      setRegistry(null);
      throw error;
    }
  };

  const createRegistry = async (data: { title: string; eventDate: Date; description?: string; isPublic?: boolean }) => {
    if (!session?.user) {
      throw new Error('Must be logged in to create registry');
    }

    try {
      const response = await fetch('/api/registry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to create registry');
      
      const newRegistry = await response.json();
      setRegistry(newRegistry);
    } catch (error) {
      console.error('Error creating registry:', error);
      throw error;
    }
  };

  const updateRegistry = async (data: { title?: string; eventDate?: Date; description?: string; isPublic?: boolean }) => {
    if (!session?.user || !registry) {
      throw new Error('Must be logged in and have a registry to update');
    }

    try {
      const response = await fetch('/api/registry', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update registry');
      
      const updatedRegistry = await response.json();
      setRegistry(updatedRegistry);
    } catch (error) {
      console.error('Error updating registry:', error);
      throw error;
    }
  };

  const addToRegistry = async (productId: string, quantity: number, priority: number = 0) => {
    if (!session?.user || !registry) {
      throw new Error('Must be logged in and have a registry to add items');
    }

    try {
      const response = await fetch('/api/registry/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, quantity, priority }),
      });

      if (!response.ok) throw new Error('Failed to add to registry');
      
      const updatedRegistry = await response.json();
      setRegistry(updatedRegistry);
    } catch (error) {
      console.error('Error adding to registry:', error);
      throw error;
    }
  };

  const removeFromRegistry = async (productId: string) => {
    if (!session?.user || !registry) {
      throw new Error('Must be logged in and have a registry to remove items');
    }

    try {
      const response = await fetch(`/api/registry/items/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to remove from registry');
      
      const updatedRegistry = await response.json();
      setRegistry(updatedRegistry);
    } catch (error) {
      console.error('Error removing from registry:', error);
      throw error;
    }
  };

  const updateRegistryItem = async (productId: string, updates: { quantity?: number; priority?: number }) => {
    if (!session?.user || !registry) {
      throw new Error('Must be logged in and have a registry to update items');
    }

    try {
      const response = await fetch(`/api/registry/items/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update registry item');
      
      const updatedRegistry = await response.json();
      setRegistry(updatedRegistry);
    } catch (error) {
      console.error('Error updating registry item:', error);
      throw error;
    }
  };

  const isInRegistry = (productId: string) => {
    return registry?.items.some(item => item.productId === productId) ?? false;
  };

  return (
    <RegistryContext.Provider
      value={{
        registry,
        isLoading,
        createRegistry,
        updateRegistry,
        addToRegistry,
        removeFromRegistry,
        updateRegistryItem,
        isInRegistry,
      }}
    >
      {children}
    </RegistryContext.Provider>
  );
}

export function useRegistry() {
  const context = useContext(RegistryContext);
  if (context === undefined) {
    throw new Error('useRegistry must be used within a RegistryProvider');
  }
  return context;
}
