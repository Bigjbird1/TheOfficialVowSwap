"use client"

import { useAuthRedirect } from "@/app/hooks/useAuthRedirect"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export const HeroSection = () => {
  const { handleStartSelling } = useAuthRedirect()
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <section className="w-full pt-4 pb-2 relative">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column - Hero Content */}
        <motion.div 
          className="relative h-[400px] rounded-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute inset-0 transform" style={{ transform: `translateY(${scrollY * 0.3}px)` }}>
            <div 
              className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center transition-transform duration-300"
              role="img"
              aria-label="Wedding decoration background"
            />
            <div className="absolute inset-0 backdrop-blur-sm bg-gradient-to-r from-pink-100/80 to-pink-50/70">
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
          
          <div className="relative h-full flex flex-col justify-center p-6 z-10">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold text-gray-900 leading-[1.1]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Find Your Perfect Wedding Decorations
            </motion.h1>
            
            <motion.h2 
              className="text-xl md:text-2xl text-gray-800 mt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Shop thousands of pre-loved wedding items
            </motion.h2>
            
            <motion.p 
              className="text-base text-gray-700 mt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Join our community of newlyweds buying and selling wedding decorations, making dream weddings more affordable and sustainable.
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <motion.a 
                href="/products"
                className="h-12 flex items-center justify-center bg-gradient-to-r from-[#E35B96] to-[#FF8FB1] text-white rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300 px-8 relative overflow-hidden group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10">Shop Now</span>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </motion.a>
              <motion.button 
                onClick={handleStartSelling}
                className="h-12 flex items-center justify-center bg-white text-[#E35B96] rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300 px-8 relative overflow-hidden group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10">Start Selling</span>
                <div className="absolute inset-0 bg-[#E35B96] opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              </motion.button>
              <motion.a 
                href="/registry/create"
                className="h-12 flex items-center justify-center bg-gradient-to-r from-[#FFC107] to-[#FFD54F] text-white font-bold rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300 px-8 relative overflow-hidden group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10">Create Your Registry</span>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </motion.a>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Column - Featured Collection */}
        <motion.div 
          className="relative h-[400px] rounded-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="absolute inset-0 transform" style={{ transform: `translateY(${scrollY * 0.3}px)` }}>
            <div 
              className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center transition-transform duration-300"
              role="img"
              aria-label="Valentine's collection background"
            />
            <div className="absolute inset-0 backdrop-blur-sm bg-gradient-to-r from-pink-100/80 to-pink-50/70">
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
          
          <div className="relative h-full flex flex-col justify-center p-6 z-10">
            <motion.span 
              className="text-[#E35B96] font-medium mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Featured Collection
            </motion.span>
            <motion.h2 
              className="text-2xl font-bold text-gray-900 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              Valentine's Day Special
            </motion.h2>
            <motion.p 
              className="text-gray-700 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              Discover our curated collection of romantic wedding decorations perfect for your Valentine's themed celebration. Save up to 40% on selected items.
            </motion.p>
            <motion.a 
              href="/products?collection=valentines"
              className="inline-flex items-center justify-center h-12 bg-gradient-to-r from-white to-gray-50 text-[#E35B96] rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300 px-8 w-fit group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10">Shop Collection</span>
              <div className="absolute inset-0 bg-[#E35B96] opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-full"></div>
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default HeroSection
