import { useState } from 'react'
import { ReportWithDetails, ModerationAction } from '@/app/types/moderation'

interface ReportsListProps {
  reports: ReportWithDetails[]
  isLoading: boolean
  onModerate: (reportId: string, action: string, notes?: string) => Promise<void>
}

export default function ReportsList({ reports, isLoading, onModerate }: ReportsListProps) {
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [moderationNotes, setModerationNotes] = useState('')

  const handleAction = async (reportId: string, action: string) => {
    await onModerate(reportId, action, moderationNotes)
    setSelectedReport(null)
    setModerationNotes('')
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No reports found matching the current filters.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reason
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reported By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {report.type}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="max-w-xs truncate">{report.reason}</div>
                  {report.details && (
                    <div className="text-xs text-gray-500 mt-1 truncate">
                      {report.details}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${report.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${report.status === 'UNDER_REVIEW' ? 'bg-blue-100 text-blue-800' : ''}
                    ${report.status === 'RESOLVED' ? 'bg-green-100 text-green-800' : ''}
                    ${report.status === 'DISMISSED' ? 'bg-gray-100 text-gray-800' : ''}
                  `}>
                    {report.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {report.reportedBy.name || report.reportedBy.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(report.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {selectedReport === report.id ? (
                    <div className="space-y-2">
                      <textarea
                        className="w-full px-3 py-2 text-sm border rounded-md"
                        placeholder="Add notes (optional)"
                        value={moderationNotes}
                        onChange={(e) => setModerationNotes(e.target.value)}
                        rows={2}
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAction(report.id, 'APPROVE')}
                          className="px-3 py-1 text-xs text-white bg-green-600 rounded hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(report.id, 'REJECT')}
                          className="px-3 py-1 text-xs text-white bg-red-600 rounded hover:bg-red-700"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => setSelectedReport(null)}
                          className="px-3 py-1 text-xs text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedReport(report.id)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Review
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
