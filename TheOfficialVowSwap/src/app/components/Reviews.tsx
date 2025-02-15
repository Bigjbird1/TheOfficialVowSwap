import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Product, Review as ReviewType, ReviewStatus } from '@/app/types'
import ReviewForm from './reviews/ReviewForm'
import ReviewItem from './reviews/ReviewItem'

interface ReviewsProps {
  product: Product
}

const Reviews: React.FC<ReviewsProps> = ({ product }) => {
  const { data: session } = useSession()
  const [reviews, setReviews] = useState<ReviewType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [sortBy, setSortBy] = useState<'newest' | 'helpful'>('newest')

  useEffect(() => {
    fetchReviews()
  }, [product.id])

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?productId=${product.id}`)
      if (!response.ok) throw new Error('Failed to fetch reviews')
      const data = await response.json()
      setReviews(data)
    } catch (err) {
      setError('Failed to load reviews')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitReview = async () => {
    await fetchReviews()
    setShowReviewForm(false)
  }

  const handleModerate = async (reviewId: string, status: ReviewStatus) => {
    try {
      const response = await fetch('/api/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, status }),
      })
      if (!response.ok) throw new Error('Failed to moderate review')
      await fetchReviews()
    } catch (err) {
      setError('Failed to moderate review')
    }
  }

  const handleReport = async (reviewId: string, reason: string) => {
    try {
      const response = await fetch('/api/reviews/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, reason }),
      })
      if (!response.ok) throw new Error('Failed to report review')
    } catch (err) {
      setError('Failed to report review')
    }
  }

  const handleHelpful = async (reviewId: string) => {
    try {
      const response = await fetch('/api/reviews/helpful', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId }),
      })
      if (!response.ok) throw new Error('Failed to mark review as helpful')
      await fetchReviews()
    } catch (err) {
      setError('Failed to mark review as helpful')
    }
  }

  const handleReply = async (reviewId: string, comment: string) => {
    try {
      const response = await fetch('/api/reviews/replies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, comment }),
      })
      if (!response.ok) throw new Error('Failed to submit reply')
      await fetchReviews()
    } catch (err) {
      setError('Failed to submit reply')
    }
  }

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
    return b.helpfulCount - a.helpfulCount
  })

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

  if (isLoading) {
    return <div className="mt-8">Loading reviews...</div>
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Customer Reviews</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="mr-2">{renderStars(product.rating)}</div>
            <span className="text-gray-600">
              ({product.reviewCount} reviews)
            </span>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'helpful')}
            className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 text-red-500">{error}</div>
      )}

      {showReviewForm ? (
        <ReviewForm
          productId={product.id}
          onSubmit={handleSubmitReview}
          onCancel={() => setShowReviewForm(false)}
        />
      ) : (
        <button
          onClick={() => setShowReviewForm(true)}
          className="mb-6 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Write a Review
        </button>
      )}

      <div className="space-y-6">
        {sortedReviews.map((review) => (
          <ReviewItem
            key={review.id}
            review={review}
            onModerate={handleModerate}
            onReport={handleReport}
            onHelpful={handleHelpful}
            onReply={handleReply}
          />
        ))}
      </div>

      {reviews.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No reviews yet. Be the first to review this product!
        </div>
      )}
    </div>
  )
}

export default Reviews
