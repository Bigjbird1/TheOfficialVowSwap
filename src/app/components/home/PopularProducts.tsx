"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

interface Product {
  id: string
  name: string
  price: number
  image: string
  category: string
  isNew?: boolean
  isPopular?: boolean
}

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Vintage Vases',
    price: 129,
    image: '/placeholder.svg',
    category: 'Decor',
    isNew: true
  },
  {
    id: '2',
    name: 'Crystal Chandeliers',
    price: 299,
    image: '/placeholder.svg',
    category: 'Lighting',
    isPopular: true
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
    category: 'Decor',
    isNew: true
  },
  {
    id: '5',
    name: 'LED Curtains',
    price: 149,
    image: '/placeholder.svg',
    category: 'Lighting',
    isPopular: true
  },
  {
    id: '6',
    name: 'Rustic Signs',
    price: 79,
    image: '/placeholder.svg',
    category: 'Decor'
  }
]

const ProductCard = ({ product }: { product: Product }) => {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="group"
    >
      <Link 
        href={`/product/${product.id}`}
        className="block bg-white rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
      >
        <div className="relative">
          {/* Skeleton loader */}
          {isLoading && (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse" />
          )}
          
          <div className="relative w-full" style={{ paddingBottom: '100%' }}>
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
              onLoadingComplete={() => setIsLoading(false)}
            />
          </div>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-2">
            {product.isNew && (
              <span className="px-2 py-1 text-xs font-medium bg-[#E35B96] text-white rounded-full">
                New
              </span>
            )}
            {product.isPopular && (
              <span className="px-2 py-1 text-xs font-medium bg-[#FFC107] text-white rounded-full">
                Popular
              </span>
            )}
          </div>

          {/* Quick view button */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <button className="px-4 py-2 bg-white text-[#E35B96] rounded-full text-sm font-medium transform scale-95 hover:scale-100 transition-transform duration-300">
              Quick View
            </button>
          </div>
        </div>

        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-[#E35B96] transition-colors duration-300">
            {product.name}
          </h3>
          <p className="text-sm text-gray-900 mt-1 font-medium">
            ${product.price}
          </p>
        </div>
      </Link>
    </motion.div>
  )
}

export const PopularProducts = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [isScrolling, setIsScrolling] = useState(false)
  const [startX, setStartX] = useState(0)

  const filteredProducts = selectedCategory === 'All' 
    ? mockProducts
    : mockProducts.filter(product => product.category === selectedCategory)

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsScrolling(true)
    setStartX(e.pageX - e.currentTarget.offsetLeft)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isScrolling) return
    e.preventDefault()
    const x = e.pageX - e.currentTarget.offsetLeft
    const walk = (x - startX) * 2
    e.currentTarget.scrollLeft = e.currentTarget.scrollLeft - walk
  }

  const handleMouseUp = () => {
    setIsScrolling(false)
  }

  return (
    <section className="pt-2 pb-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <motion.h2 
            className="text-2xl font-bold text-gray-900 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Popular Items
          </motion.h2>

          {/* Horizontal scrollable category filters */}
          <div 
            className="flex gap-4 overflow-x-auto pb-4 cursor-grab active:cursor-grabbing scrollbar-hide"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {['All', 'Decor', 'Lighting'].map((category) => (
              <motion.button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap
                  ${selectedCategory === category 
                    ? 'bg-gradient-to-r from-[#E35B96] to-[#FF8FB1] text-white shadow-lg' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </div>

        <AnimatePresence>
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            layout
          >
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}

export default PopularProducts
