import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { ReportStatus } from '@/app/types/moderation'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user || !['ADMIN', 'MODERATOR'].includes(session.user.role)) {
      return new NextResponse('Unauthorized', { status: 403 })
    }

    // Get counts for different report statuses
    const [totalReports, pendingReports, resolvedReports, recentActions] = await Promise.all([
      // Total reports
      prisma.contentReport.count(),
      
      // Pending reports
      prisma.contentReport.count({
        where: {
          status: ReportStatus.PENDING,
        },
      }),
      
      // Resolved reports
      prisma.contentReport.count({
        where: {
          status: ReportStatus.RESOLVED,
        },
      }),
      
      // Recent moderation actions
      prisma.moderationAction.findMany({
        take: 10,
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
          report: {
            select: {
              type: true,
              reason: true,
              contentId: true,
            },
          },
        },
      }),
    ])

    // Get reports by content type
    const reportsByType = await prisma.contentReport.groupBy({
      by: ['type'],
      _count: true,
    })

    // Get reports by status
    const reportsByStatus = await prisma.contentReport.groupBy({
      by: ['status'],
      _count: true,
    })

    return NextResponse.json({
      totalReports,
      pendingReports,
      resolvedReports,
      recentActions,
      reportsByType,
      reportsByStatus,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching moderation stats:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
