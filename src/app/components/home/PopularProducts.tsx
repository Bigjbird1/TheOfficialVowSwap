"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import ProductQuickView from '../ProductQuickView'
import { Product as ProductType } from '../../types'

const ProductCard = ({ product, onQuickViewClick }: { product: ProductType; onQuickViewClick: (product: ProductType) => void }) => {
  const [isLoading, setIsLoading] = useState(true)

  // Helper function to determine if a URL is absolute
  const isAbsoluteURL = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }

  return (
    <Link href={`/product/${product.id}`}>
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
            src={product.images?.[0]?.url ? (isAbsoluteURL(product.images[0].url) ? product.images[0].url : `/api/products/image/${product.images[0].id}`) : '/window.svg'}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
            onLoad={() => setIsLoading(false)}
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
    </Link>
  )
}

export const PopularProducts = () => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [isScrolling, setIsScrolling] = useState(false)
  const [startX, setStartX] = useState(0)
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter((product: ProductType) => product.category === selectedCategory)

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#E35B96] border-t-transparent"></div>
      </div>
    );
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
