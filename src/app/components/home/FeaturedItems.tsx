import { ArrowRight } from "lucide-react"
import Link from "next/link"
import ProductGrid from "../ProductGrid"

// Types for better type safety
interface ProductImage {
  id: string
  url: string
  alt: string
}

interface Specifications {
  [key: string]: string
}

interface Product {
  id: string
  name: string
  price: number
  description: string
  category: string
  rating: number
  reviewCount: number
  stockStatus: string
  images: ProductImage[]
  specifications: Specifications
  shippingInfo: string
  sellerName: string
  sellerRating: number
}

// Mock data - In production, this would be fetched from an API
const items: Product[] = [
  {
    id: "1",
    name: "Crystal Chandelier",
    price: 299.99,
    description: "Elegant crystal chandelier perfect for wedding venues and grand entrances",
    category: "Lighting",
    rating: 4.5,
    reviewCount: 128,
    stockStatus: "In Stock",
    images: [
      { id: "1", url: "/placeholder.svg?height=500&width=400", alt: "Crystal Chandelier" }
    ],
    specifications: {
      "Dimensions": "24\" x 24\" x 28\"",
      "Material": "Crystal, Metal",
      "Style": "Elegant"
    },
    shippingInfo: "Free shipping on orders over $500",
    sellerName: "Elegant Decor Co.",
    sellerRating: 4.8
  },
  {
    id: "2",
    name: "Rustic Wooden Arch",
    price: 499.99,
    description: "Beautiful handcrafted wooden arch for ceremony backdrops",
    category: "Decorations",
    rating: 4.8,
    reviewCount: 95,
    stockStatus: "In Stock",
    images: [
      { id: "1", url: "/placeholder.svg?height=500&width=400", alt: "Rustic Wooden Arch" }
    ],
    specifications: {
      "Dimensions": "80\" x 60\" x 90\"",
      "Material": "Solid Wood",
      "Style": "Rustic"
    },
    shippingInfo: "Free shipping on orders over $500",
    sellerName: "Rustic Wedding Essentials",
    sellerRating: 4.9
  },
  {
    id: "3",
    name: "Elegant Table Decor",
    price: 89.99,
    description: "Complete table setting package for sophisticated wedding receptions",
    category: "Table Settings",
    rating: 4.2,
    reviewCount: 156,
    stockStatus: "In Stock",
    images: [
      { id: "1", url: "/placeholder.svg?height=500&width=400", alt: "Elegant Table Decor" }
    ],
    specifications: {
      "Material": "Mixed Materials",
      "Style": "Modern Elegant",
      "Pieces per Set": "12"
    },
    shippingInfo: "Standard shipping available",
    sellerName: "Luxe Wedding Collections",
    sellerRating: 4.5
  },
  {
    id: "4",
    name: "Vintage Mirror",
    price: 129.99,
    description: "Ornate vintage-style mirror for elegant wedding displays",
    category: "Decorations",
    rating: 4.6,
    reviewCount: 82,
    stockStatus: "Low Stock",
    images: [
      { id: "1", url: "/placeholder.svg?height=500&width=400", alt: "Vintage Mirror" }
    ],
    specifications: {
      "Dimensions": "36\" x 24\"",
      "Material": "Glass, Metal",
      "Style": "Vintage"
    },
    shippingInfo: "Careful handling shipping",
    sellerName: "Vintage Finds Co.",
    sellerRating: 4.7
  },
  {
    id: "5",
    name: "Floral Backdrop",
    price: 199.99,
    description: "Stunning artificial floral backdrop for picture-perfect moments",
    category: "Backdrops",
    rating: 4.7,
    reviewCount: 113,
    stockStatus: "In Stock",
    images: [
      { id: "1", url: "/placeholder.svg?height=500&width=400", alt: "Floral Backdrop" }
    ],
    specifications: {
      "Dimensions": "8ft x 8ft",
      "Material": "Artificial Flowers",
      "Style": "Romantic"
    },
    shippingInfo: "Free shipping on orders over $500",
    sellerName: "Floral Fantasy",
    sellerRating: 4.8
  },
  {
    id: "6",
    name: "Modern Centerpiece",
    price: 79.99,
    description: "Contemporary geometric centerpiece for modern wedding themes",
    category: "Table Settings",
    rating: 4.4,
    reviewCount: 67,
    stockStatus: "In Stock",
    images: [
      { id: "1", url: "/placeholder.svg?height=500&width=400", alt: "Modern Centerpiece" }
    ],
    specifications: {
      "Dimensions": "12\" x 12\" x 18\"",
      "Material": "Metal, Glass",
      "Style": "Modern"
    },
    shippingInfo: "Standard shipping available",
    sellerName: "Modern Wedding Co.",
    sellerRating: 4.6
  }
]

export const FeaturedItems = () => {
  return (
    <section className="py-16 bg-gray-50" aria-labelledby="trending-heading">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 id="trending-heading" className="text-2xl font-semibold">Trending Items</h2>
          <Link 
            href="/products" 
            className="text-rose-500 hover:text-rose-600 flex items-center gap-2 transition"
            aria-label="View all trending items"
          >
            View All <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
        {/* 
          TODO: Implement error boundary for production
          TODO: Add loading state when fetching from API
          TODO: Add error state UI for API failures
        */}
        <ProductGrid 
          products={items} 
          itemsPerPage={6} 
          showPagination={false}
        />
      </div>
    </section>
  )
}

export default FeaturedItems
