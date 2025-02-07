import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { CreateConversationRequest } from '@/app/types/chat';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'ACTIVE';

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { initiatorId: userId },
          { receiverId: userId }
        ],
        status
      },
      include: {
        initiator: {
          select: { id: true, name: true, image: true }
        },
        receiver: {
          select: { id: true, name: true, image: true }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        }
      },
      orderBy: { lastMessageAt: 'desc' }
    });

    // Get unread count
    const unreadCount = await prisma.message.count({
      where: {
        receiverId: userId,
        isRead: false
      }
    });

    return NextResponse.json({ conversations, unreadCount });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body: CreateConversationRequest = await req.json();

    // Check if conversation already exists
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          {
            initiatorId: userId,
            receiverId: body.receiverId,
          },
          {
            initiatorId: body.receiverId,
            receiverId: userId,
          },
        ],
        status: 'ACTIVE',
      },
    });

    if (existingConversation) {
      return NextResponse.json(
        { error: 'Conversation already exists' },
        { status: 400 }
      );
    }

    // Create new conversation with initial message
    const conversation = await prisma.conversation.create({
      data: {
        initiatorId: userId,
        receiverId: body.receiverId,
        status: 'ACTIVE',
        lastMessageAt: new Date(),
        messages: {
          create: {
            content: body.initialMessage,
            senderId: userId,
            receiverId: body.receiverId,
          },
        },
      },
      include: {
        initiator: {
          select: { id: true, name: true, image: true }
        },
        receiver: {
          select: { id: true, name: true, image: true }
        },
        messages: true,
      },
    });

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}
