"use client"

import { ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import ProductGrid from "./components/ProductGrid"

// Types
interface Category {
  name: string
  image: string
  count: string
}

interface Testimonial {
  name: string
  image: string
  quote: string
}

// Hero Section Component
const HeroSection = () => {
  return (
    <section className="relative h-[600px]">
      <Image
        src="/placeholder.svg?height=600&width=1920"
        alt="Wedding decoration showcase"
        fill
        className="object-cover"
        priority
        sizes="(max-width: 768px) 100vw, 50vw"
      />
      <div className="absolute inset-0 bg-black bg-opacity-40">
        <div className="max-w-7xl mx-auto px-8 py-32">
          <div className="max-w-2xl text-white">
            <h1 className="text-5xl font-bold mb-4">Elevate Your Wedding Decor</h1>
            <p className="text-xl mb-8">
              Discover unique wedding decor items to make your special day unforgettable. Shop from trusted sellers and
              find everything you need in one place.
            </p>
            <div className="flex gap-4">
              <Link href="/products" aria-label="Shop Now" className="px-8 py-3 bg-rose-500 text-white rounded-full hover:bg-rose-600 transform hover:scale-110 transition duration-300">
                Shop Now
              </Link>
              <button aria-label="Sell Your Items" className="px-8 py-3 bg-white text-gray-900 rounded-full hover:bg-gray-200 transform hover:scale-110 transition duration-300">
                Sell Your Items
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Featured Categories Component
const FeaturedCategories = () => {
  const categories: Category[] = [
    { name: "Elegant Lighting", image: "/placeholder.svg?height=500&width=400", count: "1,200+" },
    { name: "Rustic Furniture", image: "/placeholder.svg?height=500&width=400", count: "950+" },
    { name: "Floral Arrangements", image: "/placeholder.svg?height=500&width=400", count: "1,500+" },
    { name: "Vintage Accessories", image: "/placeholder.svg?height=500&width=400", count: "800+" },
  ]

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold">Shop by Category</h2>
          <Link href="/products" className="text-rose-500 hover:text-rose-600 flex items-center gap-2 transition">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div key={category.name} className="group cursor-pointer">
              <div className="aspect-[4/5] relative rounded-2xl overflow-hidden mb-4">
                <Image
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-white font-medium text-lg">{category.name}</h3>
                  <p className="text-white/80 text-sm">{category.count} items</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Featured Items Component
const FeaturedItems = () => {
  const items = [
    { id: "1", name: "Crystal Chandelier", image: "/placeholder.svg?height=500&width=400", price: 299, rating: 4.5 },
    { id: "2", name: "Rustic Wooden Arch", image: "/placeholder.svg?height=500&width=400", price: 499, rating: 4.8 },
    { id: "3", name: "Elegant Table Decor", image: "/placeholder.svg?height=500&width=400", price: 89, rating: 4.2 },
    { id: "4", name: "Vintage Mirror", image: "/placeholder.svg?height=500&width=400", price: 129, rating: 4.6 },
    { id: "5", name: "Floral Backdrop", image: "/placeholder.svg?height=500&width=400", price: 199, rating: 4.7 },
    { id: "6", name: "Modern Centerpiece", image: "/placeholder.svg?height=500&width=400", price: 79, rating: 4.4 }
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold">Trending Items</h2>
          <Link href="/products" className="text-rose-500 hover:text-rose-600 flex items-center gap-2 transition">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <ProductGrid 
          products={items} 
          itemsPerPage={6} 
          showPagination={false}
        />
      </div>
    </section>
  )
}

// Testimonials Component
const Testimonials = () => {
  const testimonials: Testimonial[] = [
    {
      name: "Emily & James",
      image: "/placeholder.svg?height=200&width=200",
      quote: "Our wedding decor was a dream come true thanks to the unique items we found here!",
    },
    {
      name: "Sarah & Michael",
      image: "/placeholder.svg?height=200&width=200",
      quote: "A vast selection and seamless experience made our planning stress-free.",
    },
    {
      name: "Anna & Robert",
      image: "/placeholder.svg?height=200&width=200",
      quote: "The quality and variety of decor options truly elevated our wedding day.",
    },
  ]

  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-8">
        <h2 className="text-2xl font-semibold text-center mb-8">What Couples Are Saying</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="p-6 border rounded-xl shadow-sm hover:shadow-lg transition">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <Image
                  src={testimonial.image || "/placeholder.svg"}
                  alt={testimonial.name}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <p className="text-gray-600 italic mb-4 text-center">"{testimonial.quote}"</p>
              <h3 className="text-center font-semibold">{testimonial.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Newsletter Signup Component
const NewsletterSignup = () => {
  return (
    <section className="bg-rose-500 py-12">
      <div className="max-w-7xl mx-auto px-8 text-center">
        <h2 className="text-2xl font-semibold text-white mb-4">Stay Updated on the Latest Decor Trends</h2>
        <p className="text-white mb-6">
          Sign up for our newsletter to get exclusive deals and wedding decor inspiration.
        </p>
        <form className="flex flex-col sm:flex-row justify-center max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
          <label htmlFor="newsletter-email" className="sr-only">Email address</label>
          <input id="newsletter-email"
            type="email"
            placeholder="Enter your email"
            className="px-4 py-2 flex-1 rounded-l-full focus:outline-none"
            required
          />
          <button
            type="submit"
            className="px-6 py-2 bg-white text-rose-500 rounded-r-full hover:bg-gray-100 transition"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  )
}

// Footer Component
const Footer = () => {
  return (
    <footer className="border-t">
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <span className="text-sm text-gray-600">Secure Payments</span>
            <span className="text-gray-600">•</span>
            <span className="text-sm text-gray-600">Buyer Protection</span>
            <span className="text-gray-600">•</span>
            <span className="text-sm text-gray-600">24/7 Support</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="text-gray-600 hover:text-gray-900 transition">
              About Us
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition">
              Contact
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition">
              Terms
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition">
              Privacy
            </a>
          </div>
        </div>
        <div className="mt-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} VowSwap. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

export default function MarketplaceHome() {
  return (
    <div className="min-h-screen bg-white">
      <main>
        <HeroSection />
        <FeaturedCategories />
        <FeaturedItems />
        <Testimonials />
        <NewsletterSignup />
      </main>
      <Footer />
    </div>
  )
}
