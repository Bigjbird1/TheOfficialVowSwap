import React from 'react';
import { Product } from '../types';

interface SellerInfoProps {
  product: Product;
}

const SellerInfo: React.FC<SellerInfoProps> = ({ product }) => {
  const renderSellerRating = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} className={`text-sm ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}>
        ★
      </span>
    ));
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Sold by</h3>
        <button className="text-sm text-blue-600 hover:text-blue-800">
          Visit Store
        </button>
      </div>
      
      <div className="flex items-center mb-3">
        <span className="font-medium text-gray-800 mr-2">{product.sellerName}</span>
        <div className="flex items-center">
          {renderSellerRating(product.sellerRating)}
          <span className="ml-1 text-sm text-gray-600">({product.sellerRating.toFixed(1)})</span>
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Verified Seller</span>
        </div>
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Fast Shipping</span>
        </div>
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <span>Secure Payments</span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100">
        <button className="w-full bg-gray-100 text-gray-800 py-2 px-4 rounded hover:bg-gray-200 transition-colors">
          Contact Seller
        </button>
      </div>
    </div>
  );
};

export default SellerInfo;
