import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Mock data for development
const orders: {
  id: string;
  date: string;
  status: string;
  items: {
    name: string;
    quantity: number;
    price: number;
    image: string;
  }[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  timeline: {
    status: string;
    date: string;
    description: string;
  }[];
  [key: string]: any; // For other potential properties
}[] = [{
  id: "WDM-2025-001",
  date: new Date().toISOString(),
  status: "processing",
  items: [
    {
      name: "Sample Product",
      quantity: 1,
      price: 99.99,
      image: "/product-image.jpg"
    }
  ],
  subtotal: 99.99,
  shipping: 35,
  tax: 8.50,
  total: 143.49,
  shippingAddress: {
    name: "John Doe",
    street: "123 Main St",
    city: "New York",
    state: "NY",
    zip: "10001"
  },
  timeline: [
    {
      status: "Order Placed",
      date: new Date().toLocaleString(),
      description: "Your order has been confirmed"
    },
    {
      status: "Processing",
      date: new Date().toLocaleString(),
      description: "Your order is being processed"
    }
  ]
}];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const order = orders.find(o => o.id === params.id);
  
  if (!order) {
    return NextResponse.json(
      { error: 'Order not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(order);
}

// For demo purposes, add a method to update order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const orderIndex = orders.findIndex(o => o.id === params.id);
    
    if (orderIndex === -1) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const order = orders[orderIndex];
    const updatedOrder = {
      ...order,
      ...body,
      timeline: [
        ...order.timeline,
        {
          status: body.status,
          date: new Date().toLocaleString(),
          description: body.description || `Order ${body.status.toLowerCase()}`
        }
      ]
    };

    orders[orderIndex] = updatedOrder;

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
