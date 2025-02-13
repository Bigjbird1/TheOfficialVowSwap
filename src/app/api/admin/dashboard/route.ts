import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/auth.config';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const [
      totalUsers,
      totalSellers,
      totalOrders,
      totalProducts,
      recentOrders,
      revenue
    ] = await Promise.all([
      // Get total users count
      prisma.user.count({
        where: { role: 'CUSTOMER' }
      }),
      // Get total sellers count
      prisma.seller.count(),
      // Get total orders count
      prisma.order.count(),
      // Get total products count
      prisma.product.count(),
      // Get recent orders
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      }),
      // Calculate total revenue
      prisma.order.aggregate({
        _sum: {
          totalAmount: true
        },
        where: {
          status: 'DELIVERED'
        }
      })
    ]);

    // Get monthly revenue data for the chart
    const monthlyRevenue = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        SUM("totalAmount") as revenue
      FROM "Order"
      WHERE "status" = 'DELIVERED'
      AND "createdAt" >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month DESC
    `;

    return NextResponse.json({
      stats: {
        totalUsers,
        totalSellers,
        totalOrders,
        totalProducts,
        revenue: revenue._sum.totalAmount || 0
      },
      recentOrders,
      monthlyRevenue
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
