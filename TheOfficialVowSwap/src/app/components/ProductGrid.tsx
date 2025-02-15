"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { useCart } from "../contexts/CartContext"
import { Product } from "../types"
import OptimizedImage from "./ui/OptimizedImage"
import VirtualGrid from "./ui/VirtualGrid"
import { useBreakpoint } from "../hooks/useBreakpoint"

interface ProductGridProps {
  products: Product[]
  className?: string
  isLoading?: boolean
  filters?: {
    category: string;
    subcategory: string;
    size: string;
    color: string;
    condition: string;
    minPrice: string;
    maxPrice: string;
    sort: string;
    onSale: boolean;
  };
}

function StarRating({ rating = 0, className = "" }: { rating?: number; className?: string }) {
  return (
    <div className="flex" role="img" aria-label={`${rating} out of 5 stars`}>
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${
            i < Math.floor(rating)
              ? "text-yellow-400 fill-current"
              : "text-gray-300"
          }`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  )
}

export default function ProductGrid({ 
  products,
  className = "",
  isLoading = false,
  filters
}: ProductGridProps) {
  const breakpoint = useBreakpoint()
  const [columnCount, setColumnCount] = useState(4)
  
  // Update column count based on breakpoint
  useEffect(() => {
    switch (breakpoint.breakpoint) {
      case 'sm':
        setColumnCount(1)
        break
      case 'md':
        setColumnCount(2)
        break
      case 'lg':
        setColumnCount(3)
        break
      default:
        setColumnCount(4)
    }
  }, [breakpoint.breakpoint])

  // Filter and sort products
  const processedProducts = products.filter(product => {
    if (filters) {
      if (filters.category && filters.category !== "" && 
          product.category.toLowerCase() !== filters.category.toLowerCase()) {
        return false;
      }
      
      if (filters.size && filters.size !== "" && 
          product.size?.toLowerCase() !== filters.size.toLowerCase()) {
        return false;
      }
      
      if (filters.color && filters.color !== "" && 
          product.color?.toLowerCase() !== filters.color.toLowerCase()) {
        return false;
      }
      
      if (filters.condition && filters.condition !== "" && 
          product.condition?.toLowerCase() !== filters.condition.toLowerCase()) {
        return false;
      }
      
      if (filters.minPrice && parseFloat(filters.minPrice) > product.price) {
        return false;
      }
      
      if (filters.maxPrice && parseFloat(filters.maxPrice) < product.price) {
        return false;
      }
    }
    
    return true;
  });

  const renderProduct = useCallback((product: Product) => {
    return (
      <div className="group bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
        <div className="relative">
          <Link 
            href={`/product/${product.id}`}
            className="block focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 rounded-lg"
          >
            <div className="aspect-[4/5] relative rounded-lg overflow-hidden mb-4 bg-gray-50">
              <OptimizedImage
                src={product.images[0]?.url || "/placeholder.svg"}
                alt={product.images[0]?.alt || `Product image of ${product.name}`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </Link>
              
          {/* Quick View Overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-50 pointer-events-auto">
            <div className="bg-white rounded-lg p-4 w-11/12 max-w-sm space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Quick View
              </h3>
              <AddToCartButton product={product} className="w-full" />
              <Link
                href={`/product/${product.id}`}
                className="block w-full text-center bg-white border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
        <h3 className="font-medium text-lg mb-2 line-clamp-2 text-gray-800 group-hover:text-pink-600 transition-colors duration-200">
          {product.name}
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p 
              className="text-xl font-semibold text-gray-900" 
              aria-label={`Price: $${product.price.toFixed(2)}`}
            >
              ${product.price.toFixed(2)}
            </p>
            <span className="text-sm font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
              {product.category}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <StarRating rating={product.rating} />
              {product.rating && (
                <span className="text-sm font-medium text-gray-700">
                  {product.rating.toFixed(1)}
                </span>
              )}
            </div>
            {product.reviewCount !== undefined && (
              <span className="text-sm text-gray-500 border-l border-gray-200 pl-2">
                {product.reviewCount} {product.reviewCount === 1 ? 'review' : 'reviews'}
              </span>
            )}
          </div>
          <div className="mt-3">
            <span 
              className={`text-sm font-medium px-2 py-1 rounded-full ${
                product.stockStatus === "In Stock" 
                  ? "bg-green-50 text-green-700" 
                  : "bg-orange-50 text-orange-700"
              }`}
              role="status"
            >
              {product.stockStatus}
            </span>
          </div>
        </div>
        <AddToCartButton product={product} />
      </div>
    )
  }, [])

  if (isLoading) {
    return (
      <div className={className}>
        <VirtualGrid
          items={Array(12).fill(null)}
          columnCount={columnCount}
          renderItem={() => (
            <div className="bg-white p-4 rounded-lg shadow animate-pulse">
              <div className="aspect-[4/5] bg-gray-200 rounded-lg mb-4" />
              <div className="h-6 bg-gray-200 rounded mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          )}
        />
      </div>
    )
  }

  return (
    <div className={className}>
      <VirtualGrid
        items={processedProducts}
        columnCount={columnCount}
        renderItem={renderProduct}
        rowHeight={450}
      />
    </div>
  )
}

function AddToCartButton({ product, className }: { product: Product; className?: string }) {
  const { addItem } = useCart()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.url || "/placeholder.svg"
    })
  }

  return (
    <button
      onClick={handleAddToCart}
      className="absolute bottom-4 right-4 p-3 bg-pink-500 text-white rounded-full hover:bg-pink-600 transform hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 shadow-lg"
      aria-label={`Add ${product.name} to cart`}
      style={{ willChange: 'transform' }}
    >
      <ShoppingCart className="w-5 h-5" aria-hidden="true" />
    </button>
  )
}
