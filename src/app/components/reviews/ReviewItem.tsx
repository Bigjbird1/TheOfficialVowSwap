import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Review, ReviewStatus } from '@/app/types'

interface ReviewItemProps {
  review: Review
  onModerate?: (reviewId: string, status: ReviewStatus) => Promise<void>
  onReport?: (reviewId: string, reason: string) => Promise<void>
  onHelpful?: (reviewId: string) => Promise<void>
  onReply?: (reviewId: string, comment: string) => Promise<void>
}

const ReviewItem: React.FC<ReviewItemProps> = ({
  review,
  onModerate,
  onReport,
  onHelpful,
  onReply,
}) => {
  const { data: session } = useSession()
  const [isReplying, setIsReplying] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [error, setError] = useState('')

  const isAdmin = session?.user?.role === 'ADMIN'
  const isSeller = session?.user?.role === 'SELLER'
  const canModerate = isAdmin || isSeller

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-xl ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            ★
          </span>
        ))}
      </div>
    )
  }

  const handleReplySubmit = async () => {
    if (!replyText.trim()) return

    try {
      await onReply?.(review.id, replyText)
      setIsReplying(false)
      setReplyText('')
    } catch (err) {
      setError('Failed to submit reply')
    }
  }

  const handleReport = async () => {
    if (!reportReason.trim()) return

    try {
      await onReport?.(review.id, reportReason)
      setShowReportModal(false)
      setReportReason('')
    } catch (err) {
      setError('Failed to submit report')
    }
  }

  return (
    <div className="border-b border-gray-200 pb-6 mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          {review.user.image && (
            <img
              src={review.user.image}
              alt={review.user.name}
              className="w-8 h-8 rounded-full mr-2"
            />
          )}
          <span className="font-medium mr-2">{review.user.name}</span>
          {renderStars(review.rating)}
        </div>
        <span className="text-gray-500 text-sm">
          {new Date(review.createdAt).toLocaleDateString()}
        </span>
      </div>

      <p className="text-gray-700 mb-3">{review.comment}</p>

      {/* Moderation Status */}
      {review.status !== ReviewStatus.APPROVED && (
        <div className="mb-3 text-sm">
          <span className={`px-2 py-1 rounded ${
            review.status === ReviewStatus.PENDING
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {review.status}
          </span>
        </div>
      )}

      <div className="flex items-center text-sm">
        {/* Helpful Button */}
        <button
          onClick={() => onHelpful?.(review.id)}
          className="flex items-center text-gray-500 hover:text-gray-700"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
          </svg>
          Helpful ({review.helpfulCount})
        </button>

        {/* Report Button */}
        <button
          onClick={() => setShowReportModal(true)}
          className="ml-4 text-gray-500 hover:text-gray-700"
        >
          Report
        </button>

        {/* Reply Button */}
        <button
          onClick={() => setIsReplying(true)}
          className="ml-4 text-blue-600 hover:text-blue-800"
        >
          Reply
        </button>

        {/* Moderation Controls */}
        {canModerate && review.status !== ReviewStatus.APPROVED && (
          <div className="ml-auto space-x-2">
            <button
              onClick={() => onModerate?.(review.id, ReviewStatus.APPROVED)}
              className="text-green-600 hover:text-green-800"
            >
              Approve
            </button>
            <button
              onClick={() => onModerate?.(review.id, ReviewStatus.REJECTED)}
              className="text-red-600 hover:text-red-800"
            >
              Reject
            </button>
          </div>
        )}
      </div>

      {/* Replies */}
      {review.replies.length > 0 && (
        <div className="mt-4 ml-8 space-y-4">
          {review.replies.map((reply) => (
            <div key={reply.id} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                {reply.user.image && (
                  <img
                    src={reply.user.image}
                    alt={reply.user.name}
                    className="w-6 h-6 rounded-full mr-2"
                  />
                )}
                <span className="font-medium text-sm">{reply.user.name}</span>
                <span className="text-gray-500 text-xs ml-2">
                  {new Date(reply.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700 text-sm">{reply.comment}</p>
            </div>
          ))}
        </div>
      )}

      {/* Reply Form */}
      {isReplying && (
        <div className="mt-4 ml-8">
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write your reply..."
          />
          <div className="flex justify-end space-x-2 mt-2">
            <button
              onClick={() => setIsReplying(false)}
              className="px-3 py-1 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleReplySubmit}
              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Submit Reply
            </button>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Report Review</h3>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Please explain why you're reporting this review..."
            />
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-2 text-red-500 text-sm">{error}</div>
      )}
    </div>
  )
}

export default ReviewItem
