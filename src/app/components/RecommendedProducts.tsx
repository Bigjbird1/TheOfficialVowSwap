"use client"

import { useEffect, useState } from "react"
import { Product } from "../types"
import ProductGrid from "./ProductGrid"

// Fallback dummy products
const dummyProducts: Product[] = [
  {
    id: "dummy-1",
    name: "Elegant Wedding Dress",
    description: "Beautiful white wedding dress with lace details",
    price: 1299.99,
    category: "Dresses",
    rating: 4.8,
    reviewCount: 128,
    stockStatus: "In Stock",
    images: [{
      id: "dress-img-1",
      url: "/dummy-dress-1.jpg",
      alt: "Elegant white wedding dress with lace details"
    }],
    specifications: {
      "Material": "Premium Lace and Silk",
      "Style": "A-Line",
      "Size": "Available in all sizes"
    },
    shippingInfo: "Free shipping worldwide",
    sellerName: "Elegant Bridal Boutique",
    sellerRating: 4.9
  },
  {
    id: "dummy-2",
    name: "Crystal Wedding Tiara",
    description: "Stunning crystal and pearl tiara",
    price: 299.99,
    category: "Accessories",
    rating: 4.9,
    reviewCount: 89,
    stockStatus: "In Stock",
    images: [{
      id: "tiara-img-1",
      url: "/dummy-tiara-1.jpg",
      alt: "Crystal and pearl wedding tiara"
    }],
    specifications: {
      "Material": "Crystal and Pearl",
      "Style": "Classic",
      "Size": "One size fits all"
    },
    shippingInfo: "Secure premium shipping",
    sellerName: "Royal Wedding Accessories",
    sellerRating: 4.8
  },
  {
    id: "dummy-3",
    name: "Wedding Invitation Set",
    description: "Premium wedding invitation set with RSVP cards",
    price: 149.99,
    category: "Stationery",
    rating: 4.7,
    reviewCount: 156,
    stockStatus: "In Stock",
    images: [{
      id: "invitation-img-1",
      url: "/dummy-invitation-1.jpg",
      alt: "Premium wedding invitation set"
    }],
    specifications: {
      "Material": "Premium Card Stock",
      "Style": "Elegant",
      "Includes": "Invitation, RSVP, Thank You cards"
    },
    shippingInfo: "Express shipping available",
    sellerName: "Luxury Stationery Co",
    sellerRating: 4.7
  },
  {
    id: "dummy-4",
    name: "Wedding Bouquet",
    description: "Fresh flower wedding bouquet with roses and peonies",
    price: 199.99,
    category: "Flowers",
    rating: 4.9,
    reviewCount: 203,
    stockStatus: "In Stock",
    images: [{
      id: "bouquet-img-1",
      url: "/dummy-bouquet-1.jpg",
      alt: "Fresh flower wedding bouquet"
    }],
    specifications: {
      "Flowers": "Roses and Peonies",
      "Style": "Classic Round",
      "Size": "Standard bridal size"
    },
    shippingInfo: "Same-day local delivery",
    sellerName: "Blooming Brides Florist",
    sellerRating: 4.9
  }
]

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
          // Use dummy products instead of showing error
          setRecommendedProducts(dummyProducts.slice(0, maxItems))
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecommendations()

    // Cleanup: abort any ongoing fetch requests if the component unmounts
    return () => controller.abort()
  }, [currentProductId, cartItemIds, maxItems])


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
