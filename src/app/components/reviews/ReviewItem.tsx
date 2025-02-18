import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Star, ThumbsUp, Flag, MessageCircle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
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
  const [selectedImage, setSelectedImage] = useState<number | null>(null)

  const isAdmin = session?.user?.role === 'ADMIN'
  const isSeller = session?.user?.role === 'SELLER'
  const canModerate = isAdmin || isSeller

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
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
    <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {review.user.image && (
            <div className="relative w-10 h-10 rounded-full overflow-hidden">
              <Image
                src={review.user.image}
                alt={review.user.name}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div>
            <div className="font-medium">{review.user.name}</div>
            <div className="flex items-center gap-2">
              {renderStars(review.rating)}
              <span className="text-sm text-gray-500">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Moderation Status */}
        {review.status !== ReviewStatus.APPROVED && (
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            review.status === ReviewStatus.PENDING
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {review.status}
          </span>
        )}
      </div>

      <p className="text-gray-700 mb-4">{review.comment}</p>

      {/* Review Images */}
      {review.images && review.images.length > 0 && (
        <div className="mb-4">
          <div className="grid grid-cols-4 gap-2">
            {review.images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setSelectedImage(index)}
                className="relative aspect-square rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
              >
                <Image
                  src={image.url}
                  alt={image.alt || `Review image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Image Lightbox */}
      <AnimatePresence>
        {selectedImage !== null && review.images && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
            onClick={() => setSelectedImage(null)}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="relative w-full max-w-4xl aspect-square">
              <Image
                src={review.images[selectedImage].url}
                alt={review.images[selectedImage].alt || `Review image ${selectedImage + 1}`}
                fill
                className="object-contain"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-4 text-sm">
        {/* Helpful Button */}
        <button
          onClick={() => onHelpful?.(review.id)}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ThumbsUp className="w-4 h-4" />
          <span>Helpful ({review.helpfulCount})</span>
        </button>

        {/* Report Button */}
        <button
          onClick={() => setShowReportModal(true)}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <Flag className="w-4 h-4" />
          <span>Report</span>
        </button>

        {/* Reply Button */}
        <button
          onClick={() => setIsReplying(true)}
          className="flex items-center gap-1 text-rose-600 hover:text-rose-700 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Reply</span>
        </button>

        {/* Moderation Controls */}
        {canModerate && review.status !== ReviewStatus.APPROVED && (
          <div className="ml-auto space-x-3">
            <button
              onClick={() => onModerate?.(review.id, ReviewStatus.APPROVED)}
              className="px-3 py-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
            >
              Approve
            </button>
            <button
              onClick={() => onModerate?.(review.id, ReviewStatus.REJECTED)}
              className="px-3 py-1 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
            >
              Reject
            </button>
          </div>
        )}
      </div>

      {/* Replies */}
      {review.replies.length > 0 && (
        <div className="mt-4 space-y-3">
          {review.replies.map((reply) => (
            <div key={reply.id} className="ml-8 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                {reply.user.image && (
                  <div className="relative w-6 h-6 rounded-full overflow-hidden">
                    <Image
                      src={reply.user.image}
                      alt={reply.user.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <span className="font-medium text-sm">{reply.user.name}</span>
                <span className="text-gray-500 text-xs">
                  {new Date(reply.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700 text-sm">{reply.comment}</p>
            </div>
          ))}
        </div>
      )}

      {/* Reply Form */}
      <AnimatePresence>
        {isReplying && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 ml-8"
          >
            <textarea
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none 
                       focus:ring-2 focus:ring-rose-500 transition-shadow"
              rows={3}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write your reply..."
            />
            <div className="flex justify-end gap-3 mt-3">
              <button
                onClick={() => setIsReplying(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReplySubmit}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 
                         transition-colors"
              >
                Submit Reply
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowReportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white p-6 rounded-xl max-w-md w-full m-4"
            >
              <h3 className="text-lg font-semibold mb-4">Report Review</h3>
              <textarea
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none 
                         focus:ring-2 focus:ring-rose-500 transition-shadow"
                rows={4}
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Please explain why you're reporting this review..."
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReport}
                  className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 
                           transition-colors"
                >
                  Submit Report
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="mt-3 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
    </div>
  )
}

export default ReviewItem
