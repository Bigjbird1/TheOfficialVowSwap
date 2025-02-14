"use client"

import { ShieldCheck, Truck, Award } from 'lucide-react'

export const TrustElements = () => {
  return (
    <section className="bg-white h-[100px] flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-3 gap-4">
          {/* Verified Sellers */}
          <div className="flex items-center justify-center gap-4">
            <div className="flex-shrink-0">
              <ShieldCheck className="w-8 h-8 text-[#E35B96]" />
            </div>
            <div>
              <h3 className="text-base font-medium text-gray-900">Verified Sellers</h3>
              <p className="text-sm text-gray-600">Trusted and vetted vendors</p>
            </div>
          </div>

          {/* Quality Guarantee */}
          <div className="flex items-center justify-center gap-4">
            <div className="flex-shrink-0">
              <Award className="w-8 h-8 text-[#E35B96]" />
            </div>
            <div>
              <h3 className="text-base font-medium text-gray-900">Quality Guarantee</h3>
              <p className="text-sm text-gray-600">Premium wedding decor</p>
            </div>
          </div>

          {/* Free Shipping */}
          <div className="flex items-center justify-center gap-4">
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
