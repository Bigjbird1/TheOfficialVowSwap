"use client"

import { useState, useCallback } from "react"
import { Search, Heart, ShoppingBag, User } from "lucide-react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import Cart from "./Cart"
import { useCart } from "../contexts/CartContext"
import { useDebounce } from "../hooks/useDebounce"

function AuthButtons() {
  const { data: session } = useSession()

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5" />
          <span className="text-sm">{session.user?.name}</span>
        </div>
        <button
          onClick={() => signOut()}
          className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition"
        >
          Sign Out
        </button>
        <Link 
          href="/seller/dashboard" 
          className="px-6 py-2 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
        >
          Start Selling
        </Link>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <Link href="/auth/signin">
        <button className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition">
          Sign In
        </button>
      </Link>
      <Link href="/auth/signup">
        <button className="px-6 py-2 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition">
          Sign Up
        </button>
      </Link>
    </div>
  )
}

export default function NavBar() {
  // State management for navigation and cart
  const [activeCategory, setActiveCategory] = useState("all")
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { items } = useCart()

  // Search functionality with debouncing
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 300)

  // Handle search input changes
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }, [])

  // Handle search submission
  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement search functionality
    console.log("Searching for:", debouncedSearch)
  }, [debouncedSearch])

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
            <form role="search" onSubmit={handleSearchSubmit} className="relative">
              <input
                type="search"
                placeholder="Search wedding decor items..."
                aria-label="Search wedding decor items"
                className="w-full pl-12 pr-4 py-3 border rounded-full bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
                value={searchQuery}
                onChange={handleSearchChange}
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
            </form>
          </div>

          <div className="flex items-center gap-6">
            <button 
              aria-label="Favorites" 
              className="text-gray-600 hover:text-gray-900 transition focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 rounded-full p-1"
            >
              <Heart className="w-6 h-6" />
            </button>
            <button 
              aria-label="Shopping Bag" 
              className="text-gray-600 hover:text-gray-900 transition relative focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 rounded-full p-1"
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
            <AuthButtons />
          </div>
        </div>

        <nav className="flex items-center gap-8 h-12 text-base mt-4 overflow-x-auto">
          {["All Items", "Decor", "Lighting", "Furniture", "Floral", "Accessories", "Wedding Services"].map((category) => (
            category === "Wedding Services" ? (
              <Link
                key={category}
                href="/wedding-services"
                className="text-gray-600 hover:text-gray-900 transition whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 rounded px-2"
              >
                {category}
              </Link>
            ) : (
              <button
                key={category}
                onClick={() => setActiveCategory(category.toLowerCase())}
                className={`text-gray-600 hover:text-gray-900 transition whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 rounded px-2 ${
                  activeCategory === category.toLowerCase() ? "border-b-2 border-rose-500 font-semibold" : ""
                }`}
              >
                {category}
              </button>
            )
          ))}
        </nav>
      </div>
    </header>
  )
}
