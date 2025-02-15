"use client"

import { useAuthRedirect } from "@/app/hooks/useAuthRedirect"
import { ArrowRight, Star, DollarSign, Clock, ShieldCheck } from 'lucide-react'

const sellerMetrics = {
  activeSellers: "2,500+",
  itemsSold: "50,000+",
  averageRating: "4.8",
  satisfaction: "98%"
}

const benefits = [
  {
    title: "Competitive Commission",
    description: "Keep up to 85% of your sales with our seller-friendly commission structure",
    icon: DollarSign
  },
  {
    title: "Quick Setup",
    description: "Start selling in minutes with our streamlined onboarding process",
    icon: Clock
  },
  {
    title: "Seller Protection",
    description: "Secure payments and fraud protection for peace of mind",
    icon: ShieldCheck
  },
  {
    title: "Quality Recognition",
    description: "Earn badges and priority placement for exceptional service",
    icon: Star
  }
]

const quickStartSteps = [
  {
    number: "01",
    title: "Create Account",
    description: "Sign up and verify your email"
  },
  {
    number: "02",
    title: "List Products",
    description: "Upload items with our easy-to-use tools"
  },
  {
    number: "03",
    title: "Start Selling",
    description: "Reach thousands of engaged couples"
  }
]

export const SellerSection = () => {
  const { handleStartSelling } = useAuthRedirect()

  return (
    <section className="py-16 bg-gradient-to-b from-white to-rose-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Sell With VowSwap</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join our community of successful wedding decor sellers and reach couples planning their perfect day
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="text-3xl font-bold text-rose-500 mb-2">{sellerMetrics.activeSellers}</div>
            <div className="text-sm text-gray-600">Active Sellers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-rose-500 mb-2">{sellerMetrics.itemsSold}</div>
            <div className="text-sm text-gray-600">Items Sold</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-rose-500 mb-2">{sellerMetrics.averageRating}</div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-rose-500 mb-2">{sellerMetrics.satisfaction}</div>
            <div className="text-sm text-gray-600">Seller Satisfaction</div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {benefits.map((benefit) => {
            const Icon = benefit.icon
            return (
              <div 
                key={benefit.title}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-rose-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            )
          })}
        </div>

        {/* Quick Start Guide */}
        <div className="bg-white rounded-2xl p-8 shadow-xl mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Quick Start Guide</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {quickStartSteps.map((step) => (
              <div key={step.number} className="relative">
                <div className="text-4xl font-bold text-rose-100 mb-4">{step.number}</div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h4>
                <p className="text-gray-600">{step.description}</p>
                {step.number !== "03" && (
                  <ArrowRight className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-gray-300" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={handleStartSelling}
            className="inline-flex items-center px-8 py-3 bg-rose-500 text-white rounded-full hover:bg-rose-600 transform hover:scale-105 transition-all duration-300 text-lg font-medium shadow-lg hover:shadow-xl"
          >
            Start Selling Today
            <ArrowRight className="ml-2 w-5 h-5" />
          </button>
          <p className="mt-4 text-gray-600">
            No subscription fees. Only pay when you make a sale.
          </p>
        </div>
      </div>
    </section>
  )
}

export default SellerSection
