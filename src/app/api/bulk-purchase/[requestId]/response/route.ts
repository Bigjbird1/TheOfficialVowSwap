import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { 
  BulkRequestStatus, 
  BulkResponseStatus,
  CreateBulkPurchaseResponseInput 
} from '@/app/types/bulk-purchase';

export async function POST(
  req: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data: CreateBulkPurchaseResponseInput = await req.json();

    // Validate required fields
    if (!data.customPrice || !data.estimatedDelivery) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get the request and verify seller permissions
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

    // Verify the user is the seller
    if (request.sellerId !== session.user.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Verify request is in a valid state for response
    if (request.status !== BulkRequestStatus.PENDING) {
      return Response.json(
        { error: 'Request is not in a valid state for response' },
        { status: 400 }
      );
    }

    // Create the response
    const response = await prisma.$transaction(async (tx: PrismaClient) => {
      // Create the response
      const response = await tx.bulkPurchaseResponse.create({
        data: {
          requestId: params.requestId,
          sellerId: session.user.id,
          customPrice: data.customPrice,
          estimatedDelivery: data.estimatedDelivery,
          notes: data.notes,
          status: BulkResponseStatus.PENDING
        },
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      // Update request status
      await tx.bulkPurchaseRequest.update({
        where: { id: params.requestId },
        data: { status: BulkRequestStatus.RESPONDED }
      });

      return response;
    });

    // Create notification for buyer
    await prisma.notification.create({
      data: {
        userId: request.buyerId,
        type: 'BULK_REQUEST_RESPONSE',
        title: 'New Response to Bulk Purchase Request',
        message: `${request.seller.storeName} has responded to your bulk purchase request for ${request.product.name}`,
        link: `/bulk-requests/${request.id}`
      }
    });

    return Response.json(response);
  } catch (error) {
    console.error('Error creating bulk purchase response:', error);
    return Response.json(
      { error: 'Failed to create bulk purchase response' },
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

    const { responseId, status } = await req.json();

    // Get the response and verify permissions
    const response = await prisma.bulkPurchaseResponse.findUnique({
      where: { id: responseId },
      include: {
        request: {
          include: {
            buyer: true,
            seller: true,
            product: true
          }
        }
      }
    });

    if (!response) {
      return Response.json({ error: 'Response not found' }, { status: 404 });
    }

    // Verify the user is either the buyer or seller
    const isBuyer = response.request.buyerId === session.user.id;
    const isSeller = response.sellerId === session.user.id;

    if (!isBuyer && !isSeller) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Validate status transition based on role
    if (isBuyer && ![BulkResponseStatus.ACCEPTED, BulkResponseStatus.DECLINED].includes(status)) {
      return Response.json(
        { error: 'Invalid status transition for buyer' },
        { status: 400 }
      );
    }

    if (isSeller && status !== BulkResponseStatus.EXPIRED) {
      return Response.json(
        { error: 'Invalid status transition for seller' },
        { status: 400 }
      );
    }

    // Update response status
    const updatedResponse = await prisma.$transaction(async (tx: PrismaClient) => {
      const updatedResponse = await tx.bulkPurchaseResponse.update({
        where: { id: responseId },
        data: { status },
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      // If buyer accepted/declined, update request status accordingly
      if (isBuyer) {
        await tx.bulkPurchaseRequest.update({
          where: { id: response.request.id },
          data: {
            status: status === BulkResponseStatus.ACCEPTED
              ? BulkRequestStatus.ACCEPTED
              : BulkRequestStatus.DECLINED
          }
        });
      }

      return updatedResponse;
    });

    // Create notification for the other party
    const notificationUserId = isBuyer ? response.sellerId : response.request.buyerId;
    const statusAction = status === BulkResponseStatus.ACCEPTED ? 'accepted' :
                        status === BulkResponseStatus.DECLINED ? 'declined' :
                        'marked as expired';

    await prisma.notification.create({
      data: {
        userId: notificationUserId,
        type: 'BULK_REQUEST_STATUS_UPDATE',
        title: 'Bulk Purchase Response Updated',
        message: `The response to bulk purchase request for ${response.request.product.name} has been ${statusAction}`,
        link: `/bulk-requests/${response.request.id}`
      }
    });

    return Response.json(updatedResponse);
  } catch (error) {
    console.error('Error updating bulk purchase response:', error);
    return Response.json(
      { error: 'Failed to update bulk purchase response' },
      { status: 500 }
    );
  }
}
