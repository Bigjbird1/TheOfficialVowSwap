import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { BulkRequestStatus, CreateBulkPurchaseRequestInput } from '@/app/types/bulk-purchase';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data: CreateBulkPurchaseRequestInput = await req.json();
    
    // Validate required fields
    if (!data.productId || !data.quantity || !data.contactEmail) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get product and seller info
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      include: { seller: true }
    });

    if (!product) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }

    // Create the bulk purchase request
    const request = await prisma.bulkPurchaseRequest.create({
      data: {
        buyerId: session.user.id,
        sellerId: product.sellerId,
        productId: data.productId,
        quantity: data.quantity,
        requirements: data.requirements,
        notes: data.notes,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        status: BulkRequestStatus.PENDING
      },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        seller: {
          select: {
            id: true,
            storeName: true,
            contactEmail: true
          }
        },
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true
          }
        }
      }
    });

    // Create notification for seller
    await prisma.notification.create({
      data: {
        userId: product.sellerId,
        type: 'BULK_REQUEST_NEW',
        title: 'New Bulk Purchase Request',
        message: `You have received a new bulk purchase request for ${product.name}`,
        link: `/seller/bulk-requests/${request.id}`
      }
    });

    return Response.json(request);
  } catch (error) {
    console.error('Error creating bulk purchase request:', error);
    return Response.json(
      { error: 'Failed to create bulk purchase request' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const status = searchParams.get('status') as BulkRequestStatus | null;
    const role = searchParams.get('role') as 'buyer' | 'seller' | null;

    const skip = (page - 1) * pageSize;

    // Build where clause based on filters
    const where: any = {};
    if (status) {
      where.status = status;
    }

    // Filter by role
    if (role === 'buyer') {
      where.buyerId = session.user.id;
    } else if (role === 'seller') {
      where.sellerId = session.user.id;
    }

    // Get requests with pagination
    const [requests, total] = await Promise.all([
      prisma.bulkPurchaseRequest.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          buyer: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          seller: {
            select: {
              id: true,
              storeName: true,
              contactEmail: true
            }
          },
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              images: true
            }
          },
          responses: {
            include: {
              seller: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      }),
      prisma.bulkPurchaseRequest.count({ where })
    ]);

    return Response.json({
      requests,
      total,
      page,
      pageSize
    });
  } catch (error) {
    console.error('Error fetching bulk purchase requests:', error);
    return Response.json(
      { error: 'Failed to fetch bulk purchase requests' },
      { status: 500 }
    );
  }
}
