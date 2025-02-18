import { NextResponse } from 'next/server';
import { Server as SocketServer } from 'socket.io';
import { Server as NetServer } from 'http';
import { NextApiRequest } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth.config';
import prisma from '@/lib/prisma';

export const config = {
  api: {
    bodyParser: false,
  },
};

let io: SocketServer;

interface CustomNextApiRequest extends NextApiRequest {
  socket: any;
  io?: SocketServer;
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const customReq = req as unknown as CustomNextApiRequest;
    if (!io) {
      const server = customReq.socket.server as NetServer;
      io = new SocketServer(server, {
        path: '/api/socket',
        addTrailingSlash: false,
      });

      io.on('connection', (socket) => {
        console.log('Client connected');

        socket.on('join', async (userId: string) => {
          socket.join(userId);
          console.log(`User ${userId} joined their room`);
        });

        socket.on('typing', async (data: { senderId: string; receiverId: string; isTyping: boolean }) => {
          try {
            await prisma.typingIndicator.upsert({
              where: {
                userId_receiverId: {
                  userId: data.senderId,
                  receiverId: data.receiverId,
                },
              },
              update: {
                isTyping: data.isTyping,
                lastTyped: new Date(),
              },
              create: {
                userId: data.senderId,
                receiverId: data.receiverId,
                isTyping: data.isTyping,
              },
            });

            io.to(data.receiverId).emit('typing-update', {
              userId: data.senderId,
              isTyping: data.isTyping,
            });
          } catch (error) {
            console.error('Error updating typing indicator:', error);
          }
        });

        socket.on('new-message', async (message: any) => {
          io.to(message.receiverId).emit('message-received', message);
        });

        socket.on('disconnect', () => {
          console.log('Client disconnected');
        });
      });

      (customReq.socket.server as any).io = io;
    }

    return new NextResponse('WebSocket server is running', { status: 200 });
  } catch (error) {
    console.error('WebSocket server error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
