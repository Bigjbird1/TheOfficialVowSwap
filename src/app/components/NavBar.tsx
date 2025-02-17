"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Search, Heart, ShoppingBag, User, Menu } from "lucide-react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import Cart from "./Cart";
import { useCart } from "../contexts/CartContext";
import { useDebounce } from "../hooks/useDebounce";
import MegaMenu from "./navigation/MegaMenu";
import MobileNav from "./navigation/MobileNav";
import { navigationData } from "../types/navigation";

function AuthButtons() {
  const { data: session } = useSession()

  if (session) {
    return (
      <div className="flex items-center gap-4">
          <Link 
            href="/dashboard"
            className="flex items-center gap-2 hover:text-[#E35B96] transition"
          >
            <User className="w-5 h-5" />
            <span className="text-sm">{session.user?.name}</span>
          </Link>
        <button
          onClick={() => signOut()}
          className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition"
        >
          Sign Out
        </button>
        {session.user?.role !== "SELLER" && (
          <Link 
            href="/sign-up-sell" 
            className="px-6 py-2 bg-[#E35B96] text-white rounded-full hover:bg-[#d14a85] transition focus:outline-none focus:ring-2 focus:ring-[#E35B96] focus:ring-offset-2"
          >
            Start Selling
          </Link>
        )}
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
        <button className="px-6 py-2 bg-[#E35B96] text-white rounded-full hover:bg-[#d14a85] transition">
          Sign Up
        </button>
      </Link>
    </div>
  )
}

export default function NavBar() {
  // State management
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { items } = useCart();

  // Search functionality with debouncing
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

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

  // Handle category hover
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleCategoryHover = useCallback((categoryName: string | null) => {
    console.log(`Hovering over category: ${categoryName}`);
    
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    if (categoryName) {
      console.log(`Setting hoveredCategory to: ${categoryName}`);
      setHoveredCategory(categoryName);
    } else {
      // Set timeout to close menu after delay
      hoverTimeoutRef.current = setTimeout(() => {
        console.log(`Clearing hoveredCategory`);
        setHoveredCategory(null);
      }, 300); // 300ms delay for better UX
    }
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);
  
  return (
    <header className="border-b sticky top-0 bg-white z-[9998]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#E35B96]"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
          <Link href="/">
            <div className="flex items-center">
              <svg width="40" height="32" viewBox="0 0 100 100">
                <path d="M25,60 C25,40 0,40 0,60 C0,80 25,90 25,90 C25,90 50,80 50,60 C50,40 25,40 25,60" 
                      fill="#FF6B6B" 
                      opacity="0.85"
                      transform="translate(0, -20) rotate(-15, 25, 70)"/>
                <path d="M75,60 C75,40 50,40 50,60 C50,80 75,90 75,90 C75,90 100,80 100,60 C100,40 75,40 75,60" 
                      fill="#4A90E2" 
                      opacity="0.85"
                      transform="translate(0, -20) rotate(15, 75, 70)"/>
              </svg>
              <div className="text-2xl font-bold bg-gradient-to-r from-[#E35B96] to-[#8B5CF6] bg-clip-text text-transparent cursor-pointer">
                VowSwap
              </div>
            </div>
          </Link>

          <div className="w-[40%] mx-12">
            <form role="search" onSubmit={handleSearchSubmit} className="relative">
              <div className="relative flex w-full">
                <input
                  type="search"
                  placeholder="Search wedding decor items..."
                  aria-label="Search wedding decor items"
                  className="w-full pl-12 pr-24 h-12 border rounded-full bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E35B96] transition"
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
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <button 
                  type="submit" 
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-[#E35B96] text-white rounded-full hover:bg-[#d14a85] transition"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          <div className="flex items-center gap-6">
            <Link 
              href="/liked-items"
              aria-label="Favorites" 
              className="text-gray-600 hover:text-gray-900 transition focus:outline-none focus:ring-2 focus:ring-[#E35B96] focus:ring-offset-2 rounded-full p-1"
            >
              <Heart className="w-5 h-5" />
            </Link>
            <button 
              aria-label="Shopping Bag" 
              className="text-gray-600 hover:text-gray-900 transition relative focus:outline-none focus:ring-2 focus:ring-[#E35B96] focus:ring-offset-2 rounded-full p-1"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag className="w-5 h-5" />
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#E35B96] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </button>
            <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
            <AuthButtons />
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-4 text-base py-2 overflow-x-auto relative border-t">
          {navigationData.map((category) => (
<div
  key={category.name}
  onMouseEnter={() => handleCategoryHover(category.name)}
  onMouseLeave={() => handleCategoryHover(null)}
  className="relative group flex flex-col items-center z-[9999]"
>
              <Link
                href={category.href}
                className={`text-gray-600 hover:text-gray-900 transition-colors duration-150 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[#E35B96] focus:ring-offset-2 rounded-full px-4 py-2 ${
                  hoveredCategory === category.name ? "bg-[#E35B96] text-white font-medium" : ""
                } group-hover:text-gray-900 group-hover:font-medium flex items-center`}
                aria-expanded={hoveredCategory === category.name}
                aria-haspopup={category.subcategories ? "true" : "false"}
                role="menuitem"
              >
                {category.name}
              </Link>
              <MegaMenu
                category={category}
                isOpen={hoveredCategory === category.name}
              />
            </div>
          ))}
        </nav>

        <MobileNav
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      </div>
    </header>
  )
}
