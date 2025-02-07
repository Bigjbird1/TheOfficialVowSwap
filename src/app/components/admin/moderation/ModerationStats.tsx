import { useEffect, useState } from 'react'
import { ModerationDashboardStats } from '@/app/types/moderation'

export default function ModerationStats() {
  const [stats, setStats] = useState<ModerationDashboardStats>({
    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0,
    recentActions: []
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/moderation/stats')
        if (!response.ok) throw new Error('Failed to fetch moderation stats')
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('Error fetching moderation stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900">Total Reports</h3>
            <p className="mt-1 text-3xl font-semibold text-indigo-600">
              {stats.totalReports}
            </p>
          </div>
          <div className="p-3 bg-indigo-100 rounded-full">
            <svg
              className="w-6 h-6 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900">Pending Reports</h3>
            <p className="mt-1 text-3xl font-semibold text-yellow-600">
              {stats.pendingReports}
            </p>
          </div>
          <div className="p-3 bg-yellow-100 rounded-full">
            <svg
              className="w-6 h-6 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900">Resolved Reports</h3>
            <p className="mt-1 text-3xl font-semibold text-green-600">
              {stats.resolvedReports}
            </p>
          </div>
          <div className="p-3 bg-green-100 rounded-full">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
      </div>

      {stats.recentActions.length > 0 && (
        <div className="md:col-span-3 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Actions</h3>
          <div className="space-y-4">
            {stats.recentActions.map((action) => (
              <div
                key={action.id}
                className="flex items-center justify-between border-b pb-4 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {action.action}
                  </p>
                  {action.notes && (
                    <p className="text-sm text-gray-500">{action.notes}</p>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(action.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
