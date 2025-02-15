"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import ProductQuickView from '../ProductQuickView'
import { Product as ProductType } from '../../types'

const mockProducts: ProductType[] = [
  {
    id: '1',
    name: 'Vintage Vases',
    price: 129,
    description: 'Beautiful vintage vases for your wedding decor.',
    category: 'Decor',
    rating: 4,
    reviewCount: 12,
    stockStatus: 'In Stock',
    images: [{ id: '1', url: '/placeholder.svg', alt: 'Vintage Vases' }],
    specifications: {
      material: 'Ceramic',
      height: '10 inches',
    },
    shippingInfo: 'Ships within 2-3 business days',
    sellerName: 'Vintage Finds',
    sellerRating: 5,
  },
  {
    id: '2',
    name: 'Crystal Chandeliers',
    price: 299,
    description: 'Elegant crystal chandeliers to add sparkle to your event.',
    category: 'Lighting',
    rating: 5,
    reviewCount: 25,
    stockStatus: 'In Stock',
    images: [{ id: '2', url: '/placeholder.svg', alt: 'Crystal Chandeliers' }],
    specifications: {
      material: 'Crystal',
      height: '24 inches',
    },
    shippingInfo: 'Ships within 5-7 business days',
    sellerName: 'Elegant Lighting',
    sellerRating: 4,
  },
  {
    id: '3',
    name: 'Table Runners',
    price: 49,
    description: 'Stylish table runners to enhance your table settings.',
    category: 'Decor',
    rating: 4,
    reviewCount: 8,
    stockStatus: 'In Stock',
    images: [{ id: '3', url: '/placeholder.svg', alt: 'Table Runners' }],
    specifications: {
      material: 'Linen',
      length: '108 inches',
    },
    shippingInfo: 'Ships within 1-2 business days',
    sellerName: 'Table Decor',
    sellerRating: 4,
  },
  {
    id: '4',
    name: 'Floral Arrangements',
    price: 199,
    description: 'Stunning floral arrangements for a touch of elegance.',
    category: 'Decor',
    rating: 5,
    reviewCount: 18,
    stockStatus: 'In Stock',
    images: [{ id: '4', url: '/placeholder.svg', alt: 'Floral Arrangements' }],
    specifications: {
      material: 'Silk Flowers',
      height: '15 inches',
    },
    shippingInfo: 'Ships within 3-5 business days',
    sellerName: 'Floral Designs',
    sellerRating: 5,
  },
  {
    id: '5',
    name: 'LED Curtains',
    price: 149,
    description: 'Magical LED curtains to create a dreamy atmosphere.',
    category: 'Lighting',
    rating: 4,
    reviewCount: 15,
    stockStatus: 'In Stock',
    images: [{ id: '5', url: '/placeholder.svg', alt: 'LED Curtains' }],
    specifications: {
      material: 'LED Lights',
      length: '10 feet',
    },
    shippingInfo: 'Ships within 2-4 business days',
    sellerName: 'Lighting Magic',
    sellerRating: 4,
  },
  {
    id: '6',
    name: 'Rustic Signs',
    price: 79,
    description: 'Charming rustic signs to add a personal touch.',
    category: 'Decor',
    rating: 3,
    reviewCount: 5,
    stockStatus: 'In Stock',
    images: [{ id: '6', url: '/placeholder.svg', alt: 'Rustic Signs' }],
    specifications: {
      material: 'Wood',
      width: '20 inches',
    },
    shippingInfo: 'Ships within 1-3 business days',
    sellerName: 'Rustic Charm',
    sellerRating: 3,
  },
];

const ProductCard = ({ product, onQuickViewClick }: { product: ProductType; onQuickViewClick: (product: ProductType) => void }) => {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="group bg-white rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="relative">
        {/* Skeleton loader */}
        {isLoading && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse" />
        )}

        <div className="relative w-full" style={{ paddingBottom: '100%' }}>
          <Image
            src={product.images[0].url}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
            onLoadingComplete={() => setIsLoading(false)}
          />
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-2">
          {/* Removed isNew and isPopular badges */}
        </div>

        {/* Quick view button */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickViewClick(product)
            }}
            className="px-4 py-2 bg-white text-[#E35B96] rounded-full text-sm font-medium transform scale-95 hover:scale-100 transition-transform duration-300">
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
    </motion.div>
  )
}

export const PopularProducts = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [isScrolling, setIsScrolling] = useState(false)
  const [startX, setStartX] = useState(0)
    const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null); // State for Quick View


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

    const handleQuickViewClick = (product: ProductType) => {
    setSelectedProduct(product);
  };

  const handleCloseQuickView = () => {
    setSelectedProduct(null);
  };

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
              <ProductCard key={product.id} product={product} onQuickViewClick={handleQuickViewClick} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
            {/* Conditionally render the Quick View modal */}
      {selectedProduct && (
        <ProductQuickView product={selectedProduct} onClose={handleCloseQuickView} />
      )}
    </section>
  )
}

export default PopularProducts
