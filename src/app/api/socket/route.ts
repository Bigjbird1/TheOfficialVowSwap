import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as NetServer } from 'http';
import { NextApiResponse } from 'next';
import { 
  WebSocketEvent, 
  WebSocketEventType,
  NewMessagePayload,
  MessageReadPayload,
  UserTypingPayload,
  Message
} from '@/app/types/chat';
import prisma from '@/lib/prisma';
import { getSession } from 'next-auth/react';
import { NextResponse } from 'next/server';

interface ServerToClientEvents {
  'message.new': (payload: NewMessagePayload) => void;
  'message.read': (payload: MessageReadPayload) => void;
  'user.typing': (payload: UserTypingPayload) => void;
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

type CustomSocket = Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>;
type CustomServer = SocketIOServer<ClientToServerEvents, ServerToClientEvents, {}, SocketData>;

// Store active connections
const connectedUsers = new Map<string, string>(); // userId -> socketId

export async function GET(req: Request, res: NextApiResponse) {
  try {
    if (!(res.socket as any).server.io) {
      const httpServer: NetServer = (res.socket as any).server;
      const io: CustomServer = new SocketIOServer(httpServer, {
        path: '/api/socket',
        addTrailingSlash: false,
        cors: {
          origin: process.env.NEXT_PUBLIC_APP_URL,
          methods: ['GET', 'POST'],
          credentials: true,
        },
      });

      // Authentication middleware
      io.use(async (socket: CustomSocket, next) => {
        const session = await getSession({ req: socket.request });
        if (!session?.user) {
          next(new Error('Unauthorized'));
          return;
        }
        socket.data.userId = session.user.id;
        next();
      });

      // Connection handler
      io.on('connection', (socket: CustomSocket) => {
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
            if (receiverSocketId) {
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
              if (senderSocketId) {
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
            if (receiverSocketId) {
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

      (res.socket as any).server.io = io;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Socket initialization error:', error);
    return NextResponse.json(
      { error: 'Failed to start socket server' },
      { status: 500 }
    );
  }
}
