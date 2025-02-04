import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In production, this would query a database
let orders: any[] = [];

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
