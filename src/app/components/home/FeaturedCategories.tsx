"use client"

import { ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Category {
  name: string
  image: string
  count: string
  slug: string // Added for SEO-friendly URLs
}

const categories: Category[] = [
  { name: "Elegant Lighting", image: "/geometric-pattern.svg", count: "1,200+", slug: "elegant-lighting" },
  { name: "Rustic Furniture", image: "/geometric-pattern.svg", count: "950+", slug: "rustic-furniture" },
  { name: "Floral Arrangements", image: "/geometric-pattern.svg", count: "1,500+", slug: "floral-arrangements" },
  { name: "Vintage Accessories", image: "/geometric-pattern.svg", count: "800+", slug: "vintage-accessories" },
]

export const FeaturedCategories = () => {
  return (
    <section className="py-16" aria-labelledby="categories-heading">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 id="categories-heading" className="text-2xl font-semibold">Shop by Category</h2>
          <Link 
            href="/products" 
            className="text-rose-500 hover:text-rose-600 flex items-center gap-2 transition"
            aria-label="View all product categories"
          >
            View All <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
        <div 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          role="list"
          aria-label="Product categories"
        >
          {categories.map((category) => (
            <Link 
              key={category.slug}
              href={`/products/category/${category.slug}`}
              className="group focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 rounded-2xl"
              aria-label={`Browse ${category.name} category with ${category.count} items`}
            >
              <div className="aspect-[4/5] relative rounded-2xl overflow-hidden mb-4">
                <Image
                  src={category.image}
                  alt={`${category.name} category thumbnail`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-white font-medium text-lg">{category.name}</h3>
                  <p className="text-white/80 text-sm">{category.count} items</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturedCategories
