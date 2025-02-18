import React, { useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { Star, X, Upload, Image as ImageIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ReviewFormProps {
  productId: string
  onSubmit: () => void
  onCancel: () => void
}

interface ImagePreview {
  file: File
  preview: string
}

const MAX_IMAGES = 5
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

const ReviewForm: React.FC<ReviewFormProps> = ({ productId, onSubmit, onCancel }) => {
  const { data: session } = useSession()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [images, setImages] = useState<ImagePreview[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [hoverRating, setHoverRating] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    if (images.length + files.length > MAX_IMAGES) {
      setError(`You can only upload up to ${MAX_IMAGES} images`)
      return
    }

    const invalidFile = files.find(file => !ALLOWED_TYPES.includes(file.type))
    if (invalidFile) {
      setError('Only JPEG, PNG and WebP images are allowed')
      return
    }

    const oversizedFile = files.find(file => file.size > MAX_SIZE)
    if (oversizedFile) {
      setError('Images must be under 5MB')
      return
    }

    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }))

    setImages(prev => [...prev, ...newImages])
    setError('')

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev]
      URL.revokeObjectURL(newImages[index].preview)
      newImages.splice(index, 1)
      return newImages
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) {
      setError('Please sign in to submit a review')
      return
    }

    if (rating === 0) {
      setError('Please select a rating')
      return
    }

    try {
      setIsSubmitting(true)
      
      // Upload images first if any
      const uploadedImages = []
      if (images.length > 0) {
        const formData = new FormData()
        images.forEach((image, index) => {
          formData.append(`image${index}`, image.file)
        })
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
        
        if (!uploadResponse.ok) {
          throw new Error('Failed to upload images')
        }
        
        const { urls } = await uploadResponse.json()
        uploadedImages.push(...urls)
      }

      // Submit review with image URLs
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          rating,
          comment,
          images: uploadedImages.map((url, index) => ({
            url,
            alt: `Review image ${index + 1}`
          }))
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to submit review')
      }

      onSubmit()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm">
      <h3 className="text-xl font-semibold mb-6">Write a Review</h3>
      
      {/* Rating Stars */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rating
        </label>
        <div className="flex items-center gap-2">
          <div 
            className="flex gap-1"
            onMouseLeave={() => setHoverRating(0)}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none transition-transform hover:scale-110"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoverRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  } transition-colors`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <span className="text-sm text-gray-600">
              {rating === 5 ? "Love it!" :
               rating === 4 ? "Really good" :
               rating === 3 ? "It's okay" :
               rating === 2 ? "Not great" :
               "Disappointed"}
            </span>
          )}
        </div>
      </div>

      {/* Review Text */}
      <div className="mb-6">
        <label
          htmlFor="comment"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Your Review
        </label>
        <textarea
          id="comment"
          rows={4}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 
                   focus:ring-rose-500 transition-shadow"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this product..."
        />
      </div>

      {/* Image Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add Photos
        </label>
        <div className="flex flex-wrap gap-4">
          {/* Image Previews */}
          <AnimatePresence>
            {images.map((image, index) => (
              <motion.div
                key={image.preview}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative"
              >
                <div className="w-24 h-24 rounded-lg overflow-hidden">
                  <img
                    src={image.preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full 
                           hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Upload Button */}
          {images.length < MAX_IMAGES && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed 
                       border-gray-300 rounded-lg hover:border-rose-500 hover:bg-rose-50 
                       transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
            >
              <Upload className="w-6 h-6 text-gray-400" />
              <span className="text-sm text-gray-500 mt-2">Upload</span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Upload up to {MAX_IMAGES} images (JPEG, PNG or WebP, max 5MB each)
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 
                   focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 
                   disabled:opacity-50 disabled:hover:bg-rose-600 transition-colors"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </div>
    </form>
  )
}

export default ReviewForm
