"use client"

import { CheckCircle2, Package2, ArrowRight, Home } from "lucide-react"
import Link from "next/link"
import { CartItem } from "../../contexts/CartContext"

interface OrderConfirmationProps {
  orderId: string
  items: CartItem[]
  total: number
  shippingInfo: {
    fullName: string
    address: string
    city: string
    state: string
    zipCode: string
  }
  estimatedDelivery?: string
}

export default function OrderConfirmation({
  orderId,
  items,
  total,
  shippingInfo,
  estimatedDelivery,
}: OrderConfirmationProps) {
  // Calculate estimated delivery date if not provided
  const deliveryDate = estimatedDelivery || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString()

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Thank You for Your Order!</h1>
        <p className="text-gray-600">
          Order #{orderId}
        </p>
      </div>

      {/* Order Details Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Order Details</h2>
        
        {/* Items List */}
        <div className="space-y-4 mb-6">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-lg relative overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-gray-500">Quantity: {item.quantity}</p>
              </div>
              <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total Paid</span>
            <span className="text-xl font-bold">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Shipping Information */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Package2 className="w-5 h-5 text-rose-500" />
          <h2 className="text-xl font-semibold">Shipping Information</h2>
        </div>
        
        <div className="space-y-2 text-gray-600">
          <p className="font-medium text-gray-900">{shippingInfo.fullName}</p>
          <p>{shippingInfo.address}</p>
          <p>{shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}</p>
        </div>

        <div className="mt-4 pt-4 border-t">
          <p className="text-gray-600">
            <span className="font-medium">Estimated Delivery:</span>{" "}
            {deliveryDate}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href={`/orders/${orderId}`}
          className="flex-1 inline-flex justify-center items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
        >
          Track Order <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/"
          className="flex-1 inline-flex justify-center items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Continue Shopping <Home className="w-4 h-4" />
        </Link>
      </div>

      {/* Email Notification */}
      <p className="text-center text-gray-500 mt-8">
        A confirmation email has been sent to your email address.
      </p>
    </div>
  )
}
