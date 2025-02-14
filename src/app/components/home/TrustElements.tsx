"use client"

import { ShieldCheck, Truck, Award } from 'lucide-react'

export const TrustElements = () => {
  return (
    <section className="relative h-[200px] flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-100/95 to-pink-50/85">
          {/* Floral Pattern */}
          <svg 
            className="absolute inset-0 w-full h-full opacity-20"
            viewBox="0 0 100 100" 
            preserveAspectRatio="none"
          >
            <pattern id="floral-trust" x="0" y="0" width="0.1" height="0.1">
              <path 
                d="M50 10c-5 0-10 5-10 10s5 10 10 10 10-5 10-10-5-10-10-10zm0 20c-5 0-10 5-10 10s5 10 10 10 10-5 10-10-5-10-10-10zm-20-10c-5 0-10 5-10 10s5 10 10 10 10-5 10-10-5-10-10-10zm40 0c-5 0-10 5-10 10s5 10 10 10 10-5 10-10-5-10-10-10z" 
                fill="#E35B96" 
                opacity="0.3"
              />
            </pattern>
            <rect x="0" y="0" width="100" height="100" fill="url(#floral-trust)" />
          </svg>
          
          {/* Geometric Shapes */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -right-20 -top-20 w-60 h-60 bg-pink-200/20 rounded-full mix-blend-multiply" />
            <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-pink-300/20 rounded-full mix-blend-multiply" />
            <div className="absolute right-0 bottom-0 w-40 h-40 bg-pink-400/20 rotate-45 transform origin-center" />
          </div>
        </div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-3 gap-4">
          {/* Verified Sellers */}
          <div className="flex items-center justify-center gap-4 backdrop-blur-sm bg-white/30 p-6 rounded-lg">
            <div className="flex-shrink-0">
              <ShieldCheck className="w-8 h-8 text-[#E35B96]" />
            </div>
            <div>
              <h3 className="text-base font-medium text-gray-900">Verified Sellers</h3>
              <p className="text-sm text-gray-600">Trusted and vetted vendors</p>
            </div>
          </div>

          {/* Quality Guarantee */}
          <div className="flex items-center justify-center gap-4 backdrop-blur-sm bg-white/30 p-6 rounded-lg">
            <div className="flex-shrink-0">
              <Award className="w-8 h-8 text-[#E35B96]" />
            </div>
            <div>
              <h3 className="text-base font-medium text-gray-900">Quality Guarantee</h3>
              <p className="text-sm text-gray-600">Premium wedding decor</p>
            </div>
          </div>

          {/* Free Shipping */}
          <div className="flex items-center justify-center gap-4 backdrop-blur-sm bg-white/30 p-6 rounded-lg">
            <div className="flex-shrink-0">
              <Truck className="w-8 h-8 text-[#E35B96]" />
            </div>
            <div>
              <h3 className="text-base font-medium text-gray-900">Free Shipping</h3>
              <p className="text-sm text-gray-600">On orders over $150</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TrustElements
