"use client"

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  price: number
  image: string
  category: string
}

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Vintage Vases',
    price: 129,
    image: '/placeholder.svg',
    category: 'Decor'
  },
  {
    id: '2',
    name: 'Crystal Chandeliers',
    price: 299,
    image: '/placeholder.svg',
    category: 'Lighting'
  },
  {
    id: '3',
    name: 'Table Runners',
    price: 49,
    image: '/placeholder.svg',
    category: 'Decor'
  },
  {
    id: '4',
    name: 'Floral Arrangements',
    price: 199,
    image: '/placeholder.svg',
    category: 'Decor'
  },
  {
    id: '5',
    name: 'LED Curtains',
    price: 149,
    image: '/placeholder.svg',
    category: 'Lighting'
  },
  {
    id: '6',
    name: 'Rustic Signs',
    price: 79,
    image: '/placeholder.svg',
    category: 'Decor'
  }
]

export const PopularProducts = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')

  const filteredProducts = selectedCategory === 'All' 
    ? mockProducts
    : mockProducts.filter(product => product.category === selectedCategory)

  return (
    <section className="pt-2 pb-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Items</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                ${selectedCategory === 'All' 
                  ? 'bg-[#E35B96] text-white' 
                  : 'text-gray-600 hover:text-gray-900'}`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedCategory('Decor')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                ${selectedCategory === 'Decor' 
                  ? 'bg-[#E35B96] text-white' 
                  : 'text-gray-600 hover:text-gray-900'}`}
            >
              Decor
            </button>
            <button
              onClick={() => setSelectedCategory('Lighting')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                ${selectedCategory === 'Lighting' 
                  ? 'bg-[#E35B96] text-white' 
                  : 'text-gray-600 hover:text-gray-900'}`}
            >
              Lighting
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Link 
              key={product.id}
              href={`/product/${product.id}`}
              className="block bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition"
            >
              <div className="relative w-full" style={{ paddingBottom: '100%' }}> {/* 1:1 aspect ratio */}
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
                />
              </div>
              <div className="p-3">
                <h3 className="text-sm font-medium text-gray-900 truncate">{product.name}</h3>
                <p className="text-sm text-gray-900">${product.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PopularProducts
