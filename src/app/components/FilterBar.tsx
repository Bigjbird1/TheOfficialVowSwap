"use client"

import { useState, useEffect } from "react"
import { Search, SlidersHorizontal } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

const categories = [
  "All",
  "Lighting",
  "Decorations",
  "Table Settings",
  "Backdrops"
]

const sortOptions = [
  { value: "", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" }
]

type FilterUpdates = {
  search?: string
  category?: string
  sort?: string
}

export default function FilterBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [search, setSearch] = useState(() => searchParams?.get("search") || "")
  const [category, setCategory] = useState(() => searchParams?.get("category") || "All")
  const [sort, setSort] = useState(() => searchParams?.get("sort") || "")
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  // Debounce search updates
  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilters({ search })
    }, 300)

    return () => clearTimeout(timer)
  }, [search])

  const updateFilters = (updates: FilterUpdates) => {
    const params = new URLSearchParams(searchParams?.toString() || "")
    
    // Update search
    if (updates.search !== undefined) {
      if (updates.search) {
        params.set("search", updates.search)
      } else {
        params.delete("search")
      }
    }
    
    // Update category
    if (updates.category !== undefined) {
      if (updates.category && updates.category !== "All") {
        params.set("category", updates.category)
      } else {
        params.delete("category")
      }
    }
    
    // Update sort
    if (updates.sort !== undefined) {
      if (updates.sort) {
        params.set("sort", updates.sort)
      } else {
        params.delete("sort")
      }
    }
    
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="mb-8 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search wedding decor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
        />
      </div>

      {/* Category Filters - Always visible */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setCategory(cat)
              updateFilters({ category: cat })
            }}
            className={`px-4 py-2 rounded-full border transition-colors
              ${category === cat
                ? "bg-rose-500 text-white border-rose-500"
                : "border-gray-300 hover:border-rose-500 text-gray-700 hover:text-rose-500"
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Filters Toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span>More Filters</span>
        </button>
      </div>

      {/* Additional Filters */}
      {isFiltersOpen && (
        <div className="pt-4 border-t">
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value)
                updateFilters({ sort: e.target.value })
              }}
              className="px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  )
}
