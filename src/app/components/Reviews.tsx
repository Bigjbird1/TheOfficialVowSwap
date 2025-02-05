import React from 'react';
import { Product } from '../types';

interface ReviewsProps {
  product: Product;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  userName: string;
  date: string;
  helpful: number;
}

const Reviews: React.FC<ReviewsProps> = ({ product }) => {
  // This would typically come from an API
  const mockReviews: Review[] = [
    {
      id: '1',
      rating: 5,
      comment: 'Great product, exactly as described!',
      userName: 'John D.',
      date: '2025-01-30',
      helpful: 12
    },
    {
      id: '2',
      rating: 4,
      comment: 'Good quality but shipping took longer than expected.',
      userName: 'Sarah M.',
      date: '2025-01-28',
      helpful: 8
    }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} className={`text-xl ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}>
        ★
      </span>
    ));
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Customer Reviews</h2>
        <div className="flex items-center">
          <div className="mr-2">{renderStars(product.rating)}</div>
          <span className="text-gray-600">({product.reviewCount} reviews)</span>
        </div>
      </div>

      <div className="space-y-6">
        {mockReviews.map((review) => (
          <div key={review.id} className="border-b border-gray-200 pb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                {renderStars(review.rating)}
                <span className="ml-2 font-medium">{review.userName}</span>
              </div>
              <span className="text-gray-500 text-sm">{review.date}</span>
            </div>
            <p className="text-gray-700 mb-3">{review.comment}</p>
            <div className="flex items-center text-sm">
              <button className="flex items-center text-gray-500 hover:text-gray-700">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
                Helpful ({review.helpful})
              </button>
              <button className="ml-4 text-blue-600 hover:text-blue-800">Reply</button>
            </div>
          </div>
        ))}
      </div>

      <button className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
        Write a Review
      </button>
    </div>
  );
};

export default Reviews;
