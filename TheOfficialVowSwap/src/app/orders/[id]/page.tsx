"use client"

import { useEffect, useState } from 'react'
import { orderService } from '@/app/services/OrderService'
import { Order } from '@/app/services/OrderService'
import OrderDetails from '@/app/components/OrderDetails'
import { useParams } from 'next/navigation'

export default function OrderPage() {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const params = useParams()
  const orderId = params.id as string

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const orderData = await orderService.getOrder(orderId)
        setOrder(orderData)
      } catch (err) {
        setError('Failed to load order details')
        console.error('Error fetching order:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
        <p className="text-gray-600">{error || 'Order not found'}</p>
      </div>
    )
  }

  return <OrderDetails order={order} />
}
