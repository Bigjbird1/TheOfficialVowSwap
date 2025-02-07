import { ContentType, ReportStatus } from '@/app/types/moderation'
import { useState } from 'react'

interface ModerationFiltersPanelProps {
  filters: {
    status?: ReportStatus
    type?: ContentType
    dateRange?: {
      start: Date
      end: Date
    }
  }
  onFilterChange: (filters: any) => void
  onApplyFilters: () => void
}

export default function ModerationFiltersPanel({
  filters,
  onFilterChange,
  onApplyFilters,
}: ModerationFiltersPanelProps) {
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false)

  const handleStatusChange = (status: ReportStatus | undefined) => {
    onFilterChange({ ...filters, status })
  }

  const handleTypeChange = (type: ContentType | undefined) => {
    onFilterChange({ ...filters, type })
  }

  const handleDateRangeChange = (start: Date | undefined, end: Date | undefined) => {
    onFilterChange({
      ...filters,
      dateRange: start && end ? { start, end } : undefined,
    })
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Filters</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            value={filters.status || ''}
            onChange={(e) => handleStatusChange(e.target.value as ReportStatus || undefined)}
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="RESOLVED">Resolved</option>
            <option value="DISMISSED">Dismissed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content Type
          </label>
          <select
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            value={filters.type || ''}
            onChange={(e) => handleTypeChange(e.target.value as ContentType || undefined)}
          >
            <option value="">All Types</option>
            <option value="PRODUCT">Product</option>
            <option value="REVIEW">Review</option>
            <option value="USER_PROFILE">User Profile</option>
            <option value="SELLER_PROFILE">Seller Profile</option>
            <option value="REGISTRY">Registry</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Range
          </label>
          <button
            type="button"
            className="w-full px-4 py-2 text-sm text-left border rounded-md hover:bg-gray-50"
            onClick={() => setIsDateRangeOpen(!isDateRangeOpen)}
          >
            {filters.dateRange
              ? `${filters.dateRange.start.toLocaleDateString()} - ${filters.dateRange.end.toLocaleDateString()}`
              : 'Select date range'}
          </button>
          
          {isDateRangeOpen && (
            <div className="mt-2 space-y-2">
              <input
                type="date"
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                value={filters.dateRange?.start.toISOString().split('T')[0] || ''}
                onChange={(e) => {
                  const start = e.target.value ? new Date(e.target.value) : undefined
                  handleDateRangeChange(
                    start,
                    filters.dateRange?.end || new Date()
                  )
                }}
              />
              <input
                type="date"
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                value={filters.dateRange?.end.toISOString().split('T')[0] || ''}
                onChange={(e) => {
                  const end = e.target.value ? new Date(e.target.value) : undefined
                  handleDateRangeChange(
                    filters.dateRange?.start || new Date(),
                    end
                  )
                }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="pt-4">
        <button
          onClick={onApplyFilters}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Apply Filters
        </button>
      </div>
    </div>
  )
}
