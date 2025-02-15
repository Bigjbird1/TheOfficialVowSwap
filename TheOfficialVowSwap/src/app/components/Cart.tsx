"use client"

import { useCart } from "../contexts/CartContext"
import { X, Plus, Minus, ShoppingBag, HeartCrack, ArrowRight } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import Checkout from "./Checkout"
import RecommendedProducts from "./RecommendedProducts"

interface CartProps {
  isOpen: boolean
  onClose: () => void
}

export default function Cart({ isOpen, onClose }: CartProps) {
  const { items, removeItem, updateQuantity, total } = useCart()
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="text-lg font-semibold">Shopping Cart</h2>
            <button
              onClick={onClose}
              className="rounded-full p-1 hover:bg-gray-100"
              aria-label="Close cart"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

{items.length === 0 ? (
  <div className="flex flex-col items-center justify-center h-[calc(100vh-76px)] p-8 text-center">
    <div className="relative mb-6">
      <ShoppingBag className="w-20 h-20 text-gray-200" />
      <HeartCrack className="w-8 h-8 text-rose-500 absolute -right-2 -bottom-2" />
    </div>
    
    <h3 className="text-2xl font-semibold mb-2 bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent">
      Your Cart is Empty
    </h3>
    
    <p className="text-gray-600 mb-8 max-w-xs">
      Looks like your cart needs some wedding magic! Start adding beautiful decor items to create your perfect day.
    </p>

    <button 
      onClick={onClose}
      className="flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-full hover:bg-rose-600 transform hover:scale-105 transition duration-300"
    >
      Start Shopping <ArrowRight className="w-4 h-4" />
    </button>
    
    <div className="mt-8 flex flex-wrap justify-center gap-2">
      {["Decor", "Lighting", "Floral"].map((category) => (
        <button
          key={category}
          className="px-4 py-1 bg-gray-50 text-gray-600 rounded-full hover:bg-rose-50 hover:text-rose-500 transition"
        >
          {category}
        </button>
      ))}
    </div>
  </div>
) : (
            <>
              <div className="flex-1 overflow-y-auto p-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 border-b py-4">
                    <div className="relative h-20 w-20 flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-gray-500">${item.price.toFixed(2)}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="rounded-full p-1 hover:bg-gray-100"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="rounded-full p-1 hover:bg-gray-100"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="ml-auto text-rose-500 hover:text-rose-600"
                          aria-label="Remove item"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recommended Products */}
              <div className="border-t border-b">
                <RecommendedProducts 
                  cartItemIds={items.map(item => item.id)}
                  title="Frequently Bought Together"
                  maxItems={2}
                />
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold">${total.toFixed(2)}</span>
                </div>
                <button
                  className="w-full bg-rose-500 text-white py-3 rounded-full hover:bg-rose-600 transition"
                  onClick={() => setIsCheckoutOpen(true)}
                >
                  Proceed to Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <Checkout isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
    </div>
  )
}
