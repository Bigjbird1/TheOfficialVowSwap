"use client"

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

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
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Color</h2>
          <p className="text-lg text-gray-600">Find the perfect palette for your special day</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {colorSchemes.map((scheme, index) => (
            <div 
              key={scheme.name}
              className="group relative rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
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
                <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-all duration-300" />
              </div>

              {/* Color Swatches */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-white bg-opacity-90">
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
              </div>

              {/* Quick Shop Overlay */}
              <div 
                className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100"
                onClick={() => setSelectedScheme(scheme)}
              >
                <button className="bg-white text-gray-900 px-6 py-2 rounded-full hover:bg-gray-100 transform hover:scale-105 transition-all duration-300">
                  Quick Shop
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Shop Modal */}
        {selectedScheme && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">{selectedScheme.name}</h3>
                  <button
                    onClick={() => setSelectedScheme(null)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
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
                            className="ml-auto bg-rose-500 text-white px-4 py-2 rounded-full hover:bg-rose-600 transition-colors"
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
                    className="inline-block bg-gray-900 text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors"
                  >
                    View All Matching Items
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default ColorPalette
