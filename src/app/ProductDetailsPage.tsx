"use client"

import { useState } from "react"
import Image from "next/image"
import { Heart, Share2, ShoppingBag, Star, Truck, Shield, ArrowLeft, ArrowRight, Check } from "lucide-react"
import { useCart } from "./contexts/CartContext"

interface ProductImage {
  id: number
  url: string
  alt: string
}

interface ProductDetails {
  id: number
  name: string
  price: number
  description: string
  category: string
  rating: number
  reviewCount: number
  stockStatus: "In Stock" | "Low Stock" | "Out of Stock"
  images: ProductImage[]
  specifications: Record<string, string>
  shippingInfo: string
  sellerName: string
  sellerRating: number
}

interface ProductDetailsPageProps {
  id: string
  product: ProductDetails
}

const ProductDetailsPage = ({ id, product }: ProductDetailsPageProps) => {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [showAddedNotification, setShowAddedNotification] = useState(false)
  const { addItem } = useCart()

  const handleAddToCart = () => {
    addItem({
      id: id,
      name: product.name,
      price: product.price,
      image: product.images[0].url
    })
    setShowAddedNotification(true)
    setTimeout(() => setShowAddedNotification(false), 2000)
  }

  // Image Gallery Navigation
  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % product.images.length)
  }

  const previousImage = () => {
    setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length)
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-xl overflow-hidden">
            <Image
              src={product.images[selectedImage].url}
              alt={product.images[selectedImage].alt}
              fill
              className="object-cover"
              priority
            />
            <button
              onClick={previousImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg"
              aria-label="Previous image"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg"
              aria-label="Next image"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setSelectedImage(index)}
                className={`relative aspect-square rounded-lg overflow-hidden ${
                  selectedImage === index ? "ring-2 ring-rose-500" : ""
                }`}
              >
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-semibold mb-2">{product.name}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-600">
                {product.rating} ({product.reviewCount} reviews)
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold">${product.price}</div>
            <div className="flex items-center gap-4">
              <button
                aria-label="Add to favorites"
                className="p-2 rounded-full hover:bg-gray-100 transition"
              >
                <Heart className="w-6 h-6" />
              </button>
              <button
                aria-label="Share product"
                className="p-2 rounded-full hover:bg-gray-100 transition"
              >
                <Share2 className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-gray-600">{product.description}</p>
            
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded-full text-sm font-medium
                ${product.stockStatus === "In Stock" ? "bg-green-100 text-green-800" :
                  product.stockStatus === "Low Stock" ? "bg-yellow-100 text-yellow-800" :
                  "bg-red-100 text-red-800"}`}>
                {product.stockStatus}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-full">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-gray-100 transition"
                >
                  -
                </button>
                <span className="px-4">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 hover:bg-gray-100 transition"
                >
                  +
                </button>
              </div>
              <button 
                onClick={handleAddToCart}
                disabled={product.stockStatus === "Out of Stock"}
                className={`flex-1 flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-full hover:from-rose-600 hover:to-purple-700 transform hover:scale-105 transition duration-300 relative
                  ${product.stockStatus === "Out of Stock" ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {showAddedNotification ? (
                  <>
                    <Check className="w-5 h-5" />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    Add to Cart
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="border-t pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-600">Free Shipping Available</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-600">Buyer Protection</span>
              </div>
            </div>
            <p className="text-sm text-gray-600">{product.shippingInfo}</p>
          </div>

          <div className="border-t pt-6">
            <h2 className="font-semibold mb-4">Specifications</h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key}>
                  <dt className="text-sm text-gray-600">{key}</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Sold by {product.sellerName}</h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.sellerRating)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.sellerRating} Seller Rating
                  </span>
                </div>
              </div>
              <button className="px-6 py-2 border rounded-full hover:bg-gray-50 transition">
                View Store
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailsPage
