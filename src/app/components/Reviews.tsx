import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Star, StarHalf, Image as ImageIcon, ThumbsUp, Filter } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Product, Review as ReviewType, ReviewStatus } from '@/app/types'
import ReviewForm from './reviews/ReviewForm'
import ReviewItem from './reviews/ReviewItem'

interface ReviewsProps {
  product: Product
}

interface RatingBreakdown {
  [key: number]: {
    count: number;
    percentage: number;
  }
}

type SortOption = 'newest' | 'helpful' | 'highest' | 'lowest';

const Reviews: React.FC<ReviewsProps> = ({ product }) => {
  const { data: session } = useSession()
  const [reviews, setReviews] = useState<ReviewType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [ratingFilter, setRatingFilter] = useState<number[]>([])
  const [showPhotoReviews, setShowPhotoReviews] = useState(false)
  const [ratingBreakdown, setRatingBreakdown] = useState<RatingBreakdown>({})

  useEffect(() => {
    fetchReviews()
  }, [product.id])

  useEffect(() => {
    calculateRatingBreakdown()
  }, [reviews])

  const calculateRatingBreakdown = () => {
    const breakdown: RatingBreakdown = {
      5: { count: 0, percentage: 0 },
      4: { count: 0, percentage: 0 },
      3: { count: 0, percentage: 0 },
      2: { count: 0, percentage: 0 },
      1: { count: 0, percentage: 0 },
    }

    reviews.forEach(review => {
      if (breakdown[review.rating]) {
        breakdown[review.rating].count++
      }
    })

    // Calculate percentages
    const total = reviews.length
    Object.keys(breakdown).forEach(rating => {
      const count = breakdown[Number(rating)].count
      breakdown[Number(rating)].percentage = total > 0 ? (count / total) * 100 : 0
    })

    setRatingBreakdown(breakdown)
  }

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

  const toggleRatingFilter = (rating: number) => {
    setRatingFilter(prev => 
      prev.includes(rating)
        ? prev.filter(r => r !== rating)
        : [...prev, rating]
    )
  }

  const filteredReviews = reviews.filter(review => {
    if (ratingFilter.length > 0 && !ratingFilter.includes(review.rating)) {
      return false
    }
    if (showPhotoReviews && (!review.images || review.images.length === 0)) {
      return false
    }
    return true
  })

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'helpful':
        return b.helpfulCount - a.helpfulCount
      case 'highest':
        return b.rating - a.rating
      case 'lowest':
        return a.rating - b.rating
      default:
        return 0
    }
  })

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={`full-${i}`} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
      )
    }

    if (hasHalfStar) {
      stars.push(
        <StarHalf key="half" className="w-5 h-5 fill-yellow-400 text-yellow-400" />
      )
    }

    const remainingStars = 5 - stars.length
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-5 h-5 text-gray-300" />
      )
    }

    return <div className="flex">{stars}</div>
  }

  if (isLoading) {
    return <div className="mt-8">Loading reviews...</div>
  }

  return (
    <div className="mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Rating Summary */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Rating Summary</h2>
          <div className="flex items-center gap-4 mb-6">
            <div className="text-4xl font-bold text-gray-900">
              {product.rating.toFixed(1)}
            </div>
            <div>
              {renderStars(product.rating)}
              <p className="text-gray-600 mt-1">
                Based on {product.reviewCount} reviews
              </p>
            </div>
          </div>

          {/* Rating Breakdown */}
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map(rating => (
              <button
                key={rating}
                onClick={() => toggleRatingFilter(rating)}
                className={`w-full flex items-center gap-4 p-2 rounded-lg transition-colors
                          ${ratingFilter.includes(rating) ? 'bg-rose-50' : 'hover:bg-gray-50'}`}
              >
                <div className="flex items-center gap-1 min-w-[48px]">
                  <Star className={`w-4 h-4 ${rating > 0 ? 'text-yellow-400' : 'text-gray-300'}`} />
                  <span>{rating}</span>
                </div>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full"
                    style={{ width: `${ratingBreakdown[rating]?.percentage || 0}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 min-w-[48px]">
                  {ratingBreakdown[rating]?.count || 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Review Controls */}
        <div className="space-y-6">
          {session ? (
            showReviewForm ? (
              <ReviewForm
                productId={product.id}
                onSubmit={handleSubmitReview}
                onCancel={() => setShowReviewForm(false)}
              />
            ) : (
              <button
                onClick={() => setShowReviewForm(true)}
                className="w-full bg-rose-600 text-white py-3 px-6 rounded-xl hover:bg-rose-700 
                         transition-colors font-medium shadow-sm hover:shadow-md"
              >
                Write a Review
              </button>
            )
          ) : (
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              Please sign in to write a review
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 
                       focus:ring-rose-500 bg-white"
            >
              <option value="newest">Newest First</option>
              <option value="helpful">Most Helpful</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
            </select>

            <button
              onClick={() => setShowPhotoReviews(!showPhotoReviews)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors
                        ${showPhotoReviews 
                          ? 'bg-rose-50 border-rose-200 text-rose-700'
                          : 'border-gray-300 hover:bg-gray-50'
                        }`}
            >
              <ImageIcon className="w-4 h-4" />
              With Photos
            </button>

            {ratingFilter.length > 0 && (
              <button
                onClick={() => setRatingFilter([])}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 
                         border border-gray-300"
              >
                <Filter className="w-4 h-4" />
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
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

      {sortedReviews.length === 0 && (
        <div className="text-center text-gray-500 py-12 bg-gray-50 rounded-xl">
          {reviews.length === 0
            ? "No reviews yet. Be the first to review this product!"
            : "No reviews match your filters."}
        </div>
      )}
    </div>
  )
}

export default Reviews
