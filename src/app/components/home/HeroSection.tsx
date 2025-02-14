"use client"

import { useAuthRedirect } from "@/app/hooks/useAuthRedirect"

export const HeroSection = () => {
  const { handleStartSelling } = useAuthRedirect()
  return (
    <section className="w-full pt-4 pb-2">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column - Hero Content */}
        <div className="relative h-[400px] rounded-lg overflow-hidden">
          <div className="absolute inset-0">
            <div 
              className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center"
              role="img"
              aria-label="Wedding decoration background"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-pink-100/95 to-pink-50/85">
              {/* Floral Pattern */}
              <svg 
                className="absolute inset-0 w-full h-full opacity-20"
                viewBox="0 0 100 100" 
                preserveAspectRatio="none"
              >
                <pattern id="floral" x="0" y="0" width="0.1" height="0.1">
                  <path 
                    d="M50 10c-5 0-10 5-10 10s5 10 10 10 10-5 10-10-5-10-10-10zm0 20c-5 0-10 5-10 10s5 10 10 10 10-5 10-10-5-10-10-10zm-20-10c-5 0-10 5-10 10s5 10 10 10 10-5 10-10-5-10-10-10zm40 0c-5 0-10 5-10 10s5 10 10 10 10-5 10-10-5-10-10-10z" 
                    fill="#E35B96" 
                    opacity="0.3"
                  />
                </pattern>
                <rect x="0" y="0" width="100" height="100" fill="url(#floral)" />
              </svg>
              
              {/* Geometric Shapes */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -right-20 -top-20 w-60 h-60 bg-pink-200/20 rounded-full mix-blend-multiply" />
                <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-pink-300/20 rounded-full mix-blend-multiply" />
                <div className="absolute right-0 bottom-0 w-40 h-40 bg-pink-400/20 rotate-45 transform origin-center" />
              </div>
            </div>
          </div>
          
          <div className="relative h-full flex flex-col justify-center p-6">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-[1.1]">
            Find Your Perfect Wedding Decorations
          </h1>
          
          <h2 className="text-xl md:text-2xl text-gray-800 mt-4">
            Shop thousands of pre-loved wedding items
          </h2>
          
          <p className="text-base text-gray-700 mt-4">
            Join our community of newlyweds buying and selling wedding decorations, making dream weddings more affordable and sustainable.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <a 
              href="/products"
              className="h-12 flex items-center justify-center bg-[#E35B96] text-white rounded-full hover:bg-[#d14a85] transition px-8"
            >
              Shop Now
            </a>
            <button 
              onClick={handleStartSelling}
              className="h-12 flex items-center justify-center bg-white text-[#E35B96] rounded-full hover:bg-gray-100 transition px-8"
            >
              Start Selling
            </button>
          </div>
          </div>
        </div>

        {/* Right Column - Featured Collection */}
        <div className="relative h-[400px] rounded-lg overflow-hidden">
          <div className="absolute inset-0">
            <div 
              className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center"
              role="img"
              aria-label="Valentine's collection background"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-pink-100/95 to-pink-50/85">
              {/* Floral Pattern */}
              <svg 
                className="absolute inset-0 w-full h-full opacity-20"
                viewBox="0 0 100 100" 
                preserveAspectRatio="none"
              >
                <pattern id="floral2" x="0" y="0" width="0.1" height="0.1">
                  <path 
                    d="M50 10c-5 0-10 5-10 10s5 10 10 10 10-5 10-10-5-10-10-10zm0 20c-5 0-10 5-10 10s5 10 10 10 10-5 10-10-5-10-10-10zm-20-10c-5 0-10 5-10 10s5 10 10 10 10-5 10-10-5-10-10-10zm40 0c-5 0-10 5-10 10s5 10 10 10 10-5 10-10-5-10-10-10z" 
                    fill="#E35B96" 
                    opacity="0.3"
                  />
                </pattern>
                <rect x="0" y="0" width="100" height="100" fill="url(#floral2)" />
              </svg>
              
              {/* Geometric Shapes */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -left-20 -top-20 w-60 h-60 bg-pink-200/20 rounded-full mix-blend-multiply" />
                <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-pink-300/20 rounded-full mix-blend-multiply" />
                <div className="absolute left-0 bottom-0 w-40 h-40 bg-pink-400/20 rotate-45 transform origin-center" />
              </div>
            </div>
          </div>
          
          <div className="relative h-full flex flex-col justify-center p-6">
            <span className="text-[#E35B96] font-medium mb-4">Featured Collection</span>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Valentine's Day Special</h2>
            <p className="text-gray-700 mb-6">
              Discover our curated collection of romantic wedding decorations perfect for your Valentine's themed celebration. Save up to 40% on selected items.
            </p>
            <a 
              href="/products?collection=valentines"
              className="inline-flex items-center justify-center h-12 bg-white text-[#E35B96] rounded-full hover:bg-gray-100 transition px-8 w-fit"
            >
              Shop Collection
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
