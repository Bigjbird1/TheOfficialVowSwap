"use client"

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

interface ColorScheme {
  name: string
  colors: string[]
  image: string
  accessories: {
    name: string
    image: string
    price: number
  }[]
}

const colorSchemes: ColorScheme[] = [
  {
    name: "Classic Romance",
    colors: ["#F8C3DC", "#FFFFFF", "#FFD700", "#C0C0C0"],
    image: "/images/palettes/classic-romance.jpg",
    accessories: [
      {
        name: "Gold Table Runner",
        image: "/images/products/gold-runner.jpg",
        price: 29.99
      },
      {
        name: "Silver Candle Holders",
        image: "/images/products/silver-holders.jpg",
        price: 39.99
      }
    ]
  },
  {
    name: "Garden Fresh",
    colors: ["#90EE90", "#FFFFFF", "#FFB6C1", "#E6E6FA"],
    image: "/images/palettes/garden-fresh.jpg",
    accessories: [
      {
        name: "Floral Centerpiece",
        image: "/images/products/floral-centerpiece.jpg",
        price: 49.99
      },
      {
        name: "Lavender Votives",
        image: "/images/products/lavender-votives.jpg",
        price: 24.99
      }
    ]
  },
  {
    name: "Ocean Breeze",
    colors: ["#87CEEB", "#E0FFFF", "#48D1CC", "#FFFFFF"],
    image: "/images/palettes/ocean-breeze.jpg",
    accessories: [
      {
        name: "Seashell Decor Set",
        image: "/images/products/seashell-set.jpg",
        price: 34.99
      },
      {
        name: "Aqua Table Runners",
        image: "/images/products/aqua-runner.jpg",
        price: 27.99
      }
    ]
  },
  {
    name: "Autumn Sunset",
    colors: ["#FFA500", "#8B4513", "#DAA520", "#F4A460"],
    image: "/images/palettes/autumn-sunset.jpg",
    accessories: [
      {
        name: "Copper Lanterns",
        image: "/images/products/copper-lantern.jpg",
        price: 44.99
      },
      {
        name: "Rustic Wood Accents",
        image: "/images/products/wood-accents.jpg",
        price: 32.99
      }
    ]
  }
]

export const ColorPalette = () => {
  const [selectedScheme, setSelectedScheme] = useState<ColorScheme | null>(null)

  return (
    <section className="py-12 bg-gradient-to-b from-white to-pink-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-[#E35B96] to-[#FF8FB1] inline-block text-transparent bg-clip-text">
            Shop by Color
          </h2>
          <p className="text-lg text-gray-600">Find the perfect palette for your special day</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {colorSchemes.map((scheme, index) => (
            <motion.div 
              key={scheme.name}
              className="group relative rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              {/* Scheme Image */}
              <div className="relative h-64">
                <Image
                  src={scheme.image}
                  alt={scheme.name}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/10 group-hover:opacity-80 transition-all duration-300" />
              </div>

              {/* Color Swatches */}
              <motion.div 
                className="absolute bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm"
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{scheme.name}</h3>
                <div className="flex space-x-2">
                  {scheme.colors.map((color, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Quick Shop Overlay */}
              <motion.div 
                className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100"
                onClick={() => setSelectedScheme(scheme)}
              >
                <motion.button 
                  className="bg-gradient-to-r from-[#E35B96] to-[#FF8FB1] text-white px-6 py-2 rounded-full transform hover:scale-105 transition-all duration-300 hover:shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Quick Shop
                </motion.button>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Quick Shop Modal */}
        <AnimatePresence>
          {selectedScheme && (
            <motion.div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">{selectedScheme.name}</h3>
                    <motion.button
                      onClick={() => setSelectedScheme(null)}
                      className="text-gray-400 hover:text-gray-500 transition-colors duration-300"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Color Scheme Preview */}
                    <div>
                      <div className="relative h-64 rounded-lg overflow-hidden mb-4">
                        <Image
                          src={selectedScheme.image}
                          alt={selectedScheme.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex space-x-3">
                        {selectedScheme.colors.map((color, i) => (
                          <div
                            key={i}
                            className="w-12 h-12 rounded-full border-2 border-white shadow-md"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Matching Accessories */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Matching Accessories</h4>
                      <div className="space-y-4">
                        {selectedScheme.accessories.map((item, index) => (
                          <div key={index} className="flex items-center space-x-4">
                            <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900">{item.name}</h5>
                              <p className="text-rose-500 font-semibold">${item.price}</p>
                            </div>
                            <Link
                              href={`/products?category=accessories&color=${selectedScheme.name.toLowerCase()}`}
                              className="ml-auto bg-gradient-to-r from-[#E35B96] to-[#FF8FB1] text-white px-4 py-2 rounded-full hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                            >
                              Shop Now
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 text-center">
                    <Link
                      href={`/products?palette=${selectedScheme.name.toLowerCase()}`}
                      className="inline-block bg-gradient-to-r from-gray-900 to-gray-800 text-white px-8 py-3 rounded-full hover:shadow-lg transition-all duration-300 transform hover:scale-105 hover:from-gray-800 hover:to-gray-700"
                    >
                      View All Matching Items
                    </Link>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

export default ColorPalette
