"use client"

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  price: number
  image: string
  viewerCount: number
  stockCount: number
  isFavorited?: boolean
}

// Mock data - in production, this would come from an API
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Crystal Centerpiece',
    price: 129.99,
    image: '/placeholder.svg?height=300&width=300',
    viewerCount: 15,
    stockCount: 3
  },
  {
    id: '2',
    name: 'Floral Arch',
    price: 299.99,
    image: '/placeholder.svg?height=300&width=300',
    viewerCount: 24,
    stockCount: 5
  },
  {
    id: '3',
    name: 'Table Runner Set',
    price: 79.99,
    image: '/placeholder.svg?height=300&width=300',
    viewerCount: 18,
    stockCount: 8
  },
  {
    id: '4',
    name: 'LED String Lights',
    price: 49.99,
    image: '/placeholder.svg?height=300&width=300',
    viewerCount: 32,
    stockCount: 2
  }
]

export const PopularProducts = () => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId)
      } else {
        newFavorites.add(productId)
      }
      return newFavorites
    })
  }

  return (
    <section className="pt-6 pb-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Popular Right Now</h2>
          <select 
            className="border-2 border-gray-200 rounded-lg px-4 py-2 bg-white focus:outline-none focus:border-rose-500"
            aria-label="Sort products"
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="newest">Newest</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockProducts.map((product) => (
            <Link 
              key={product.id}
              href={`/product/${product.id}`}
              className="block relative bg-white rounded-lg shadow-md overflow-hidden group"
            >
              {/* Product Image */}
              <div className="relative aspect-square">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                />
                
                {/* Quick View Button Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      setSelectedProduct(product)
                    }}
                    className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-gray-900 px-6 py-2 rounded-full hover:bg-gray-100"
                  >
                    Quick View
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                <p className="text-xl font-bold text-gray-900 mt-2">${product.price}</p>
                
                {/* Real-time Indicators */}
                <div className="mt-2 space-y-2 text-sm">
                  <p className="text-gray-600 flex items-center">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    {product.viewerCount} people viewing
                  </p>
                  {product.stockCount <= 5 && (
                    <p className="text-rose-600 font-medium">
                      Only {product.stockCount} left!
                    </p>
                  )}
                </div>

                {/* Favorite Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    toggleFavorite(product.id)
                  }}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors"
                  aria-label={favorites.has(product.id) ? "Remove from favorites" : "Add to favorites"}
                >
                  <svg 
                    className={`w-6 h-6 ${favorites.has(product.id) ? 'text-rose-500 fill-current' : 'text-gray-400 stroke-current'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                    />
                  </svg>
                </button>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick View Modal */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">{selectedProduct.name}</h3>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="text-gray-400 hover:text-gray-500"
                    aria-label="Close modal"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative aspect-square">
                    <Image
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <p className="text-2xl font-bold text-gray-900 mb-4">
                      ${selectedProduct.price}
                    </p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        {selectedProduct.viewerCount} people viewing this right now
                      </div>
                      
                      {selectedProduct.stockCount <= 5 && (
                        <p className="text-rose-600 font-medium">
                          Only {selectedProduct.stockCount} left in stock - order soon!
                        </p>
                      )}
                      
                      <button className="w-full bg-rose-500 text-white px-6 py-3 rounded-full hover:bg-rose-600 transition-colors">
                        Add to Cart
                      </button>
                      
                      <button 
                        onClick={() => toggleFavorite(selectedProduct.id)}
                        className="w-full border-2 border-gray-200 px-6 py-3 rounded-full hover:border-gray-300 transition-colors flex items-center justify-center gap-2"
                      >
                        <svg 
                          className={`w-5 h-5 ${favorites.has(selectedProduct.id) ? 'text-rose-500 fill-current' : 'text-gray-400 stroke-current'}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                          />
                        </svg>
                        {favorites.has(selectedProduct.id) ? 'Saved to Favorites' : 'Save to Favorites'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default PopularProducts
