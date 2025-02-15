import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import { ReportStatus, ContentType } from '@/app/types/moderation'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user || !['ADMIN', 'MODERATOR'].includes(session.user.role)) {
      return new NextResponse('Unauthorized', { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') as ReportStatus | null
    const type = searchParams.get('type') as ContentType | null
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build the where clause based on filters
    const where: Prisma.ContentReportWhereInput = {}
    if (status) where.status = status
    if (type) where.type = type
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    const reports = await prisma.contentReport.findMany({
      where,
      include: {
        reportedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reportedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        moderationEvents: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(reports)
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching reports:', error.message)
    } else {
      console.error('Unknown error fetching reports')
    }
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const data = await request.json()
    const { type, contentId, reason, details, reportedUserId } = data

    const report = await prisma.contentReport.create({
      data: {
        type,
        contentId,
        reason,
        details,
        reportedUserId,
        userId: session.user.id,
        status: ReportStatus.PENDING,
      },
      include: {
        reportedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reportedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(report)
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error creating report:', error.message)
    } else {
      console.error('Unknown error creating report')
    }
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
