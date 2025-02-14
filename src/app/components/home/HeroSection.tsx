"use client"

import { useAuthRedirect } from "@/app/hooks/useAuthRedirect"

export const HeroSection = () => {
  const { handleStartSelling } = useAuthRedirect()
  return (
    <section className="w-full p-4">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column - Hero Content */}
        <div className="relative h-[500px] rounded-lg overflow-hidden">
          <div className="absolute inset-0">
            <div 
              className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center"
              role="img"
              aria-label="Wedding decoration background"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-pink-100/95 to-pink-50/85" />
          </div>
          
          <div className="relative h-full flex flex-col justify-center p-8">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-[1.1]">
            Find Your Perfect Wedding Decorations
          </h1>
          
          <h2 className="text-2xl md:text-3xl text-gray-800 mt-6">
            Shop thousands of pre-loved wedding items
          </h2>
          
          <p className="text-base md:text-lg text-gray-700 mt-6">
            Join our community of newlyweds buying and selling wedding decorations, making dream weddings more affordable and sustainable.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
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
        <div className="relative h-[500px] rounded-lg overflow-hidden">
          <div className="absolute inset-0">
            <div 
              className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center"
              role="img"
              aria-label="Valentine's collection background"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-pink-100/95 to-pink-50/85" />
          </div>
          
          <div className="relative h-full flex flex-col justify-center p-8">
            <span className="text-[#E35B96] font-medium mb-4">Featured Collection</span>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Valentine's Day Special</h2>
            <p className="text-gray-700 mb-8">
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
