"use client"

import Image from "next/image"
import Link from "next/link"

export const HeroSection = () => {
  return (
    <section className="relative h-[600px]" aria-label="Hero section">
      <Image
        src="/placeholder.svg?height=600&width=1920"
        alt="Wedding decoration showcase"
        fill
        className="object-cover"
        priority
        sizes="(max-width: 768px) 100vw, 50vw"
      />
      <div className="absolute inset-0 bg-black bg-opacity-40">
        <div className="max-w-7xl mx-auto px-8 py-32">
          <div className="max-w-2xl text-white">
            <h1 className="text-5xl font-bold mb-4">Elevate Your Wedding Decor</h1>
            <p className="text-xl mb-8">
              Discover unique wedding decor items to make your special day unforgettable. Shop from trusted sellers and
              find everything you need in one place.
            </p>
            <div className="flex gap-4">
              <Link 
                href="/products" 
                className="px-8 py-3 bg-rose-500 text-white rounded-full hover:bg-rose-600 transform hover:scale-110 transition duration-300"
                aria-label="Browse our product collection"
              >
                Shop Now
              </Link>
              <Link 
                href="/sell" 
                className="px-8 py-3 bg-white text-gray-900 rounded-full hover:bg-gray-200 transform hover:scale-110 transition duration-300"
                aria-label="Start selling your wedding items"
              >
                Sell Your Items
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
