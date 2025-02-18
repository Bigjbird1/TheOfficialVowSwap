import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth.config';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return new NextResponse('Missing userId parameter', { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { seller: true },
    });

    if (!user?.seller) {
      return new NextResponse('Seller not found', { status: 404 });
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: user.id, receiverId: userId },
          { senderId: userId, receiverId: user.id },
        ],
      },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            name: true,
          },
        },
        product: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
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
      return new NextResponse('Seller not found', { status: 404 });
    }

    const body = await request.json();
    const { receiverId, content, productId } = body;

    if (!receiverId || !content) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        senderId: user.id,
        receiverId,
        content,
        productId,
        isRead: false,
      },
      include: {
        sender: {
          select: {
            name: true,
          },
        },
        product: {
          select: {
            name: true,
          },
        },
      },
    });

    // Create a notification for the receiver
    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: 'NEW_MESSAGE',
        title: 'New Message',
        message: `New message from ${user.seller.storeName}`,
        link: `/messages/${user.id}`,
      },
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Error sending message:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
