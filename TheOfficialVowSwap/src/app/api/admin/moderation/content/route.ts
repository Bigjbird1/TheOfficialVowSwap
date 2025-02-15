import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { ContentType, ModerationAction } from '@/app/types/moderation'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user || !['ADMIN', 'MODERATOR'].includes(session.user.role)) {
      return new NextResponse('Unauthorized', { status: 403 })
    }

    const data = await request.json()
    const { type, contentId, action, notes } = data

    // Start a transaction to handle content status update
    const result = await prisma.$transaction(async (tx: typeof prisma) => {
      let contentUpdate
      
      switch (type) {
        case ContentType.PRODUCT:
          contentUpdate = await tx.product.update({
            where: { id: contentId },
            data: {
              status: action === ModerationAction.APPROVE ? 'ACTIVE' : 'REMOVED',
              moderatedAt: new Date(),
              moderatedBy: session.user.id,
            },
          })
          break

        case ContentType.REVIEW:
          contentUpdate = await tx.review.update({
            where: { id: contentId },
            data: {
              status: action === ModerationAction.APPROVE ? 'APPROVED' : 'REMOVED',
              moderatedAt: new Date(),
              moderatedBy: session.user.id,
            },
          })
          break

        case ContentType.USER_PROFILE:
        case ContentType.SELLER_PROFILE:
          contentUpdate = await tx.user.update({
            where: { id: contentId },
            data: {
              status: action === ModerationAction.APPROVE ? 'ACTIVE' : 'SUSPENDED',
              moderatedAt: new Date(),
              moderatedBy: session.user.id,
            },
          })
          break

        case ContentType.REGISTRY:
          contentUpdate = await tx.registry.update({
            where: { id: contentId },
            data: {
              status: action === ModerationAction.APPROVE ? 'ACTIVE' : 'REMOVED',
              moderatedAt: new Date(),
              moderatedBy: session.user.id,
            },
          })
          break

        default:
          throw new Error(`Unsupported content type: ${type}`)
      }

      // Create a moderation event record
      const moderationEvent = await tx.moderationAction.create({
        data: {
          action,
          moderatorId: session.user.id,
          notes,
          contentType: type,
          contentId,
        },
      })

      return {
        contentUpdate,
        moderationEvent,
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating content status:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user || !['ADMIN', 'MODERATOR'].includes(session.user.role)) {
      return new NextResponse('Unauthorized', { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') as ContentType
    const contentId = searchParams.get('contentId')

    if (!type || !contentId) {
      return new NextResponse('Missing required parameters', { status: 400 })
    }

    // Get content and its moderation history
    let content
    const moderationEvents = await prisma.moderationAction.findMany({
      where: {
        contentType: type,
        contentId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        moderator: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    // Get the specific content based on type
    switch (type) {
      case ContentType.PRODUCT:
        content = await prisma.product.findUnique({
          where: { id: contentId },
        })
        break

      case ContentType.REVIEW:
        content = await prisma.review.findUnique({
          where: { id: contentId },
        })
        break

      case ContentType.USER_PROFILE:
      case ContentType.SELLER_PROFILE:
        content = await prisma.user.findUnique({
          where: { id: contentId },
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
            role: true,
            createdAt: true,
            moderatedAt: true,
            moderatedBy: true,
          },
        })
        break

      case ContentType.REGISTRY:
        content = await prisma.registry.findUnique({
          where: { id: contentId },
        })
        break

      default:
        return new NextResponse('Invalid content type', { status: 400 })
    }

    if (!content) {
      return new NextResponse('Content not found', { status: 404 })
    }

    return NextResponse.json({
      content,
      moderationEvents,
    })
  } catch (error) {
    console.error('Error fetching content:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
