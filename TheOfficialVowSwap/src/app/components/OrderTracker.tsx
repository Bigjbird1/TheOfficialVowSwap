import React, { useState } from 'react';
import { Package, Truck, Check, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

const OrderStatus = {
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  ISSUE: 'issue'
} as const;

type OrderStatusType = typeof OrderStatus[keyof typeof OrderStatus];

interface OrderItem {
  name: string;
  quantity: number;
  price: string;
}

interface Order {
  id: string;
  date: string;
  status: OrderStatusType;
  items: OrderItem[];
  total: string;
  trackingNumber: string;
  estimatedDelivery: string;
}

const OrderTracker = () => {
  // Sample order data - in production, this would come from an API
  const [orders] = useState<Order[]>([
    {
      id: 'WDM-2024-001',
      date: '2024-02-01',
      status: OrderStatus.DELIVERED,
      items: [
        { name: 'Crystal Chandelier', quantity: 1, price: '$299' },
        { name: 'Table Runners', quantity: 10, price: '$149' }
      ],
      total: '$448',
      trackingNumber: 'TRK123456789',
      estimatedDelivery: '2024-02-05'
    },
    {
      id: 'WDM-2024-002',
      date: '2024-02-03',
      status: OrderStatus.SHIPPED,
      items: [
        { name: 'Rustic Wooden Arch', quantity: 1, price: '$499' }
      ],
      total: '$499',
      trackingNumber: 'TRK987654321',
      estimatedDelivery: '2024-02-08'
    }
  ]);

  const getStatusIcon = (status: OrderStatusType) => {
    switch (status) {
      case OrderStatus.PROCESSING:
        return <Package className="w-6 h-6 text-blue-500" />;
      case OrderStatus.SHIPPED:
        return <Truck className="w-6 h-6 text-purple-500" />;
      case OrderStatus.DELIVERED:
        return <Check className="w-6 h-6 text-green-500" />;
      case OrderStatus.ISSUE:
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: OrderStatusType) => {
    switch (status) {
      case OrderStatus.PROCESSING:
        return 'Processing';
      case OrderStatus.SHIPPED:
        return 'Shipped';
      case OrderStatus.DELIVERED:
        return 'Delivered';
      case OrderStatus.ISSUE:
        return 'Issue Reported';
      default:
        return '';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>
      
      <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order.id} className="overflow-hidden">
            <CardHeader className="bg-gray-50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Order #{order.id}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {getStatusIcon(order.status)}
                  <span className="font-medium">{getStatusText(order.status)}</span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Order Details</h3>
                    <div className="text-sm space-y-1">
                      <p>Order Date: {new Date(order.date).toLocaleDateString()}</p>
                      <p>Total Amount: {order.total}</p>
                      <p>Tracking Number: {order.trackingNumber}</p>
                      <p>Estimated Delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Items</h3>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.name} (x{item.quantity})</span>
                        <span>{item.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-4">
                <button className="px-4 py-2 text-gray-600 hover:text-gray-900 transition">
                  Need Help?
                </button>
                <button className="px-4 py-2 text-white rounded-full bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 transition">
                  Track Order
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OrderTracker;
