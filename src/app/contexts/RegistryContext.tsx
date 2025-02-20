                        "use client";

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { Registry, RegistryItem } from '../types/registry';

type RegistryState = {
  registries: Registry[];
  loading: boolean;
  error: string | null;
};

type RegistryAction =
  | { type: 'SET_REGISTRIES'; payload: Registry[] }
  | { type: 'ADD_REGISTRY'; payload: Registry }
  | { type: 'UPDATE_REGISTRY'; payload: Registry }
  | { type: 'DELETE_REGISTRY'; payload: string }
  | { type: 'ADD_ITEM'; payload: { registryId: string; item: RegistryItem } }
  | { type: 'UPDATE_ITEM'; payload: { registryId: string; item: RegistryItem } }
  | { type: 'REMOVE_ITEM'; payload: { registryId: string; itemId: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: RegistryState = {
  registries: [],
  loading: false,
  error: null,
};

const registryReducer = (state: RegistryState, action: RegistryAction): RegistryState => {
  switch (action.type) {
    case 'SET_REGISTRIES':
      return { ...state, registries: action.payload };
    case 'ADD_REGISTRY':
      return { ...state, registries: [...state.registries, action.payload] };
    case 'UPDATE_REGISTRY':
      return {
        ...state,
        registries: state.registries.map(registry =>
          registry.id === action.payload.id ? action.payload : registry
        ),
      };
    case 'DELETE_REGISTRY':
      return {
        ...state,
        registries: state.registries.filter(registry => registry.id !== action.payload),
      };
    case 'ADD_ITEM':
      return {
        ...state,
        registries: state.registries.map(registry =>
          registry.id === action.payload.registryId
            ? { ...registry, items: [...registry.items, action.payload.item] }
            : registry
        ),
      };
    case 'UPDATE_ITEM':
      return {
        ...state,
        registries: state.registries.map(registry =>
          registry.id === action.payload.registryId
            ? {
                ...registry,
                items: registry.items.map(item =>
                  item.id === action.payload.item.id ? action.payload.item : item
                ),
              }
            : registry
        ),
      };
    case 'REMOVE_ITEM':
      return {
        ...state,
        registries: state.registries.map(registry =>
          registry.id === action.payload.registryId
            ? {
                ...registry,
                items: registry.items.filter(item => item.id !== action.payload.itemId),
              }
            : registry
        ),
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

type RegistryContextType = {
  state: RegistryState;
  createRegistry: (registry: Omit<Registry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateRegistry: (registry: Registry) => Promise<void>;
  deleteRegistry: (registryId: string) => Promise<void>;
  addItem: (registryId: string, item: Omit<RegistryItem, 'id'>) => Promise<void>;
  updateItem: (registryId: string, item: RegistryItem) => Promise<void>;
  removeItem: (registryId: string, itemId: string) => Promise<void>;
  generateShareLink: (registryId: string) => Promise<string>;
};

const RegistryContext = createContext<RegistryContextType | undefined>(undefined);

export const RegistryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(registryReducer, initialState);

  const createRegistry = useCallback(async (registry: Omit<Registry, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // API call would go here
      const newRegistry = {
        ...registry,
        id: Date.now().toString(), // Temporary ID generation
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      dispatch({ type: 'ADD_REGISTRY', payload: newRegistry });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create registry' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const updateRegistry = useCallback(async (registry: Registry) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // API call would go here
      dispatch({ type: 'UPDATE_REGISTRY', payload: registry });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update registry' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const deleteRegistry = useCallback(async (registryId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // API call would go here
      dispatch({ type: 'DELETE_REGISTRY', payload: registryId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete registry' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const addItem = useCallback(async (registryId: string, item: Omit<RegistryItem, 'id'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // API call would go here
      const newItem = {
        ...item,
        id: Date.now().toString(), // Temporary ID generation
      };
      dispatch({ type: 'ADD_ITEM', payload: { registryId, item: newItem } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add item' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const updateItem = useCallback(async (registryId: string, item: RegistryItem) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // API call would go here
      dispatch({ type: 'UPDATE_ITEM', payload: { registryId, item } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update item' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const removeItem = useCallback(async (registryId: string, itemId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // API call would go here
      dispatch({ type: 'REMOVE_ITEM', payload: { registryId, itemId } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove item' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const generateShareLink = useCallback(async (registryId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // API call would go here to generate a unique share link
      const shareLink = `${window.location.origin}/registry/${registryId}`;
      const updatedRegistry = state.registries.find(r => r.id === registryId);
      if (updatedRegistry) {
        dispatch({
          type: 'UPDATE_REGISTRY',
          payload: { ...updatedRegistry, shareLink },
        });
      }
      return shareLink;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to generate share link' });
      return '';
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.registries]);

  const value = {
    state,
    createRegistry,
    updateRegistry,
    deleteRegistry,
    addItem,
    updateItem,
    removeItem,
    generateShareLink,
  };

  return <RegistryContext.Provider value={value}>{children}</RegistryContext.Provider>;
};

export const useRegistry = () => {
  const context = useContext(RegistryContext);
  if (context === undefined) {
    throw new Error('useRegistry must be used within a RegistryProvider');
  }
  return context;
};
