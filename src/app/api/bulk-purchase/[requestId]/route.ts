import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { BulkRequestStatus, UpdateBulkRequestStatusInput } from '@/app/types/bulk-purchase';

export async function GET(
  req: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const request = await prisma.bulkPurchaseRequest.findUnique({
      where: { id: params.requestId },
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
    });

    if (!request) {
      return Response.json({ error: 'Request not found' }, { status: 404 });
    }

    // Check if user has permission to view this request
    if (request.buyerId !== session.user.id && request.sellerId !== session.user.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return Response.json(request);
  } catch (error) {
    console.error('Error fetching bulk purchase request:', error);
    return Response.json(
      { error: 'Failed to fetch bulk purchase request' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await req.json();

    const request = await prisma.bulkPurchaseRequest.findUnique({
      where: { id: params.requestId },
      include: {
        buyer: true,
        seller: true,
        product: true
      }
    });

    if (!request) {
      return Response.json({ error: 'Request not found' }, { status: 404 });
    }

    // Check if user has permission to update this request
    if (request.buyerId !== session.user.id && request.sellerId !== session.user.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Validate status transition
    const isValidTransition = validateStatusTransition(
      request.status,
      status,
      session.user.id === request.buyerId
    );

    if (!isValidTransition) {
      return Response.json(
        { error: 'Invalid status transition' },
        { status: 400 }
      );
    }

    // Update request status
    const updatedRequest = await prisma.bulkPurchaseRequest.update({
      where: { id: params.requestId },
      data: { status },
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

    // Create notification for the other party
    const notificationUserId = session.user.id === request.buyerId
      ? request.sellerId
      : request.buyerId;

    await prisma.notification.create({
      data: {
        userId: notificationUserId,
        type: 'BULK_REQUEST_STATUS_UPDATE',
        title: 'Bulk Purchase Request Updated',
        message: `The status of your bulk purchase request for ${request.product.name} has been updated to ${status}`,
        link: `/bulk-requests/${request.id}`
      }
    });

    return Response.json(updatedRequest);
  } catch (error) {
    console.error('Error updating bulk purchase request:', error);
    return Response.json(
      { error: 'Failed to update bulk purchase request' },
      { status: 500 }
    );
  }
}

// Helper function to validate status transitions
function validateStatusTransition(
  currentStatus: BulkRequestStatus,
  newStatus: BulkRequestStatus,
  isBuyer: boolean
): boolean {
  // Define valid transitions based on user role and current status
  const validTransitions: Record<BulkRequestStatus, BulkRequestStatus[]> = {
    [BulkRequestStatus.PENDING]: isBuyer
      ? [BulkRequestStatus.CANCELLED]
      : [BulkRequestStatus.RESPONDED, BulkRequestStatus.DECLINED],
    [BulkRequestStatus.RESPONDED]: isBuyer
      ? [BulkRequestStatus.ACCEPTED, BulkRequestStatus.DECLINED]
      : [],
    [BulkRequestStatus.ACCEPTED]: !isBuyer
      ? [BulkRequestStatus.COMPLETED]
      : [],
    [BulkRequestStatus.DECLINED]: [],
    [BulkRequestStatus.COMPLETED]: [],
    [BulkRequestStatus.CANCELLED]: []
  };

  return validTransitions[currentStatus]?.includes(newStatus) || false;
}
