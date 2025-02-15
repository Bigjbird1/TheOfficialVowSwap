import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { ModerationAction, ReportStatus } from '@/app/types/moderation'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user || !['ADMIN', 'MODERATOR'].includes(session.user.role)) {
      return new NextResponse('Unauthorized', { status: 403 })
    }

    const data = await request.json()
    const { action, reportId, notes } = data

    // Start a transaction since we need to update both the report and create an action
    const result = await prisma.$transaction(async (tx: typeof prisma) => {
      // Create the moderation action record
      const moderationAction = await tx.moderationAction.create({
        data: {
          action,
          reportId,
          moderatorId: session.user.id,
          notes,
        },
      })

      // Update the report status based on the action
      let newStatus: ReportStatus
      switch (action) {
        case ModerationAction.APPROVE:
          newStatus = ReportStatus.RESOLVED
          break
        case ModerationAction.REJECT:
        case ModerationAction.DELETE:
          newStatus = ReportStatus.RESOLVED
          break
        case ModerationAction.FLAG:
          newStatus = ReportStatus.UNDER_REVIEW
          break
        case ModerationAction.WARN:
        case ModerationAction.SUSPEND:
          newStatus = ReportStatus.RESOLVED
          break
        default:
          newStatus = ReportStatus.UNDER_REVIEW
      }

      const updatedReport = await tx.contentReport.update({
        where: { id: reportId },
        data: { status: newStatus },
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
      })

      // If action is SUSPEND, update the reported user's status
      if (action === ModerationAction.SUSPEND && updatedReport.reportedUserId) {
        await tx.user.update({
          where: { id: updatedReport.reportedUserId },
          data: { status: 'SUSPENDED' },
        })
      }

      return { moderationAction, updatedReport }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error processing moderation action:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
