"use client"

import { CartItem } from "../../contexts/CartContext"

interface ReviewSectionProps {
  items: CartItem[]
  total: number
  shippingInfo: {
    fullName: string
    email: string
    address: string
    city: string
    state: string
    zipCode: string
  }
  paymentInfo: {
    cardNumber: string
  }
  onPlaceOrder: () => void
}

export default function ReviewSection({
  items,
  total,
  shippingInfo,
  paymentInfo,
  onPlaceOrder,
}: ReviewSectionProps) {
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handlePlaceOrder = () => {
    setShowConfirmation(true)
  }

  const confirmOrder = () => {
    setShowConfirmation(false)
    onPlaceOrder()
  }

  return (
    <div role="region" aria-label="Order Review">
      <div className="mb-4">
        <div role="progressbar" aria-valuenow={3} aria-valuemin={1} aria-valuemax={3} className="sr-only">
          Step 3 of 3: Review Order
        </div>
        <div className="flex justify-between mb-2">
          <span className="font-medium">Review</span>
          <span className="text-gray-500">Step 3 of 3</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div className="h-full w-full bg-rose-500 rounded-full"></div>
        </div>
      </div>

      <div className="space-y-6">
        <section aria-labelledby="order-summary-heading">
          <h3 id="order-summary-heading" className="text-lg font-semibold mb-2">Order Summary</h3>
          <ul className="space-y-4" role="list">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between">
                <span>
                  {item.name} <span className="text-gray-500">× {item.quantity}</span>
                </span>
                <span aria-label={`$${(item.price * item.quantity).toFixed(2)}`}>
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </li>
            ))}
            <li className="border-t pt-2">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span aria-label={`Total: $${total.toFixed(2)}`}>
                  ${total.toFixed(2)}
                </span>
              </div>
            </li>
          </ul>
        </section>

        <section aria-labelledby="shipping-heading">
          <h3 id="shipping-heading" className="text-lg font-semibold mb-2">Shipping Information</h3>
          <div className="space-y-1 text-sm">
            <p>{shippingInfo.fullName}</p>
            <p>{shippingInfo.email}</p>
            <address className="not-italic">
              {shippingInfo.address}<br />
              {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}
            </address>
          </div>
        </section>

        <section aria-labelledby="payment-heading">
          <h3 id="payment-heading" className="text-lg font-semibold mb-2">Payment Method</h3>
          <p className="text-sm">
            Card ending in {paymentInfo.cardNumber.slice(-4)}
          </p>
        </section>

        <button
          onClick={handlePlaceOrder}
          className="w-full bg-rose-500 text-white py-3 rounded-full hover:bg-rose-600 transition focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
        >
          Place Order
        </button>
      </div>

      {showConfirmation && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          role="dialog"
          aria-labelledby="confirm-order-title"
          aria-describedby="confirm-order-description"
        >
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h2 id="confirm-order-title" className="text-lg font-semibold mb-2">
              Confirm Order
            </h2>
            <p id="confirm-order-description" className="text-gray-600 mb-4">
              Are you sure you want to place this order? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={confirmOrder}
                className="flex-1 bg-rose-500 text-white py-2 rounded-full hover:bg-rose-600 transition focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-full hover:bg-gray-300 transition focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
