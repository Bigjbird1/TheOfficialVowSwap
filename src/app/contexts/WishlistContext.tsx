"use client";

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { Wishlist, WishlistItem } from '../types/registry';

type WishlistState = {
  wishlist: Wishlist | null;
  loading: boolean;
  error: string | null;
};

type WishlistAction =
  | { type: 'SET_WISHLIST'; payload: Wishlist }
  | { type: 'ADD_ITEM'; payload: WishlistItem }
  | { type: 'UPDATE_ITEM'; payload: WishlistItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'REORDER_ITEMS'; payload: WishlistItem[] }
  | { type: 'TOGGLE_FAVORITE'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: WishlistState = {
  wishlist: null,
  loading: false,
  error: null,
};

const wishlistReducer = (state: WishlistState, action: WishlistAction): WishlistState => {
  switch (action.type) {
    case 'SET_WISHLIST':
      return { ...state, wishlist: action.payload };
    case 'ADD_ITEM':
      return {
        ...state,
        wishlist: state.wishlist
          ? {
              ...state.wishlist,
              items: [...state.wishlist.items, action.payload],
            }
          : null,
      };
    case 'UPDATE_ITEM':
      return {
        ...state,
        wishlist: state.wishlist
          ? {
              ...state.wishlist,
              items: state.wishlist.items.map(item =>
                item.id === action.payload.id ? action.payload : item
              ),
            }
          : null,
      };
    case 'REMOVE_ITEM':
      return {
        ...state,
        wishlist: state.wishlist
          ? {
              ...state.wishlist,
              items: state.wishlist.items.filter(item => item.id !== action.payload),
            }
          : null,
      };
    case 'REORDER_ITEMS':
      return {
        ...state,
        wishlist: state.wishlist
          ? {
              ...state.wishlist,
              items: action.payload,
            }
          : null,
      };
    case 'TOGGLE_FAVORITE':
      return {
        ...state,
        wishlist: state.wishlist
          ? {
              ...state.wishlist,
              items: state.wishlist.items.map(item =>
                item.id === action.payload
                  ? { ...item, favorite: !item.favorite }
                  : item
              ),
            }
          : null,
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

type WishlistContextType = {
  state: WishlistState;
  addItem: (item: Omit<WishlistItem, 'id' | 'position'>) => Promise<void>;
  updateItem: (item: WishlistItem) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  reorderItems: (items: WishlistItem[]) => Promise<void>;
  toggleFavorite: (itemId: string) => Promise<void>;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);

  const addItem = useCallback(async (item: Omit<WishlistItem, 'id' | 'position'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // API call would go here
      const position = state.wishlist?.items.length ?? 0;
      const newItem: WishlistItem = {
        ...item,
        id: Date.now().toString(), // Temporary ID generation
        position,
      };
      dispatch({ type: 'ADD_ITEM', payload: newItem });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add item' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.wishlist?.items.length]);

  const updateItem = useCallback(async (item: WishlistItem) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // API call would go here
      dispatch({ type: 'UPDATE_ITEM', payload: item });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update item' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const removeItem = useCallback(async (itemId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // API call would go here
      dispatch({ type: 'REMOVE_ITEM', payload: itemId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove item' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const reorderItems = useCallback(async (items: WishlistItem[]) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // API call would go here
      const reorderedItems = items.map((item, index) => ({
        ...item,
        position: index,
      }));
      dispatch({ type: 'REORDER_ITEMS', payload: reorderedItems });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to reorder items' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const toggleFavorite = useCallback(async (itemId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // API call would go here
      dispatch({ type: 'TOGGLE_FAVORITE', payload: itemId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to toggle favorite' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const value = {
    state,
    addItem,
    updateItem,
    removeItem,
    reorderItems,
    toggleFavorite,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
