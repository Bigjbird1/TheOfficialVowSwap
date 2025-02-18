"use client"

import { useState, useEffect } from "react"
import { Package, CheckCircle, Truck, MapPin, Clock } from "lucide-react"
import { orderService, OrderStatus } from "../services/OrderService"

interface OrderTrackerProps {
  orderId: string
  initialStatus?: OrderStatus
  estimatedDelivery?: string
}

interface StatusStep {
  status: OrderStatus
  label: string
  icon: React.ReactNode
  description: string
}

export default function OrderTracker({
  orderId,
  initialStatus = "placed",
  estimatedDelivery,
}: OrderTrackerProps) {
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(initialStatus)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const statusSteps: StatusStep[] = [
    {
      status: "placed",
      label: "Order Placed",
      icon: <Package className="w-6 h-6" />,
      description: "Your order has been received",
    },
    {
      status: "confirmed",
      label: "Payment Confirmed",
      icon: <CheckCircle className="w-6 h-6" />,
      description: "Payment has been processed successfully",
    },
    {
      status: "shipped",
      label: "Order Shipped",
      icon: <Truck className="w-6 h-6" />,
      description: "Your order is on its way",
    },
    {
      status: "delivered",
      label: "Delivered",
      icon: <MapPin className="w-6 h-6" />,
      description: "Package has been delivered",
    },
  ]

  const statusIndex = statusSteps.findIndex((step) => step.status === currentStatus)

  useEffect(() => {
    const fetchOrderStatus = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const status = await orderService.getOrderStatus(orderId)
        setCurrentStatus(status as OrderStatus)
      } catch (error) {
        setError("Failed to fetch order status")
        console.error("Error fetching order status:", error)
      } finally {
        setIsLoading(false)
      }
    }

    // Initial fetch
    fetchOrderStatus()

    // Poll for updates every 30 seconds
    const intervalId = setInterval(fetchOrderStatus, 30000)

    return () => clearInterval(intervalId)
  }, [orderId])

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Header with Estimated Delivery */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Track Your Order</h2>
        {estimatedDelivery && (
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-5 h-5" />
            <span>Estimated Delivery: {estimatedDelivery}</span>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Status Steps */}
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute left-[45px] top-0 h-full w-0.5 bg-gray-200">
          <div
            className="absolute left-0 top-0 w-full bg-rose-500 transition-all duration-500"
            style={{
              height: `${(statusIndex / (statusSteps.length - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Steps */}
        <div className="space-y-8">
          {statusSteps.map((step, index) => {
            const isCompleted = index <= statusIndex
            const isCurrent = index === statusIndex

            return (
              <div
                key={step.status}
                className={`relative flex items-start gap-4 ${
                  isLoading ? "opacity-50" : ""
                }`}
              >
                {/* Step Icon */}
                <div
                  className={`relative z-10 flex h-[50px] w-[50px] items-center justify-center rounded-full border-2 transition-colors ${
                    isCompleted
                      ? "border-rose-500 bg-rose-50 text-rose-500"
                      : "border-gray-200 bg-white text-gray-400"
                  }`}
                >
                  {step.icon}
                </div>

                {/* Step Content */}
                <div className="flex-1 pt-3">
                  <h3
                    className={`font-medium ${
                      isCompleted ? "text-gray-900" : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </h3>
                  <p
                    className={`mt-1 text-sm ${
                      isCompleted ? "text-gray-600" : "text-gray-400"
                    }`}
                  >
                    {step.description}
                  </p>
                  {isCurrent && (
                    <span className="mt-2 inline-block text-sm text-rose-500">
                      Current Status
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* SMS Updates Option */}
      <div className="mt-8 rounded-lg bg-gray-50 p-4">
        <h3 className="font-medium mb-2">Get SMS Updates</h3>
        <div className="flex gap-2">
          <input
            type="tel"
            placeholder="Enter phone number"
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
          <button className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors">
            Subscribe
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Get real-time updates about your order status
        </p>
      </div>
    </div>
  )
}
