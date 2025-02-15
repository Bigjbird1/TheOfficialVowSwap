"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { ContentType, ReportStatus, ModerationAction } from '@/app/types/moderation'
import { ModerationFilters, ReportWithDetails } from '@/app/types/moderation'
import ReportsList from './ReportsList'
import ModerationFiltersPanel from './ModerationFiltersPanel'
import ModerationStats from './ModerationStats'
import { ErrorBoundary } from 'react-error-boundary'
import { toast } from 'react-hot-toast'

export default function ModerationDashboard() {
  const { data: session } = useSession()
  const [filters, setFilters] = useState<ModerationFilters>({
    status: undefined,
    type: undefined,
    dateRange: undefined,
  })
  const [reports, setReports] = useState<ReportWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [actionLoadingStates, setActionLoadingStates] = useState<Record<string, boolean>>({})
  const [selectedContent, setSelectedContent] = useState<{
    type: ContentType;
    id: string;
    data?: any;
  } | null>(null)

  useEffect(() => {
    fetchReports()
  }, []) // Initial load

  // Fetch reports based on filters
  const fetchReports = async () => {
    try {
      setIsLoading(true)
      const queryParams = new URLSearchParams()
      if (filters.status) queryParams.append('status', filters.status)
      if (filters.type) queryParams.append('type', filters.type)
      if (filters.dateRange) {
        queryParams.append('startDate', filters.dateRange.start.toISOString())
        queryParams.append('endDate', filters.dateRange.end.toISOString())
      }

      const response = await fetch(`/api/admin/moderation/reports?${queryParams}`)
      if (!response.ok) throw new Error('Failed to fetch reports')
      const data = await response.json()
      setReports(data)
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle moderation action on a report
  const validateActionNotes = (action: ModerationAction, notes?: string): boolean => {
    switch (action) {
      case ModerationAction.SUSPEND:
      case ModerationAction.WARN:
        if (!notes?.trim() || notes.length < 10) {
          toast.error(`Detailed notes are required for ${action.toLowerCase()} actions (minimum 10 characters)`)
          return false
        }
        break
      case ModerationAction.REJECT:
      case ModerationAction.DELETE:
        if (!notes?.trim()) {
          toast.error(`Notes are required for ${action.toLowerCase()} actions`)
          return false
        }
        break
    }
    return true
  }

  const handleModeration = async (reportId: string, action: ModerationAction, notes?: string) => {
    if (!validateActionNotes(action, notes)) {
      return
    }

    setActionLoadingStates(prev => ({ ...prev, [reportId]: true }))
    try {
      // Optimistically update UI
      const updatedReports = reports.map(report => 
        report.id === reportId 
          ? {
              ...report,
              status: ReportStatus.RESOLVED,
              moderationEvents: [
                ...report.moderationEvents,
                {
                  id: 'temp-' + Date.now(),
                  action,
                  moderatorId: session?.user?.id || '',
                  reportId,
                  notes,
                  createdAt: new Date()
                }
              ]
            }
          : report
      )
      setReports(updatedReports)

      const response = await fetch('/api/admin/moderation/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, action, notes }),
      })

      if (!response.ok) {
        throw new Error('Failed to perform moderation action')
      }
      
      toast.success('Moderation action completed successfully')
    } catch (error) {
      console.error('Error performing moderation action:', error)
      toast.error('Failed to complete moderation action')
      // Revert optimistic update
      fetchReports()
    } finally {
      setActionLoadingStates(prev => ({ ...prev, [reportId]: false }))
    }
  }

  // Handle direct content moderation
  const handleContentModeration = async (type: ContentType, contentId: string, action: ModerationAction, notes?: string) => {
    if (!validateActionNotes(action, notes)) {
      return
    }

    const contentKey = `${type}-${contentId}`
    setActionLoadingStates(prev => ({ ...prev, [contentKey]: true }))
    try {
      const response = await fetch('/api/admin/moderation/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, contentId, action, notes }),
      })

      if (!response.ok) throw new Error('Failed to moderate content')
      
      // Clear selected content and refresh reports
      setSelectedContent(null)
      fetchReports()
      toast.success('Content moderation completed successfully')
    } catch (error) {
      console.error('Error moderating content:', error)
      toast.error('Failed to moderate content')
    } finally {
      setActionLoadingStates(prev => ({ ...prev, [`${type}-${contentId}`]: false }))
    }
  }

  // View content details
  const viewContent = async (type: ContentType, contentId: string) => {
    try {
      const response = await fetch(`/api/admin/moderation/content?type=${type}&contentId=${contentId}`)
      if (!response.ok) throw new Error('Failed to fetch content details')
      const data = await response.json()
      setSelectedContent({ type, id: contentId, data })
    } catch (error) {
      console.error('Error fetching content details:', error)
    }
  }

  // Check if user has moderation permissions
  if (!session?.user || !['ADMIN', 'MODERATOR'].includes(session.user.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">You do not have permission to access this page.</p>
      </div>
    )
  }

  const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
    <div className="text-center py-8">
      <h2 className="text-xl font-bold text-red-600 mb-4">Something went wrong</h2>
      <pre className="text-sm bg-red-50 p-4 rounded mb-4">{error.message}</pre>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Try again
      </button>
    </div>
  )

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => fetchReports()}>
      <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Content Moderation Dashboard</h1>
        <ModerationStats />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <ModerationFiltersPanel
            filters={filters}
            onFilterChange={setFilters}
            onApplyFilters={fetchReports}
          />
        </div>

        <div className="lg:col-span-3 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}
          <ReportsList
            reports={reports}
            isLoading={isLoading}
            actionLoadingStates={actionLoadingStates}
            onModerate={handleModeration}
            onViewContent={viewContent}
          />

          {selectedContent && (
            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Content Details</h2>
              <pre className="bg-gray-50 p-4 rounded overflow-auto max-h-96">
                {JSON.stringify(selectedContent.data, null, 2)}
              </pre>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleContentModeration(selectedContent.type, selectedContent.id, ModerationAction.APPROVE)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={actionLoadingStates[`${selectedContent.type}-${selectedContent.id}`]}
                >
                  {actionLoadingStates[`${selectedContent.type}-${selectedContent.id}`] ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : 'Approve'}
                </button>
                <button
                  onClick={() => {
                    const notes = window.prompt('Please provide a reason for rejection:')
                    if (notes) {
                      handleContentModeration(selectedContent.type, selectedContent.id, ModerationAction.REJECT, notes)
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={actionLoadingStates[`${selectedContent.type}-${selectedContent.id}`]}
                >
                  {actionLoadingStates[`${selectedContent.type}-${selectedContent.id}`] ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : 'Reject'}
                </button>
                <button
                  onClick={() => setSelectedContent(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </ErrorBoundary>
  )
}
