"use client"

import ProductGrid from "../components/ProductGrid"

// This is temporary mock data - in a real app, this would come from an API
const products = [
  {
    id: "1",
    name: "Crystal Chandelier",
    image: "/placeholder.svg?height=500&width=400",
    price: 299,
    category: "Lighting",
    rating: 4.5
  },
  {
    id: "2",
    name: "Rustic Wooden Arch",
    image: "/placeholder.svg?height=500&width=400",
    price: 499,
    category: "Decorations",
    rating: 4.8
  },
  {
    id: "3",
    name: "Elegant Table Decor",
    image: "/placeholder.svg?height=500&width=400",
    price: 89,
    category: "Table Settings",
    rating: 4.2
  },
  {
    id: "4",
    name: "Vintage Mirror",
    image: "/placeholder.svg?height=500&width=400",
    price: 129,
    category: "Decorations",
    rating: 4.6
  },
  {
    id: "5",
    name: "Floral Backdrop",
    image: "/placeholder.svg?height=500&width=400",
    price: 199,
    category: "Backdrops",
    rating: 4.7
  },
  {
    id: "6",
    name: "Modern Centerpiece",
    image: "/placeholder.svg?height=500&width=400",
    price: 79,
    category: "Table Settings",
    rating: 4.4
  },
  {
    id: "7",
    name: "String Light Curtain",
    image: "/placeholder.svg?height=500&width=400",
    price: 149,
    category: "Lighting",
    rating: 4.9
  },
  {
    id: "8",
    name: "Gold Table Runner",
    image: "/placeholder.svg?height=500&width=400",
    price: 39,
    category: "Table Settings",
    rating: 4.3
  },
  {
    id: "9",
    name: "Vintage Candle Holders",
    image: "/placeholder.svg?height=500&width=400",
    price: 69,
    category: "Decorations",
    rating: 4.6
  },
  {
    id: "10",
    name: "Rose Gold Photo Frame",
    image: "/placeholder.svg?height=500&width=400",
    price: 45,
    category: "Decorations",
    rating: 4.5
  },
  {
    id: "11",
    name: "LED Dance Floor",
    image: "/placeholder.svg?height=500&width=400",
    price: 899,
    category: "Lighting",
    rating: 4.8
  },
  {
    id: "12",
    name: "Silk Flower Wall",
    image: "/placeholder.svg?height=500&width=400",
    price: 299,
    category: "Backdrops",
    rating: 4.7
  },
  {
    id: "13",
    name: "Crystal Table Numbers",
    image: "/placeholder.svg?height=500&width=400",
    price: 29,
    category: "Table Settings",
    rating: 4.4
  },
  {
    id: "14",
    name: "Vintage Easel",
    image: "/placeholder.svg?height=500&width=400",
    price: 89,
    category: "Decorations",
    rating: 4.3
  },
  {
    id: "15",
    name: "Fairy Light Curtain",
    image: "/placeholder.svg?height=500&width=400",
    price: 129,
    category: "Lighting",
    rating: 4.6
  }
]

export default function ProductsPage() {
  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-4">All Wedding Decor</h1>
        <p className="text-gray-600">
          Browse our collection of beautiful wedding decorations and find the perfect pieces for your special day.
        </p>
      </div>
      
      <ProductGrid products={products} />
    </div>
  )
}
