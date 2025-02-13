"use client"

import { ShieldCheck, Truck, Award } from 'lucide-react'

export const TrustElements = () => {
  return (
    <section className="bg-white border-y border-gray-100">
      {/* Money-back Guarantee Banner */}
      <div className="bg-rose-50 py-3">
        <p className="text-center text-rose-700 font-medium">
          Receive your items as described or get your money back
        </p>
      </div>

      {/* Trust Icons */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Verified Sellers */}
          <div className="flex items-center justify-center md:justify-start space-x-4">
            <div className="flex-shrink-0">
              <ShieldCheck className="w-10 h-10 text-rose-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Verified Sellers</h3>
              <p className="text-sm text-gray-600">Trusted and vetted vendors</p>
            </div>
          </div>

          {/* Quality Guarantee */}
          <div className="flex items-center justify-center md:justify-start space-x-4">
            <div className="flex-shrink-0">
              <Award className="w-10 h-10 text-rose-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Quality Guarantee</h3>
              <p className="text-sm text-gray-600">Premium wedding decor</p>
            </div>
          </div>

          {/* Free Shipping */}
          <div className="flex items-center justify-center md:justify-start space-x-4">
            <div className="flex-shrink-0">
              <Truck className="w-10 h-10 text-rose-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Free Shipping</h3>
              <p className="text-sm text-gray-600">On orders over $150</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TrustElements
