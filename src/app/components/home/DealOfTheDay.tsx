"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface DealProduct {
  id: string
  name: string
  description: string
  originalPrice: number
  salePrice: number
  image: string
  endTime: string
}

// Mock data - in production, this would come from an API
const dealProduct: DealProduct = {
  id: "deal-1",
  name: "Luxury Crystal Chandelier",
  description: "Transform your venue with this stunning crystal chandelier. Perfect for creating an elegant atmosphere for your special day.",
  originalPrice: 599.99,
  salePrice: 399.99,
  image: "/window.svg",
  endTime: "2025-02-09T23:59:59" // 24 hours from now
}

export const DealOfTheDay = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  // Calculate savings percentage
  const savingsPercent = Math.round(
    ((dealProduct.originalPrice - dealProduct.salePrice) / dealProduct.originalPrice) * 100
  )

  // Update countdown timer
  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(dealProduct.endTime).getTime() - new Date().getTime()
      
      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [dealProduct.endTime])

  // Format time unit with leading zero
  const formatTimeUnit = (unit: number) => unit.toString().padStart(2, '0')

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Deal of the Day</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-gray-50 rounded-2xl overflow-hidden shadow-lg">
          {/* Product Image */}
          <div className="relative aspect-square lg:aspect-auto">
            <Image
              src={dealProduct.image}
              alt={dealProduct.name}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
              priority
            />
            {/* Savings Badge */}
            <div className="absolute top-4 left-4 bg-rose-500 text-white px-4 py-2 rounded-full">
              Save {savingsPercent}%
            </div>
          </div>

          {/* Product Details */}
          <div className="p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {dealProduct.name}
              </h3>
              <p className="text-gray-600 mb-6">
                {dealProduct.description}
              </p>

              {/* Price Display */}
              <div className="mb-6">
                <p className="text-3xl font-bold text-gray-900">
                  ${dealProduct.salePrice}
                  <span className="ml-2 text-lg text-gray-500 line-through">
                    ${dealProduct.originalPrice}
                  </span>
                </p>
              </div>

              {/* Countdown Timer */}
              <div className="bg-gray-100 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-600 mb-2">Time Left:</p>
                <div className="flex space-x-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatTimeUnit(timeLeft.hours)}
                    </div>
                    <div className="text-xs text-gray-500">Hours</div>
                  </div>
                  <div className="text-2xl font-bold text-gray-400">:</div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatTimeUnit(timeLeft.minutes)}
                    </div>
                    <div className="text-xs text-gray-500">Minutes</div>
                  </div>
                  <div className="text-2xl font-bold text-gray-400">:</div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatTimeUnit(timeLeft.seconds)}
                    </div>
                    <div className="text-xs text-gray-500">Seconds</div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <button className="w-full bg-rose-500 text-white px-8 py-4 rounded-full hover:bg-rose-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
              Shop Now
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default DealOfTheDay
