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

// Define the shape of our cart context
interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  total: number
}

// Create the context with undefined as initial value
const CartContext = createContext<CartContextType | undefined>(undefined)

// Local storage key for persisting cart data
const CART_STORAGE_KEY = 'wedding-marketplace-cart'

export function CartProvider({ children }: { children: ReactNode }) {
  // Initialize state from localStorage if available, otherwise empty array
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return []
    const savedCart = localStorage.getItem(CART_STORAGE_KEY)
    return savedCart ? JSON.parse(savedCart) : []
  })

  // Persist cart items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  }, [items])

  /**
   * Adds a new item to the cart or increments its quantity if it already exists
   * @param newItem - The item to add (without quantity)
   */
  const addItem = (newItem: Omit<CartItem, 'quantity'>) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.id === newItem.id)
      if (existingItem) {
        // If item exists, increment its quantity
        return currentItems.map(item =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      // If item doesn't exist, add it with quantity 1
      return [...currentItems, { ...newItem, quantity: 1 }]
    })
  }

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
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(id)
      return
    }
    setItems(currentItems =>
      currentItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    )
  }

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
    total
  }), [items, total]) // Dependencies include items and total since they're the only values that can change

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
