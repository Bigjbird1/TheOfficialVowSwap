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
    async function fetchRecommendations() {
      try {
        setIsLoading(true)
        setError(null)

        // If we have a current product, fetch related products by category
        if (currentProductId) {
          const response = await fetch(`/api/products/${currentProductId}`)
          const currentProduct = await response.json()
          
          // Fetch products in the same category
          const categoryResponse = await fetch(`/api/products?category=${currentProduct.category}&limit=${maxItems + 1}`)
          const categoryData = await categoryResponse.json() as { products: Product[] }
          let products = categoryData.products
          
          // Remove the current product from recommendations if present
          products = products.filter((p: Product) => p.id !== currentProductId)
          
          // Limit to maxItems
          setRecommendedProducts(products.slice(0, maxItems))
        }
        // If we have cart items, fetch complementary products
        else if (cartItemIds?.length) {
          // Fetch full product data for cart items to get their categories
          const cartProductsPromises = cartItemIds.map(id =>
            fetch(`/api/products/${id}`).then(res => res.json())
          )
          const cartProducts = await Promise.all(cartProductsPromises)
          
          // Get unique categories from cart products
          const categories = [...new Set(cartProducts.map(item => item.category))]
          
          // Fetch products from related categories
          const promises = categories.map(category =>
            fetch(`/api/products?category=${category}&limit=${Math.ceil(maxItems / categories.length)}`)
              .then(res => res.json())
          )
          
          const results = await Promise.all(promises)
          const products = results.map(result => result.products).flat()
          
          // Remove products that are already in cart
          const filteredProducts = products.filter(
            (p: Product) => !cartItemIds.includes(p.id)
          )
          
          setRecommendedProducts(filteredProducts.slice(0, maxItems))
        }
        // Otherwise fetch trending/popular products
        else {
          const trendingResponse = await fetch(`/api/products?sort=rating&limit=${maxItems}`)
          const trendingData = await trendingResponse.json() as { products: Product[] }
          const products = trendingData.products
          setRecommendedProducts(products)
        }
      } catch (err) {
        setError("Failed to load recommendations")
        console.error("Error fetching recommendations:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecommendations()
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
          {[...Array(maxItems)].map((_, i) => (
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
