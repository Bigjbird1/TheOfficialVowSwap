import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const orders: {
  id: string;
  date: string;
  status: string;
  [key: string]: any; // Allow properties from the request body
  timeline: {
    status: string;
    date: string;
    description: string;
  }[];
}[] = []; // In production, this would be a database

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const order = {
      id: `WDM-${new Date().getFullYear()}-${(orders.length + 1).toString().padStart(3, '0')}`,
      date: new Date().toISOString(),
      status: 'pending',
      ...body,
      timeline: [
        {
          status: 'Order Placed',
          date: new Date().toLocaleString(),
          description: 'Your order has been confirmed'
        }
      ]
    };

    orders.push(order);

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('id');

  if (orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(order);
  }

  return NextResponse.json(orders);
}
