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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { seller: true },
    });

    if (!user?.seller) {
      return new NextResponse('Seller not found', { status: 404 });
    }

    // Get all unique conversations for this seller
    const conversations = await prisma.$queryRaw`
      WITH LastMessages AS (
        SELECT DISTINCT ON (
          CASE 
            WHEN "senderId" = ${user.id} THEN "receiverId"
            ELSE "senderId"
          END
        )
          CASE 
            WHEN "senderId" = ${user.id} THEN "receiverId"
            ELSE "senderId"
          END as "userId",
          "content" as "lastMessage",
          "createdAt" as "lastMessageDate",
          "productId"
        FROM "Message"
        WHERE "senderId" = ${user.id} OR "receiverId" = ${user.id}
        ORDER BY 
          CASE 
            WHEN "senderId" = ${user.id} THEN "receiverId"
            ELSE "senderId"
          END,
          "createdAt" DESC
      ),
      UnreadCounts AS (
        SELECT 
          "senderId" as "userId",
          COUNT(*) as "unreadCount"
        FROM "Message"
        WHERE 
          "receiverId" = ${user.id}
          AND "isRead" = false
        GROUP BY "senderId"
      )
      SELECT 
        lm."userId",
        u."name" as "userName",
        lm."lastMessage",
        lm."lastMessageDate",
        COALESCE(uc."unreadCount", 0) as "unreadCount",
        p."id" as "productId",
        p."name" as "productName"
      FROM LastMessages lm
      LEFT JOIN "User" u ON u.id = lm."userId"
      LEFT JOIN UnreadCounts uc ON uc."userId" = lm."userId"
      LEFT JOIN "Product" p ON p.id = lm."productId"
      ORDER BY lm."lastMessageDate" DESC
    `;

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
