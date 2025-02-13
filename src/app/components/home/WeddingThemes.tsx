"use client"

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface ThemeItem {
  name: string
  price: number
  image: string
}

interface WeddingTheme {
  name: string
  description: string
  image: string
  popularItems: ThemeItem[]
  features: string[]
  accent: string
}

const themes: WeddingTheme[] = [
  {
    name: "Rustic Charm",
    description: "Blend natural elements with vintage touches for a warm, inviting atmosphere",
    image: "/images/themes/rustic.jpg",
    popularItems: [
      {
        name: "Mason Jar Lights",
        price: 34.99,
        image: "/images/products/mason-lights.jpg"
      },
      {
        name: "Wooden Table Numbers",
        price: 24.99,
        image: "/images/products/wood-numbers.jpg"
      },
      {
        name: "Burlap Table Runner",
        price: 29.99,
        image: "/images/products/burlap-runner.jpg"
      }
    ],
    features: [
      "Natural wood elements",
      "Vintage-inspired decor",
      "Warm lighting options",
      "Textured fabrics"
    ],
    accent: "bg-amber-100"
  },
  {
    name: "Modern Minimalist",
    description: "Clean lines and sophisticated simplicity for a contemporary celebration",
    image: "/images/themes/modern.jpg",
    popularItems: [
      {
        name: "Geometric Centerpiece",
        price: 45.99,
        image: "/images/products/geometric-center.jpg"
      },
      {
        name: "Acrylic Table Numbers",
        price: 39.99,
        image: "/images/products/acrylic-numbers.jpg"
      },
      {
        name: "Metal Candle Holders",
        price: 49.99,
        image: "/images/products/metal-holders.jpg"
      }
    ],
    features: [
      "Geometric shapes",
      "Metallic accents",
      "Minimalist design",
      "Contemporary materials"
    ],
    accent: "bg-gray-100"
  },
  {
    name: "Vintage Romance",
    description: "Timeless elegance with classic details and soft, romantic touches",
    image: "/images/themes/vintage.jpg",
    popularItems: [
      {
        name: "Antique Frame Set",
        price: 59.99,
        image: "/images/products/antique-frames.jpg"
      },
      {
        name: "Pearl Centerpiece",
        price: 44.99,
        image: "/images/products/pearl-center.jpg"
      },
      {
        name: "Lace Table Runner",
        price: 34.99,
        image: "/images/products/lace-runner.jpg"
      }
    ],
    features: [
      "Antique finishes",
      "Lace details",
      "Soft color palette",
      "Classic ornaments"
    ],
    accent: "bg-rose-50"
  },
  {
    name: "Bohemian Spirit",
    description: "Free-spirited and eclectic with rich textures and organic elements",
    image: "/images/themes/bohemian.jpg",
    popularItems: [
      {
        name: "Macramé Backdrop",
        price: 89.99,
        image: "/images/products/macrame.jpg"
      },
      {
        name: "Pampas Grass Set",
        price: 49.99,
        image: "/images/products/pampas.jpg"
      },
      {
        name: "Rattan Lanterns",
        price: 39.99,
        image: "/images/products/rattan-lanterns.jpg"
      }
    ],
    features: [
      "Natural textures",
      "Eclectic patterns",
      "Earth tones",
      "Organic materials"
    ],
    accent: "bg-orange-50"
  },
  {
    name: "Classic Elegance",
    description: "Sophisticated and refined with timeless design elements",
    image: "/images/themes/classic.jpg",
    popularItems: [
      {
        name: "Crystal Candelabra",
        price: 129.99,
        image: "/images/products/candelabra.jpg"
      },
      {
        name: "Silver Charger Plates",
        price: 79.99,
        image: "/images/products/charger-plates.jpg"
      },
      {
        name: "Silk Table Runner",
        price: 54.99,
        image: "/images/products/silk-runner.jpg"
      }
    ],
    features: [
      "Crystal accents",
      "Fine linens",
      "Traditional elements",
      "Luxurious details"
    ],
    accent: "bg-blue-50"
  }
]

export const WeddingThemes = () => {
  const [selectedTheme, setSelectedTheme] = useState<WeddingTheme | null>(null)

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Wedding Themes</h2>
          <p className="text-lg text-gray-600">Discover your perfect wedding style</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {themes.map((theme) => (
            <div
              key={theme.name}
              className={`rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ${theme.accent}`}
            >
              {/* Theme Image */}
              <div className="relative h-64">
                <Image
                  src={theme.image}
                  alt={theme.name}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{theme.name}</h3>
                  <p className="text-white/90">{theme.description}</p>
                </div>
              </div>

              {/* Theme Features */}
              <div className="p-6">
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Key Features:</h4>
                  <ul className="space-y-2">
                    {theme.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 text-rose-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setSelectedTheme(theme)}
                    className="text-rose-500 font-medium hover:text-rose-600 transition-colors"
                  >
                    View Collection
                  </button>
                  <Link
                    href={`/products?theme=${theme.name.toLowerCase()}`}
                    className="bg-rose-500 text-white px-4 py-2 rounded-full hover:bg-rose-600 transition-colors"
                  >
                    Shop Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Theme Details Modal */}
        {selectedTheme && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">{selectedTheme.name}</h3>
                  <button
                    onClick={() => setSelectedTheme(null)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Theme Preview */}
                  <div>
                    <div className="relative h-80 rounded-lg overflow-hidden mb-4">
                      <Image
                        src={selectedTheme.image}
                        alt={selectedTheme.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <p className="text-gray-600">{selectedTheme.description}</p>
                  </div>

                  {/* Popular Items */}
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">Popular Items in this Theme</h4>
                    <div className="space-y-4">
                      {selectedTheme.popularItems.map((item, index) => (
                        <div key={index} className="flex items-center space-x-4 p-3 rounded-lg bg-gray-50">
                          <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-grow">
                            <h5 className="font-medium text-gray-900">{item.name}</h5>
                            <p className="text-rose-500 font-semibold">${item.price}</p>
                          </div>
                          <Link
                            href={`/products/${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                            className="bg-white text-rose-500 px-4 py-2 rounded-full border border-rose-500 hover:bg-rose-50 transition-colors"
                          >
                            View
                          </Link>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6">
                      <Link
                        href={`/products?theme=${selectedTheme.name.toLowerCase()}`}
                        className="block w-full bg-rose-500 text-white text-center px-6 py-3 rounded-full hover:bg-rose-600 transition-colors"
                      >
                        Shop All {selectedTheme.name} Items
                      </Link>
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

export default WeddingThemes
