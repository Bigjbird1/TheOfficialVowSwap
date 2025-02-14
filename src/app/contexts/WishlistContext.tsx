import { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface WishlistItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
    description: string;
  };
  addedAt: Date;
}

interface WishlistContextType {
  items: WishlistItem[];
  isLoading: boolean;
  error: string | null;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    // Only fetch wishlist for customers
    if (session.user.role === 'CUSTOMER') {
      fetchWishlist();
    } else {
      // For non-customer roles (like sellers), set empty state without attempting to fetch
      setItems([]);
      setIsLoading(false);
      setError(null);
    }
  }, [session]);

  const fetchWishlist = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch('/api/wishlist');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
        console.error('Wishlist fetch failed:', errorMessage);
        setError(errorMessage);
        setItems([]); // Fallback to empty wishlist
        return;
      }
      const data = await response.json();
      setItems(data.items || []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch wishlist';
      console.error('Error fetching wishlist:', error);
      setError(errorMessage);
      setItems([]); // Fallback to empty wishlist
    } finally {
      setIsLoading(false);
    }
  };

  const addToWishlist = async (productId: string) => {
    if (!session?.user) {
      setError('Must be logged in to add to wishlist');
      return;
    }

    setError(null);
    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to add item to wishlist (${response.status})`;
        console.error('Add to wishlist failed:', errorMessage);
        setError(errorMessage);
        return;
      }
      
      const newItem = await response.json();
      setItems((prev) => [...prev, newItem]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add to wishlist';
      console.error('Error adding to wishlist:', error);
      setError(errorMessage);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!session?.user) {
      setError('Must be logged in to remove from wishlist');
      return;
    }

    setError(null);
    try {
      const response = await fetch(`/api/wishlist/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to remove item from wishlist (${response.status})`;
        console.error('Remove from wishlist failed:', errorMessage);
        setError(errorMessage);
        return;
      }
      
      setItems((prev) => prev.filter(item => item.productId !== productId));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove from wishlist';
      console.error('Error removing from wishlist:', error);
      setError(errorMessage);
    }
  };

  const isInWishlist = (productId: string) => {
    return items.some(item => item.productId === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        isLoading,
        error,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
