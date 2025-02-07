import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { ContentType, ReportStatus, ModerationAction } from '@/app/types/moderation'
import { ModerationFilters, ReportWithDetails } from '@/app/types/moderation'
import ReportsList from './ReportsList'
import ModerationFiltersPanel from './ModerationFiltersPanel'
import ModerationStats from './ModerationStats'

export default function ModerationDashboard() {
  const { data: session } = useSession()
  const [filters, setFilters] = useState<ModerationFilters>({
    status: undefined,
    type: undefined,
    dateRange: undefined,
  })
  const [reports, setReports] = useState<ReportWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(false)
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
  const handleModeration = async (reportId: string, action: ModerationAction, notes?: string) => {
    try {
      const response = await fetch('/api/admin/moderation/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, action, notes }),
      })

      if (!response.ok) throw new Error('Failed to perform moderation action')
      
      // Refresh reports after action
      fetchReports()
    } catch (error) {
      console.error('Error performing moderation action:', error)
    }
  }

  // Handle direct content moderation
  const handleContentModeration = async (type: ContentType, contentId: string, action: ModerationAction, notes?: string) => {
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
    } catch (error) {
      console.error('Error moderating content:', error)
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

  return (
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

        <div className="lg:col-span-3">
          <ReportsList
            reports={reports}
            isLoading={isLoading}
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
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleContentModeration(selectedContent.type, selectedContent.id, ModerationAction.REJECT)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Reject
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
  )
}
