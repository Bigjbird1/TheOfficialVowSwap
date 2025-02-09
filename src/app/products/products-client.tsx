"use client"

import { ErrorBoundary } from 'react-error-boundary'
import { Suspense, useState } from 'react'
import { ReadonlyURLSearchParams, useRouter } from 'next/navigation'
import ProductGrid from "../components/ProductGrid"
import SearchBar from "../components/SearchBar"
import FilterBar from "../components/FilterBar"
import { ProductFilters } from "../types/filters"

interface ProductsClientProps {
  products: any[]
  searchParams: ReadonlyURLSearchParams
}

// Loading component for products
function ProductsLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-200 h-64 rounded-lg mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  )
}

// Error component with retry functionality
function ProductsError({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="text-center py-12">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Oops! Something went wrong
      </h3>
      <p className="text-gray-600 mb-4">
        {error.message || "We couldn't load the products. Please try again."}
      </p>
      <button
        onClick={resetErrorBoundary}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  )
}

// Client component that wraps the product grid with error boundary and loading state
export default function ProductsClient({ products: initialProducts, searchParams }: ProductsClientProps) {
  const [products, setProducts] = useState(initialProducts)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSearch = async (params: URLSearchParams) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/products?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }
      const data = await response.json()
      setProducts(data.products)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterChange = async (filters: ProductFilters) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v))
          } else if (typeof value === 'object') {
            params.set(key, JSON.stringify(value))
          } else {
            params.set(key, String(value))
          }
        }
      })
      const response = await fetch(`/api/products?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }
      const data = await response.json()
      setProducts(data.products)
    } catch (error) {
      console.error('Error fetching filtered products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSortChange = async (sortOption: string) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ sort: sortOption })
      const response = await fetch(`/api/products?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }
      const data = await response.json()
      setProducts(data.products)
    } catch (error) {
      console.error('Error fetching sorted products:', error)
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className="space-y-4">
      <SearchBar onSearch={handleSearch} />
      <FilterBar onFilterChange={handleFilterChange} onSortChange={handleSortChange} />
      <ErrorBoundary
        FallbackComponent={ProductsError}
        onReset={() => {
          // Reset the error boundary when retry is clicked
          window.location.reload()
        }}
      >
        <Suspense fallback={<ProductsLoading />}>
          <ProductGrid products={products} isLoading={isLoading} />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
