"use client"

import { useEffect, useState, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"

interface SlideData {
  title: string
  subtitle: string
  buttonText: string
  buttonUrl: string
  secondaryButton?: {
    text: string
    url: string
  }
  backgroundImage: string
  overlayColor: string
}

const slides: SlideData[] = [
  {
    title: "Wedding Season Deals",
    subtitle: "Up to 40% off on premium decor collections",
    buttonText: "Shop Deals",
    buttonUrl: "/deals",
    secondaryButton: {
      text: "Start Selling",
      url: "/seller/onboarding"
    },
    backgroundImage: "/placeholder.svg?height=600&width=1920",
    overlayColor: "from-black/60"
  },
  {
    title: "New Arrivals",
    subtitle: "Just landed: Exclusive designer collections",
    buttonText: "Discover Now",
    buttonUrl: "/new-arrivals",
    backgroundImage: "/placeholder.svg?height=600&width=1920",
    overlayColor: "from-rose-900/60"
  },
  {
    title: "Trending Items",
    subtitle: "See what other couples are loving",
    buttonText: "View Trending",
    buttonUrl: "/trending",
    backgroundImage: "/placeholder.svg?height=600&width=1920",
    overlayColor: "from-gray-900/60"
  }
]

export const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const nextSlide = useCallback(() => {
    setIsTransitioning(true)
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }, [])

  const prevSlide = useCallback(() => {
    setIsTransitioning(true)
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }, [])

  const goToSlide = useCallback((index: number) => {
    setIsTransitioning(true)
    setCurrentSlide(index)
  }, [])

  // Auto-rotate slides
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000)
    return () => clearInterval(timer)
  }, [nextSlide])

  // Reset transition state
  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => setIsTransitioning(false), 500)
      return () => clearTimeout(timer)
    }
  }, [isTransitioning])

  return (
    <section 
      className="relative h-[300px] md:h-[350px] lg:h-[400px] overflow-hidden" 
      aria-label="Featured promotions carousel"
    >
      {/* Slides */}
      <div className="relative h-full">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out
              ${currentSlide === index ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            aria-hidden={currentSlide !== index}
          >
            {/* Background Image */}
            <Image
              src={slide.backgroundImage}
              alt=""
              fill
              className="object-cover"
              priority={index === 0}
              sizes="100vw"
              quality={90}
            />

            {/* Content Overlay */}
            <div 
              className={`absolute inset-0 bg-gradient-to-r ${slide.overlayColor} to-transparent`}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
                <div className="max-w-2xl text-white">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 tracking-tight">
                    {slide.title}
                  </h2>
                  <p className="text-base sm:text-lg mb-4 leading-relaxed opacity-90">
                    {slide.subtitle}
                  </p>
                  <div className="flex gap-4">
                    <Link 
                      href={slide.buttonUrl}
                      className="inline-block px-6 py-2 bg-rose-500 text-white rounded-full hover:bg-rose-600 transform hover:scale-105 transition duration-300 shadow-lg hover:shadow-xl"
                    >
                      {slide.buttonText}
                    </Link>
                    {slide.secondaryButton && (
                      <Link 
                        href={slide.secondaryButton.url}
                        className="inline-block px-6 py-2 bg-white text-rose-500 rounded-full hover:bg-gray-100 transform hover:scale-105 transition duration-300 shadow-lg hover:shadow-xl"
                      >
                        {slide.secondaryButton.text}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
        aria-label="Previous slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
        aria-label="Next slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300
              ${currentSlide === index 
                ? 'bg-white w-4' 
                : 'bg-white/50 hover:bg-white/75'}`}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={currentSlide === index}
          />
        ))}
      </div>
    </section>
  )
}

export default HeroSection
