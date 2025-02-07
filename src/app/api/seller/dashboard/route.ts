import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get seller data
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { seller: true },
    });

    if (!user?.seller) {
      return new NextResponse('Seller account not found', { status: 404 });
    }

    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get sales metrics
    const [dailySales, weeklySales, monthlySales, totalSales] = await Promise.all([
      prisma.order.aggregate({
        where: {
          sellerId: user.seller.id,
          createdAt: { gte: startOfDay },
          status: { not: 'CANCELLED' },
        },
        _sum: { totalAmount: true },
      }),
      prisma.order.aggregate({
        where: {
          sellerId: user.seller.id,
          createdAt: { gte: oneWeekAgo },
          status: { not: 'CANCELLED' },
        },
        _sum: { totalAmount: true },
      }),
      prisma.order.aggregate({
        where: {
          sellerId: user.seller.id,
          createdAt: { gte: oneMonthAgo },
          status: { not: 'CANCELLED' },
        },
        _sum: { totalAmount: true },
      }),
      prisma.order.aggregate({
        where: {
          sellerId: user.seller.id,
          status: { not: 'CANCELLED' },
        },
        _sum: { totalAmount: true },
      }),
    ]);

    // Get product stats
    const [products, activeProducts, orders, pendingOrders, topProducts] = await Promise.all([
      prisma.product.count({
        where: { sellerId: user.seller.id },
      }),
      prisma.product.count({
        where: { 
          sellerId: user.seller.id,
          isActive: true,
          quantity: { gt: 0 },
        },
      }),
      prisma.order.count({
        where: { sellerId: user.seller.id },
      }),
      prisma.order.count({
        where: {
          sellerId: user.seller.id,
          status: 'PENDING',
        },
      }),
      prisma.product.findMany({
        where: { sellerId: user.seller.id },
        orderBy: { totalSales: 'desc' },
        take: 5,
      }),
    ]);

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      where: { sellerId: user.seller.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      seller: user.seller,
      stats: {
        totalProducts: products,
        activeProducts,
        totalOrders: orders,
        pendingOrders,
        revenue: {
          daily: dailySales._sum.totalAmount || 0,
          weekly: weeklySales._sum.totalAmount || 0,
          monthly: monthlySales._sum.totalAmount || 0,
          total: totalSales._sum.totalAmount || 0,
        },
        topProducts,
      },
      recentOrders,
    });
  } catch (error) {
    console.error('Dashboard Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
