"use client"

import { useState } from "react"
import { Search, Heart, ShoppingBag } from "lucide-react"
import Link from "next/link"
import Cart from "./Cart"
import { useCart } from "../contexts/CartContext"

export default function NavBar() {
  const [activeCategory, setActiveCategory] = useState("all")
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { items } = useCart()

  return (
    <header className="border-b sticky top-0 bg-white z-50">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/">
            <div className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent cursor-pointer">
              VowSwap
            </div>
          </Link>

          <div className="flex-1 mx-12">
            <div className="relative">
              <input
                type="text"
                placeholder="Search wedding decor items..."
                aria-label="Search wedding decor items"
                className="w-full pl-12 pr-4 py-3 border rounded-full bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
                role="searchbox"
                list="search-suggestions"
              />
              <datalist id="search-suggestions">
                <option value="Wedding Arch" />
                <option value="Table Centerpiece" />
                <option value="Floral Arrangement" />
                <option value="Lighting Decor" />
                <option value="Vintage Accessories" />
              </datalist>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="flex items-center gap-8">
            <button aria-label="Favorites" className="text-gray-600 hover:text-gray-900 transition">
              <Heart className="w-6 h-6" />
            </button>
            <button 
              aria-label="Shopping Bag" 
              className="text-gray-600 hover:text-gray-900 transition relative"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag className="w-6 h-6" />
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </button>
            <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
            <button aria-label="Start Selling" className="px-6 py-2 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition">
              Start Selling
            </button>
          </div>
        </div>

        <nav className="flex items-center gap-8 h-12 text-base mt-4 overflow-x-auto">
          {["All Items", "Decor", "Lighting", "Furniture", "Floral", "Accessories"].map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category.toLowerCase())}
              className={`text-gray-600 hover:text-gray-900 transition whitespace-nowrap ${
                activeCategory === category.toLowerCase() ? "border-b-2 border-rose-500 font-semibold" : ""
              }`}
            >
              {category}
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}
