"use client"

import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react'

// Define the structure of a cart item
export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
}

interface AvailabilityResponse {
  success: boolean
  data?: {
    isAvailable: boolean
    remainingStock: number
    requestedQuantity: number
  }
  message?: string
}

// Define the shape of our cart context
interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => Promise<{ success: boolean; message?: string }>
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => Promise<{ success: boolean; message?: string }>
  clearCart: () => void
  total: number
  isLoading: boolean
}

// Create the context with undefined as initial value
const CartContext = createContext<CartContextType | undefined>(undefined)

// Local storage key for persisting cart data
const CART_STORAGE_KEY = 'wedding-marketplace-cart'

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return []
    const savedCart = localStorage.getItem(CART_STORAGE_KEY)
    return savedCart ? JSON.parse(savedCart) : []
  })
  const [isLoading, setIsLoading] = useState(false)

  // Persist cart items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  }, [items])

  /**
   * Checks product availability before adding or updating cart
   */
  const checkAvailability = async (productId: string, quantity: number): Promise<AvailabilityResponse> => {
    try {
      const response = await fetch(`/api/products/availability?id=${productId}&quantity=${quantity}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to check availability:', error);
      return { success: false, message: 'Failed to check product availability' };
    }
  };

  /**
   * Adds a new item to the cart or increments its quantity if it already exists
   * @param newItem - The item to add (without quantity)
   */
  const addItem = async (newItem: Omit<CartItem, 'quantity'>) => {
    setIsLoading(true);
    try {
      const existingItem = items.find(item => item.id === newItem.id);
      const newQuantity = (existingItem?.quantity || 0) + 1;

      const availabilityCheck = await checkAvailability(newItem.id, newQuantity);
      if (!availabilityCheck.success || !availabilityCheck.data?.isAvailable) {
        return {
          success: false,
          message: availabilityCheck.message || `Only ${availabilityCheck.data?.remainingStock} items available`
        };
      }

      setItems(currentItems => {
        if (existingItem) {
          return currentItems.map(item =>
            item.id === newItem.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...currentItems, { ...newItem, quantity: 1 }];
      });

      return { success: true };
    } catch (error) {
      console.error('Add to cart error:', error);
      return { success: false, message: 'Failed to add item to cart' };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Removes an item from the cart completely
   * @param id - The ID of the item to remove
   */
  const removeItem = (id: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== id))
  }

  /**
   * Updates the quantity of an item in the cart
   * If quantity < 1, removes the item completely
   * @param id - The ID of the item to update
   * @param quantity - The new quantity
   */
  const updateQuantity = async (id: string, quantity: number) => {
    setIsLoading(true);
    try {
      if (quantity < 1) {
        removeItem(id);
        return { success: true };
      }

      const availabilityCheck = await checkAvailability(id, quantity);
      if (!availabilityCheck.success || !availabilityCheck.data?.isAvailable) {
        return {
          success: false,
          message: availabilityCheck.message || `Only ${availabilityCheck.data?.remainingStock} items available`
        };
      }

      setItems(currentItems =>
        currentItems.map(item =>
          item.id === id ? { ...item, quantity } : item
        )
      );

      return { success: true };
    } catch (error) {
      console.error('Update quantity error:', error);
      return { success: false, message: 'Failed to update quantity' };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clears all items from the cart
   */
  const clearCart = () => {
    setItems([])
  }

  // Calculate the total price of all items in the cart
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    total,
    isLoading
  }), [items, total, isLoading])

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  )
}

/**
 * Custom hook to use the cart context
 * @throws {Error} If used outside of CartProvider
 * @returns CartContextType The cart context value
 */
export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
