"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"

// Props interface for the HeroSection component
interface HeroSectionProps {
  /** Title text for the hero section */
  title?: string;
  /** Subtitle/description text */
  subtitle?: string;
  /** Background image URL */
  backgroundImage?: string;
  /** Text for the primary CTA button */
  primaryButtonText?: string;
  /** Text for the secondary CTA button */
  secondaryButtonText?: string;
  /** URL for the primary CTA button */
  primaryButtonUrl?: string;
  /** URL for the secondary CTA button */
  secondaryButtonUrl?: string;
}

export const HeroSection = ({
  title = "Elevate Your Wedding Decor",
  subtitle = "Discover unique wedding decor items to make your special day unforgettable. Shop from trusted sellers and find everything you need in one place.",
  backgroundImage = "/placeholder.svg?height=600&width=1920",
  primaryButtonText = "Shop Now",
  secondaryButtonText = "Sell Your Items",
  primaryButtonUrl = "/products",
  secondaryButtonUrl = "/sell"
}: HeroSectionProps) => {
  // State to handle image loading error
  const [imgError, setImgError] = useState(false);
  // State to control animation timing
  const [isVisible, setIsVisible] = useState(false);

  // Trigger entrance animation after component mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Fallback image in case the provided image fails to load
  const fallbackImage = "/placeholder.svg?height=600&width=1920";

  return (
    <section 
      className="relative h-[600px] md:h-[700px] lg:h-[800px]" 
      aria-label="Hero section"
      role="banner"
    >
      {/* Background Image with Next.js Image optimization */}
      <Image
        src={imgError ? fallbackImage : backgroundImage}
        alt="Wedding decoration showcase"
        fill
        className="object-cover"
        priority
        sizes="100vw"
        onError={() => setImgError(true)}
        quality={90}
      />

      {/* Overlay with content */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-40"
        aria-hidden="true"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div 
            className={`max-w-2xl text-white transform transition-all duration-1000 ease-out
              ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
          >
            {/* Hero Title */}
            <h1 
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 tracking-tight"
              id="hero-title"
            >
              {title}
            </h1>

            {/* Hero Subtitle */}
            <p 
              className="text-lg sm:text-xl mb-8 leading-relaxed opacity-90"
              id="hero-subtitle"
            >
              {subtitle}
            </p>

            {/* Call-to-action buttons */}
            <div 
              className="flex flex-col sm:flex-row gap-4"
              role="group"
              aria-labelledby="hero-cta"
            >
              <Link 
                href={primaryButtonUrl}
                className="px-8 py-3 bg-rose-500 text-white text-center rounded-full hover:bg-rose-600 transform hover:scale-105 transition duration-300 shadow-lg hover:shadow-xl"
                aria-label={`${primaryButtonText} - Browse our product collection`}
              >
                {primaryButtonText}
              </Link>
              <Link 
                href={secondaryButtonUrl}
                className="px-8 py-3 bg-white text-gray-900 text-center rounded-full hover:bg-gray-100 transform hover:scale-105 transition duration-300 shadow-lg hover:shadow-xl"
                aria-label={`${secondaryButtonText} - Start selling your wedding items`}
              >
                {secondaryButtonText}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
