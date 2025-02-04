"use client"

import { useState } from "react"
import { useCart } from "../contexts/CartContext"
import { X } from "lucide-react"

interface CheckoutProps {
  isOpen: boolean
  onClose: () => void
}

type CheckoutStep = "shipping" | "payment" | "review"

interface ShippingInfo {
  fullName: string
  email: string
  address: string
  city: string
  state: string
  zipCode: string
}

interface PaymentInfo {
  cardNumber: string
  expiryDate: string
  cvv: string
  nameOnCard: string
}

export default function Checkout({ isOpen, onClose }: CheckoutProps) {
  const { items, total } = useCart()
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("shipping")
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  })
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    nameOnCard: "",
  })

  if (!isOpen) return null

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentStep("payment")
  }

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentStep("review")
  }

  const handlePlaceOrder = async () => {
    // TODO: Implement order submission to backend
    alert("Order placed successfully!")
    onClose()
  }

  const renderShippingForm = () => (
    <form onSubmit={handleShippingSubmit} className="space-y-4">
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <input
          type="text"
          id="fullName"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
          value={shippingInfo.fullName}
          onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="email"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
          value={shippingInfo.email}
          onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
        />
      </div>
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
          Address
        </label>
        <input
          type="text"
          id="address"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
          value={shippingInfo.address}
          onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
            City
          </label>
          <input
            type="text"
            id="city"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
            value={shippingInfo.city}
            onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700">
            State
          </label>
          <input
            type="text"
            id="state"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
            value={shippingInfo.state}
            onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
          />
        </div>
      </div>
      <div>
        <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
          ZIP Code
        </label>
        <input
          type="text"
          id="zipCode"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
          value={shippingInfo.zipCode}
          onChange={(e) => setShippingInfo({ ...shippingInfo, zipCode: e.target.value })}
        />
      </div>
      <button
        type="submit"
        className="w-full bg-rose-500 text-white py-3 rounded-full hover:bg-rose-600 transition"
      >
        Continue to Payment
      </button>
    </form>
  )

  const renderPaymentForm = () => (
    <form onSubmit={handlePaymentSubmit} className="space-y-4">
      <div>
        <label htmlFor="nameOnCard" className="block text-sm font-medium text-gray-700">
          Name on Card
        </label>
        <input
          type="text"
          id="nameOnCard"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
          value={paymentInfo.nameOnCard}
          onChange={(e) => setPaymentInfo({ ...paymentInfo, nameOnCard: e.target.value })}
        />
      </div>
      <div>
        <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
          Card Number
        </label>
        <input
          type="text"
          id="cardNumber"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
          value={paymentInfo.cardNumber}
          onChange={(e) => setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
            Expiry Date
          </label>
          <input
            type="text"
            id="expiryDate"
            required
            placeholder="MM/YY"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
            value={paymentInfo.expiryDate}
            onChange={(e) => setPaymentInfo({ ...paymentInfo, expiryDate: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">
            CVV
          </label>
          <input
            type="text"
            id="cvv"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
            value={paymentInfo.cvv}
            onChange={(e) => setPaymentInfo({ ...paymentInfo, cvv: e.target.value })}
          />
        </div>
      </div>
      <button
        type="submit"
        className="w-full bg-rose-500 text-white py-3 rounded-full hover:bg-rose-600 transition"
      >
        Review Order
      </button>
    </form>
  )

  const renderReview = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Order Summary</h3>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span>
                {item.name} x {item.quantity}
              </span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t pt-2">
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Shipping Information</h3>
        <div className="space-y-1 text-sm">
          <p>{shippingInfo.fullName}</p>
          <p>{shippingInfo.email}</p>
          <p>{shippingInfo.address}</p>
          <p>
            {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Payment Method</h3>
        <p className="text-sm">
          Card ending in {paymentInfo.cardNumber.slice(-4)}
        </p>
      </div>

      <button
        onClick={handlePlaceOrder}
        className="w-full bg-rose-500 text-white py-3 rounded-full hover:bg-rose-600 transition"
      >
        Place Order
      </button>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="text-lg font-semibold">
              {currentStep === "shipping"
                ? "Shipping Information"
                : currentStep === "payment"
                ? "Payment Information"
                : "Review Order"}
            </h2>
            <button
              onClick={onClose}
              className="rounded-full p-1 hover:bg-gray-100"
              aria-label="Close checkout"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {currentStep === "shipping" && renderShippingForm()}
            {currentStep === "payment" && renderPaymentForm()}
            {currentStep === "review" && renderReview()}
          </div>
        </div>
      </div>
    </div>
  )
}
