import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth.config';
import { NotificationService } from '@/app/services/NotificationService';
import { z } from 'zod';

const notificationSchema = z.object({
  userIds: z.array(z.string()),
  type: z.enum([
    'NEW_MESSAGE',
    'ORDER_UPDATE',
    'PROMOTION',
    'SYSTEM_ALERT',
    'PRICE_CHANGE',
    'INVENTORY_ALERT',
    'REVIEW',
    'BULK_REQUEST',
  ]),
  title: z.string(),
  message: z.string(),
  link: z.string().optional(),
  data: z.record(z.any()).optional(),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const userId = searchParams.get('userId');

    if (!userId) {
      return new NextResponse('Missing userId parameter', { status: 400 });
    }

    const notifications = await NotificationService.getUserNotifications(userId, limit);
    const unreadCount = await NotificationService.getUnreadCount(userId);

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Only allow admins and sellers to create notifications
    if (!['ADMIN', 'SELLER'].includes(session.user.role)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const body = await request.json();
    const validatedData = notificationSchema.parse(body);

    const notifications = await NotificationService.createBulkNotifications(
      validatedData.userIds.map(userId => ({
        userId,
        type: validatedData.type,
        title: validatedData.title,
        message: validatedData.message,
        link: validatedData.link,
        data: validatedData.data,
      }))
    );

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Error creating notifications:', error);
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid notification data', { status: 400 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { notificationId, action } = body;

    if (!notificationId) {
      return new NextResponse('Missing notificationId', { status: 400 });
    }

    if (action === 'markAsRead') {
      const notification = await NotificationService.markAsRead(notificationId);
      return NextResponse.json({ notification });
    } else if (action === 'markAllAsRead') {
      const userId = body.userId;
      if (!userId) {
        return new NextResponse('Missing userId for markAllAsRead', { status: 400 });
      }
      await NotificationService.markAllAsRead(userId);
      return NextResponse.json({ success: true });
    }

    return new NextResponse('Invalid action', { status: 400 });
  } catch (error) {
    console.error('Error updating notification:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
