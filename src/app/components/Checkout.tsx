"use client"

import { useState, useRef, useEffect } from "react"
import { useCart } from "../contexts/CartContext"
import { X } from "lucide-react"
import { orderService } from "../services/OrderService"
import { useRouter } from "next/navigation"
import ShippingForm from "./checkout/ShippingForm"
import PaymentForm from "./checkout/PaymentForm"
import ReviewSection from "./checkout/ReviewSection"
import FocusLock from 'react-focus-lock'

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
  const { items, total, clearCart } = useCart()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("shipping")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const titleId = "checkout-title"

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

  useEffect(() => {
    // Reset error when step changes
    setError(null)
  }, [currentStep])

  useEffect(() => {
    // Handle escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [hasChanges])

  if (!isOpen) return null

  const handleClose = () => {
    if (hasChanges) {
      const confirmed = window.confirm("You have unsaved changes. Are you sure you want to close?")
      if (!confirmed) return
    }
    onClose()
  }

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentStep("payment")
    setHasChanges(true)
  }

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentStep("review")
  }

  const handlePlaceOrder = async () => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      const order = await orderService.createOrder(
        items,
        shippingInfo,
        paymentInfo
      )
      
      // Clear the cart
      clearCart()
      
      // Close the checkout modal
      onClose()
      
      // Redirect to order details page
      router.push(`/orders/${order.id}`)
    } catch (error) {
      console.error('Error placing order:', error)
      setError('Failed to place order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleClose} />
      <FocusLock>
        <div 
          ref={modalRef}
          className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl"
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 id={titleId} className="text-lg font-semibold">
                {currentStep === "shipping"
                  ? "Shipping Information"
                  : currentStep === "payment"
                  ? "Payment Information"
                  : "Review Order"}
              </h2>
              <button
                onClick={handleClose}
                className="rounded-full p-1 hover:bg-gray-100"
                aria-label="Close checkout"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {error && (
                <div 
                  className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md"
                  role="alert"
                >
                  {error}
                </div>
              )}

              {currentStep === "shipping" && (
                <ShippingForm
                  shippingInfo={shippingInfo}
                  onSubmit={handleShippingSubmit}
                  onChange={(info) => {
                    setShippingInfo(info)
                    setHasChanges(true)
                  }}
                />
              )}
              
              {currentStep === "payment" && (
                <PaymentForm
                  paymentInfo={paymentInfo}
                  onSubmit={handlePaymentSubmit}
                  onChange={(info) => {
                    setPaymentInfo(info)
                    setHasChanges(true)
                  }}
                />
              )}
              
              {currentStep === "review" && (
                <ReviewSection
                  items={items}
                  total={total}
                  shippingInfo={shippingInfo}
                  paymentInfo={paymentInfo}
                  onPlaceOrder={handlePlaceOrder}
                />
              )}
            </div>
          </div>
        </div>
      </FocusLock>
    </div>
  )
}
