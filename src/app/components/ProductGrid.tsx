"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react"
import { useCart } from "../contexts/CartContext"

interface Product {
  id: string
  name: string
  price: number
  description: string
  category: string
  rating: number
  reviewCount: number
  stockStatus: string
  images: {
    id: string
    url: string
    alt: string
  }[]
  specifications: {
    [key: string]: string | undefined
  }
  shippingInfo: string
  sellerName: string
  sellerRating: number
}

interface ProductGridProps {
  products: Product[]
  itemsPerPage?: number
  showPagination?: boolean
  className?: string
}

export default function ProductGrid({ 
  products, 
  itemsPerPage = 12,
  showPagination = true,
  className = ""
}: ProductGridProps) {
  const [currentPage, setCurrentPage] = useState(1)
  
  // Calculate pagination
  const totalPages = Math.ceil(products.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProducts = products.slice(startIndex, endIndex)

  // Pagination handlers
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  return (
    <div className={className}>
      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {currentProducts.map((product) => (
          <div key={product.id} className="group bg-white p-4 rounded-lg shadow hover:shadow-xl transition duration-300 relative">
            <Link href={`/product/${product.id}`}>
              <div className="aspect-[4/5] relative rounded-lg overflow-hidden mb-4">
                <Image
                  src={product.images[0]?.url || "/placeholder.svg"}
                  alt={product.images[0]?.alt || product.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <h3 className="font-medium text-lg mb-2 line-clamp-2">{product.name}</h3>
              <div className="flex items-center justify-between">
                <p className="text-rose-500 font-semibold">${product.price.toFixed(2)}</p>
                <span className="text-sm text-gray-500">{product.category}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating)
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
                  <span className="text-sm text-gray-500">{product.rating}</span>
                </div>
                <span className="text-sm text-gray-500">({product.reviewCount})</span>
              </div>
              <div className="mt-2">
                <span className={`text-sm ${
                  product.stockStatus === "In Stock" 
                    ? "text-green-600" 
                    : "text-orange-500"
                }`}>
                  {product.stockStatus}
                </span>
              </div>
            </Link>
            <AddToCartButton product={product} />
          </div>
        ))}
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={previousPage}
            disabled={currentPage === 1}
            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent transition"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <span className="text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent transition"
            aria-label="Next page"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  )
}

function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
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
      className="absolute bottom-4 right-4 p-2 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors duration-300"
      aria-label="Add to cart"
    >
      <ShoppingCart className="w-5 h-5" />
    </button>
  )
}
