"use client"

import { useState } from "react"
import { ShoppingBag, Tag, Truck } from "lucide-react"
import { CartItem } from "../../contexts/CartContext"

interface OrderSummaryProps {
  items: CartItem[]
  subtotal: number
  onApplyDiscount: (code: string) => Promise<void>
  onProceedToPayment: () => void
}

export default function OrderSummary({
  items,
  subtotal,
  onApplyDiscount,
  onProceedToPayment,
}: OrderSummaryProps) {
  const [discountCode, setDiscountCode] = useState("")
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false)
  const [discountError, setDiscountError] = useState<string | null>(null)

  // Estimated values (these would typically come from backend calculations)
  const shippingCost = subtotal > 100 ? 0 : 9.99
  const taxRate = 0.08 // 8% tax rate
  const taxAmount = subtotal * taxRate
  const total = subtotal + shippingCost + taxAmount

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return

    setIsApplyingDiscount(true)
    setDiscountError(null)

    try {
      await onApplyDiscount(discountCode)
      setDiscountCode("") // Clear the input on success
    } catch (error) {
      setDiscountError("Invalid discount code")
    } finally {
      setIsApplyingDiscount(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <ShoppingBag className="w-6 h-6" />
          Order Summary
        </h2>

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

        {/* Discount Code Section */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-5 h-5 text-rose-500" />
            <h3 className="font-medium">Have a Discount Code?</h3>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              placeholder="Enter code"
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <button
              onClick={handleApplyDiscount}
              disabled={isApplyingDiscount || !discountCode.trim()}
              className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply
            </button>
          </div>
          {discountError && (
            <p className="mt-2 text-sm text-red-600">{discountError}</p>
          )}
        </div>

        {/* Shipping Information */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Truck className="w-5 h-5 text-rose-500" />
            <h3 className="font-medium">Shipping</h3>
          </div>
          <p className="text-gray-600 text-sm">
            {shippingCost === 0
              ? "Free Shipping on orders over $100!"
              : "Standard Shipping (3-5 business days)"}
          </p>
        </div>

        {/* Cost Breakdown */}
        <div className="space-y-2 text-sm border-t pt-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Shipping</span>
            <span>${shippingCost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Estimated Tax</span>
            <span>${taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg pt-2 border-t">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
        <button
          onClick={onProceedToPayment}
          className="w-full py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
        >
          Proceed to Payment
        </button>
      </div>
    </div>
  )
}
