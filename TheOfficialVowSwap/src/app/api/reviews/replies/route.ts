import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '../../auth/[...nextauth]/route'

// POST /api/reviews/replies
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { reviewId, comment } = body

    if (!reviewId || !comment) {
      return NextResponse.json(
        { error: 'Review ID and comment are required' },
        { status: 400 }
      )
    }

    // Check if user is admin, seller, or the review owner
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { product: { select: { sellerId: true } } }
    })

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    // Only allow replies if user is admin, seller of the product, or the review owner
    const isSeller = session.user.role === 'SELLER' && review.product.sellerId === session.user.id
    const isAdmin = session.user.role === 'ADMIN'
    const isReviewOwner = review.userId === session.user.id

    if (!isSeller && !isAdmin && !isReviewOwner) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const reply = await prisma.reviewReply.create({
      data: {
        reviewId,
        userId: session.user.id,
        comment,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(reply)
  } catch (error) {
    console.error('Error creating reply:', error)
    return NextResponse.json(
      { error: 'Failed to create reply' },
      { status: 500 }
    )
  }
}

// DELETE /api/reviews/replies?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const replyId = searchParams.get('id')

    if (!replyId) {
      return NextResponse.json(
        { error: 'Reply ID is required' },
        { status: 400 }
      )
    }

    const reply = await prisma.reviewReply.findUnique({
      where: { id: replyId },
    })

    if (!reply) {
      return NextResponse.json(
        { error: 'Reply not found' },
        { status: 404 }
      )
    }

    // Only allow deletion if user is admin or the reply owner
    if (reply.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    await prisma.reviewReply.delete({
      where: { id: replyId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting reply:', error)
    return NextResponse.json(
      { error: 'Failed to delete reply' },
      { status: 500 }
    )
  }
}
