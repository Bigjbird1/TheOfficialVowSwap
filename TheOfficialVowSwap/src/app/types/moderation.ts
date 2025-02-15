// Enums matching Prisma schema
export enum ContentType {
  PRODUCT = 'PRODUCT',
  REVIEW = 'REVIEW',
  USER_PROFILE = 'USER_PROFILE',
  SELLER_PROFILE = 'SELLER_PROFILE',
  REGISTRY = 'REGISTRY'
}

export enum ReportStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  RESOLVED = 'RESOLVED',
  DISMISSED = 'DISMISSED'
}

export enum ModerationAction {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  DELETE = 'DELETE',
  FLAG = 'FLAG',
  WARN = 'WARN',
  SUSPEND = 'SUSPEND'
}

export interface ContentReport {
  id: string
  type: ContentType
  contentId: string
  reason: string
  details?: string
  status: ReportStatus
  userId: string
  reportedUserId?: string
  createdAt: Date
  updatedAt: Date
}

export interface ModerationActionData {
  id: string
  action: ModerationAction
  moderatorId: string
  reportId: string
  notes?: string
  createdAt: Date
}

export interface ReportWithDetails extends ContentReport {
  reportedBy: {
    id: string
    name: string | null
    email: string
  }
  reportedUser?: {
    id: string
    name: string | null
    email: string
  }
  moderationEvents: ModerationActionData[]
}

export interface ModerationDashboardStats {
  totalReports: number
  pendingReports: number
  resolvedReports: number
  recentActions: ModerationActionData[]
}

export interface ModerationFilters {
  status?: ReportStatus
  type?: ContentType
  dateRange?: {
    start: Date
    end: Date
  }
}

export interface ModeratedContent<T> {
  content: T
  reports: ContentReport[]
  moderationEvents: ModerationActionData[]
}

export interface ReportFormData {
  type: ContentType
  contentId: string
  reason: string
  details?: string
  reportedUserId?: string
}

export interface ModerationActionFormData {
  action: ModerationAction
  reportId: string
  notes?: string
}
