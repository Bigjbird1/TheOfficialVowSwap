import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '../../auth/[...nextauth]/route'

// POST /api/reviews/reports
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
    const { reviewId, reason } = body

    if (!reviewId || !reason) {
      return NextResponse.json(
        { error: 'Review ID and reason are required' },
        { status: 400 }
      )
    }

    // Check if user has already reported this review
    const existingReport = await prisma.reviewReport.findFirst({
      where: {
        reviewId,
        userId: session.user.id,
      },
    })

    if (existingReport) {
      return NextResponse.json(
        { error: 'You have already reported this review' },
        { status: 400 }
      )
    }

    // Create report and increment report count
    const [report] = await prisma.$transaction([
      prisma.reviewReport.create({
        data: {
          reviewId,
          userId: session.user.id,
          reason,
        },
      }),
      prisma.review.update({
        where: { id: reviewId },
        data: {
          reportCount: {
            increment: 1,
          },
        },
      }),
    ])

    return NextResponse.json(report)
  } catch (error) {
    console.error('Error creating report:', error)
    return NextResponse.json(
      { error: 'Failed to create report' },
      { status: 500 }
    )
  }
}

// GET /api/reviews/reports?reviewId=xxx
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Only admins and sellers can view reports
    if (!['ADMIN', 'SELLER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const reviewId = searchParams.get('reviewId')

    if (!reviewId) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      )
    }

    const reports = await prisma.reviewReport.findMany({
      where: { reviewId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(reports)
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    )
  }
}
