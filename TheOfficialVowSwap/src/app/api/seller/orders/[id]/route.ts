import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { OrderUpdateData } from '@/app/types/seller';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { seller: true },
    });

    if (!user?.seller) {
      return new NextResponse('Seller account not found', { status: 404 });
    }

    const data: OrderUpdateData = await request.json();

    // Verify the order belongs to this seller
    const order = await prisma.order.findUnique({
      where: { id: params.id },
    });

    if (!order) {
      return new NextResponse('Order not found', { status: 404 });
    }

    if (order.sellerId !== user.seller.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Update the order
    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: {
        status: data.status,
        ...(data.trackingNumber && { trackingNumber: data.trackingNumber }),
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Order update error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
