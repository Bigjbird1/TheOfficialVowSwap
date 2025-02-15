import React from 'react';
import { 
  Package, 
  Truck, 
  Check, 
  MapPin, 
  Clock, 
  ArrowLeft,
  Phone,
  Mail,
  MessageCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';

import { Order } from '../services/OrderService'

interface OrderDetailsProps {
  order: Order
}

const OrderDetails = ({ order }: OrderDetailsProps) => {
  // Mock data for demonstration purposes - will be replaced with real order data in production
  const orderDetails = {
    ...order,
    id: 'WDM-2024-001',
    date: '2024-02-01',
    status: 'shipped',
    items: [
      { 
        name: 'Crystal Chandelier', 
        quantity: 1, 
        price: '$299',
        image: '/placeholder.svg?height=100&width=100'
      },
      { 
        name: 'Table Runners', 
        quantity: 10, 
        price: '$149',
        image: '/placeholder.svg?height=100&width=100'
      }
    ],
    subtotal: '$448',
    shipping: '$35',
    tax: '$38.08',
    total: '$521.08',
    trackingNumber: 'TRK123456789',
    estimatedDelivery: '2024-02-05',
    shippingAddress: {
      name: 'John Smith',
      street: '123 Wedding Ave',
      city: 'Los Angeles',
      state: 'CA',
      zip: '90001'
    },
    timeline: [
      {
        status: 'Order Placed',
        date: '2024-02-01 09:15 AM',
        description: 'Your order has been confirmed'
      },
      {
        status: 'Processing',
        date: '2024-02-01 02:30 PM',
        description: 'Seller is preparing your items'
      },
      {
        status: 'Shipped',
        date: '2024-02-02 10:45 AM',
        description: 'Package is on its way'
      }
    ]
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          className="p-2 hover:bg-gray-100 rounded-full transition"
          aria-label="Back to Orders"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold">Order Details</h1>
          <p className="text-gray-600">Order #{orderDetails.id}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Order Timeline */}
          {orderDetails.timeline?.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle id="timeline-title">Order Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8" role="region" aria-labelledby="timeline-title">
                  {orderDetails.timeline.map((event, index) => (
                    // Using index as key since timeline events don't have unique IDs
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-rose-500/20 to-purple-600/20 flex items-center justify-center">
                          {/* Icon selection based on event status */}
                          {event.status === 'Order Placed' ? <Package className="w-4 h-4 text-rose-500" /> :
                           event.status === 'Processing' ? <Clock className="w-4 h-4 text-purple-600" /> :
                           event.status === 'Shipped' ? <Truck className="w-4 h-4 text-rose-500" /> :
                           <Check className="w-4 h-4 text-purple-600" />}
                        </div>
                        {index !== orderDetails.timeline.length - 1 && (
                          <div className="w-0.5 h-16 bg-gray-200" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{event.status}</h3>
                        <p className="text-sm text-gray-600">{event.date}</p>
                        <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <p className="text-gray-600">No timeline events available.</p>
          )}

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle id="items-title">Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              {orderDetails.items?.length > 0 ? (
                <div className="space-y-6" role="region" aria-labelledby="items-title">
                  {orderDetails.items.map((item, index) => (
                    // Using index as key since items don't have unique IDs
                    <div key={index} className="flex gap-4 pb-4 border-b last:border-0">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-gray-600">Quantity: {item.quantity}</p>
                        <p className="text-rose-500 font-medium">{item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No items found in this order.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          {/* Delivery Information */}
          <Card>
            <CardHeader>
              <CardTitle id="delivery-title">Delivery Information</CardTitle>
            </CardHeader>
            <CardContent>
              {orderDetails.shippingAddress ? (
                <div className="space-y-4" role="region" aria-labelledby="delivery-title">
                  <div className="flex gap-2">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <h3 className="font-medium">Shipping Address</h3>
                      <p className="text-sm text-gray-600">{orderDetails.shippingAddress.name}</p>
                      <p className="text-sm text-gray-600">{orderDetails.shippingAddress.street}</p>
                      <p className="text-sm text-gray-600">
                        {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} {orderDetails.shippingAddress.zip}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Truck className="w-5 h-5 text-gray-400" />
                    <div>
                      <h3 className="font-medium">Tracking Number</h3>
                      <p className="text-sm text-gray-600">{orderDetails.trackingNumber}</p>
                    </div>
                  </div>
                  {orderDetails.estimatedDelivery && (
                    <div className="flex gap-2">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <div>
                        <h3 className="font-medium">Estimated Delivery</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(orderDetails.estimatedDelivery).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-600">Shipping address not available.</p>
              )}
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle id="summary-title">Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3" role="region" aria-labelledby="summary-title">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{orderDetails.subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{orderDetails.shipping}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>{orderDetails.tax}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-medium">
                  <span>Total</span>
                  <span>{orderDetails.total}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Need Help */}
          <Card>
            <CardHeader>
              <CardTitle id="support-title">Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4" role="region" aria-labelledby="support-title">
                <button className="w-full flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gradient-to-r hover:from-rose-50 hover:to-purple-50 transition">
                  <MessageCircle className="w-5 h-5" />
                  <span>Start Chat</span>
                </button>
                <button className="w-full flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition">
                  <Phone className="w-5 h-5" />
                  <span>Call Support</span>
                </button>
                <button className="w-full flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition">
                  <Mail className="w-5 h-5" />
                  <span>Email Support</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
