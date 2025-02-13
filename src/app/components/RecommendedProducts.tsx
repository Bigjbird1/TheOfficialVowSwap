"use client"

import { useEffect, useState } from "react"
import { Product } from "../types"
import ProductGrid from "./ProductGrid"

interface RecommendedProductsProps {
  currentProductId?: string
  cartItemIds?: string[]
  maxItems?: number
  title?: string
}

export default function RecommendedProducts({
  currentProductId,
  cartItemIds,
  maxItems = 4,
  title = "Recommended for You"
}: RecommendedProductsProps) {
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Create an AbortController to cancel fetch requests if the component unmounts
    const controller = new AbortController()
    const signal = controller.signal

    async function fetchRecommendations() {
      try {
        setIsLoading(true)
        setError(null)
        let products: Product[] = []

        // Helper function to fetch with error checking
        async function safeFetch(url: string) {
          const res = await fetch(url, { signal })
          if (!res.ok) {
            throw new Error(`Failed to fetch ${url}`)
          }
          return res.json()
        }

        if (currentProductId) {
          // Fetch the current product to get its category
          const currentProduct = await safeFetch(`/api/products/${currentProductId}`)
          // Fetch products in the same category (adding one extra to account for the current product)
          const categoryData = await safeFetch(
            `/api/products?category=${currentProduct.category}&limit=${maxItems + 1}`
          )
          products = categoryData.products as Product[]
          // Remove the current product and limit the results
          products = products.filter(p => p.id !== currentProductId).slice(0, maxItems)
        } else if (cartItemIds && cartItemIds.length > 0) {
          // Fetch detailed data for each cart item concurrently
          const cartProducts = await Promise.all(
            cartItemIds.map(id => safeFetch(`/api/products/${id}`))
          )
          // Extract unique categories from the cart products
          const categories = [...new Set(cartProducts.map(item => item.category))]
          // Fetch products from each category
          const categoryPromises = categories.map(category =>
            safeFetch(`/api/products?category=${category}&limit=${Math.ceil(maxItems / categories.length)}`)
          )
          const results = await Promise.all(categoryPromises)
          products = results.flatMap(result => result.products) as Product[]
          // Exclude products already in the cart
          products = products.filter(p => !cartItemIds.includes(p.id)).slice(0, maxItems)
        } else {
          // Fallback: fetch trending/popular products
          const trendingData = await safeFetch(`/api/products?sort=rating&limit=${maxItems}`)
          products = trendingData.products as Product[]
        }

        setRecommendedProducts(products)
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Error fetching recommendations:", err)
          setError("Failed to load recommendations")
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecommendations()

    // Cleanup: abort any ongoing fetch requests if the component unmounts
    return () => controller.abort()
  }, [currentProductId, cartItemIds, maxItems])

  if (error) {
    return (
      <div className="mt-8 text-center text-gray-500">
        {error}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: maxItems }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 aspect-[4/5] rounded-lg mb-4" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (recommendedProducts.length === 0) {
    return null
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <ProductGrid
        products={recommendedProducts}
        showPagination={false}
        className="bg-gray-50 p-6 rounded-xl"
      />
    </div>
  )
}
