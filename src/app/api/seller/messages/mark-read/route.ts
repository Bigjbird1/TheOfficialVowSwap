import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth.config';
import prisma from '@/lib/prisma';

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
    const { userId } = body;

    if (!userId) {
      return new NextResponse('Missing userId parameter', { status: 400 });
    }

    // Mark all messages from this user as read
    await prisma.message.updateMany({
      where: {
        senderId: userId,
        receiverId: user.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
