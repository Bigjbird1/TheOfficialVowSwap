import { Server as SocketIOServer } from 'socket.io';
import { NextRequest, NextResponse } from 'next/server';
import { Message } from '@/app/types/chat';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

interface ServerToClientEvents {
  'message.new': (payload: { message: Message }) => void;
  'message.read': (payload: { messageIds: string[]; userId: string; conversationId: string }) => void;
  'user.typing': (payload: { conversationId: string; userId: string; isTyping: boolean }) => void;
  'error': (payload: { message: string }) => void;
}

interface ClientToServerEvents {
  'message.new': (data: { conversationId: string; content: string }) => void;
  'message.read': (data: { messageIds: string[] }) => void;
  'user.typing': (data: { conversationId: string; isTyping: boolean }) => void;
}

interface SocketData {
  userId: string;
}

let io: SocketIOServer<ClientToServerEvents, ServerToClientEvents> | null = null;
const connectedUsers = new Map<string, string>();

export async function GET(req: NextRequest) {
  try {
    if (!io) {
      io = new SocketIOServer((globalThis as any).WebSocketServer, {
        path: '/api/socket',
        addTrailingSlash: false,
        cors: {
          origin: process.env.NEXT_PUBLIC_APP_URL,
          methods: ['GET', 'POST'],
          credentials: true,
        },
      });

      // Authentication middleware
      io.use(async (socket, next) => {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
          next(new Error('Unauthorized'));
          return;
        }
        socket.data.userId = session.user.id;
        next();
      });

      // Connection handler
      io.on('connection', (socket) => {
        const userId = socket.data.userId;
        connectedUsers.set(userId, socket.id);

        // Handle user disconnection
        socket.on('disconnect', () => {
          connectedUsers.delete(userId);
        });

        // Handle new message
        socket.on('message.new', async (data) => {
          try {
            const { conversationId, content } = data;
            
            // Get conversation to verify user is a participant
            const conversation = await prisma.conversation.findUnique({
              where: { id: conversationId },
              include: { messages: true }
            });

            if (!conversation || 
                (conversation.initiatorId !== userId && conversation.receiverId !== userId)) {
              socket.emit('error', { message: 'Unauthorized' });
              return;
            }

            // Create new message
            const message = await prisma.message.create({
              data: {
                conversationId,
                content,
                senderId: userId,
                receiverId: conversation.initiatorId === userId 
                  ? conversation.receiverId 
                  : conversation.initiatorId,
              },
              include: {
                sender: {
                  select: { id: true, name: true, image: true }
                },
                receiver: {
                  select: { id: true, name: true, image: true }
                }
              }
            });

            // Update conversation lastMessageAt
            await prisma.conversation.update({
              where: { id: conversationId },
              data: { lastMessageAt: new Date() }
            });

            // Emit to both participants
            const receiverSocketId = connectedUsers.get(message.receiverId);
            if (receiverSocketId && io) {
              io.to(receiverSocketId).emit('message.new', { message });
            }
            socket.emit('message.new', { message });

          } catch (error) {
            console.error('Error handling new message:', error);
            socket.emit('error', { message: 'Failed to send message' });
          }
        });

        // Handle message read status
        socket.on('message.read', async (data) => {
          try {
            const { messageIds } = data;
            
            // Update messages
            await prisma.message.updateMany({
              where: {
                id: { in: messageIds },
                receiverId: userId,
                isRead: false
              },
              data: { isRead: true }
            });

            // Notify sender
            const messages = await prisma.message.findMany({
              where: { id: { in: messageIds } },
              select: { senderId: true, conversationId: true }
            }) as Array<Pick<Message, 'senderId' | 'conversationId'>>;

            const senderIds = [...new Set(messages.map((m) => m.senderId))];
            senderIds.forEach(senderId => {
              const senderSocketId = connectedUsers.get(senderId);
              if (senderSocketId && io) {
                io.to(senderSocketId).emit('message.read', { 
                  userId,
                  messageIds,
                  conversationId: messages[0]?.conversationId // Add conversationId to match MessageReadPayload
                });
              }
            });

          } catch (error) {
            console.error('Error marking messages as read:', error);
            socket.emit('error', { message: 'Failed to update message status' });
          }
        });

        // Handle typing status
        socket.on('user.typing', async (data) => {
          try {
            const { conversationId, isTyping } = data;
            
            const conversation = await prisma.conversation.findUnique({
              where: { id: conversationId }
            });

            if (!conversation) return;

            const receiverId = conversation.initiatorId === userId 
              ? conversation.receiverId 
              : conversation.initiatorId;

            const receiverSocketId = connectedUsers.get(receiverId);
            if (receiverSocketId && io) {
              io.to(receiverSocketId).emit('user.typing', {
                conversationId,
                userId,
                isTyping
              });
            }

          } catch (error) {
            console.error('Error handling typing status:', error);
          }
        });
      });

    }

    return new NextResponse('WebSocket server is running', {
      status: 200,
      headers: {
        'content-type': 'text/plain',
      },
    });
  } catch (error) {
    console.error('Socket initialization error:', error);
    return new NextResponse('Failed to start WebSocket server', { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
