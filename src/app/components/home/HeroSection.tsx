"use client"

import { useEffect, useState, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { useAuthRedirect } from "@/app/hooks/useAuthRedirect"

interface SlideData {
  title: string
  subtitle: string
  description?: string
  buttonText: string
  buttonUrl: string
  secondaryButton?: {
    text: string
    url: string
  }
  backgroundImage: string
  overlayColor: string
  bestSellers?: {
    image: string
    name: string
  }[]
}

const slides: SlideData[] = [
  {
    title: "Transform Your Wedding Vision",
    subtitle: "Curated Collections for Your Perfect Day",
    description: "Discover premium decor pieces that make your celebration unforgettable",
    buttonText: "Shop Now",
    buttonUrl: "/products",
    secondaryButton: {
      text: "Start Selling",
      url: "#"
    },
    backgroundImage: "/images/hero/elegant-reception.jpg",
    overlayColor: "from-black/60",
    bestSellers: [
      {
        image: "/images/products/crystal-centerpiece.jpg",
        name: "Crystal Centerpiece"
      },
      {
        image: "/images/products/floral-arch.jpg",
        name: "Floral Arch"
      }
    ]
  },
  {
    title: "Exclusive Designer Collections",
    subtitle: "Just Arrived for Your Special Day",
    description: "Hand-picked pieces from top wedding designers",
    buttonText: "Explore New Arrivals",
    buttonUrl: "/products?category=new",
    backgroundImage: "/images/hero/luxury-setup.jpg",
    overlayColor: "from-rose-900/60",
    bestSellers: [
      {
        image: "/images/products/table-runner.jpg",
        name: "Silk Table Runner"
      },
      {
        image: "/images/products/candle-holders.jpg",
        name: "Crystal Candle Holders"
      }
    ]
  },
  {
    title: "Trending Wedding Themes",
    subtitle: "Most-Loved by Our Couples",
    description: "Get inspired by our most popular wedding decor themes",
    buttonText: "View Collections",
    buttonUrl: "/products?view=trending",
    backgroundImage: "/images/hero/garden-wedding.jpg",
    overlayColor: "from-gray-900/60",
    bestSellers: [
      {
        image: "/images/products/string-lights.jpg",
        name: "LED String Lights"
      },
      {
        image: "/images/products/lanterns.jpg",
        name: "Vintage Lanterns"
      }
    ]
  }
]

export const HeroSection = () => {
  const { handleStartSelling } = useAuthRedirect()
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
      className="relative h-[400px] overflow-hidden" 
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
              <div className="max-w-8xl mx-auto px-20 sm:px-24 lg:px-28 h-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-16">
                <div className="text-white space-y-6">
                  <div className="space-y-4">
                    <h2 
                      className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight animate-fade-in"
                      style={{
                        textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                        animation: "fadeSlideUp 0.8s ease-out forwards"
                      }}
                    >
                      {slide.title}
                    </h2>
                    <p 
                      className="text-xl sm:text-2xl font-medium leading-relaxed opacity-90"
                      style={{
                        animation: "fadeSlideUp 0.8s ease-out 0.2s forwards",
                        opacity: 0,
                        transform: "translateY(20px)"
                      }}
                    >
                      {slide.subtitle}
                    </p>
                    {slide.description && (
                      <p 
                        className="text-lg text-gray-100 leading-relaxed max-w-xl"
                        style={{
                          animation: "fadeSlideUp 0.8s ease-out 0.4s forwards",
                          opacity: 0,
                          transform: "translateY(20px)"
                        }}
                      >
                        {slide.description}
                      </p>
                    )}
                  </div>
                  <div 
                    className="flex gap-4"
                    style={{
                      animation: "fadeSlideUp 0.8s ease-out 0.6s forwards",
                      opacity: 0,
                      transform: "translateY(20px)"
                    }}
                  >
                    <Link 
                      href={slide.buttonUrl}
                      className="inline-block px-8 py-3 bg-rose-500 text-white rounded-full hover:bg-rose-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-lg font-medium"
                    >
                      {slide.buttonText}
                    </Link>
                    {slide.secondaryButton && (
                      <button 
                        onClick={handleStartSelling}
                        className="inline-block px-8 py-3 bg-white text-rose-500 rounded-full hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-lg font-medium"
                      >
                        {slide.secondaryButton.text}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

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
