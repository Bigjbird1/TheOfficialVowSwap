import React from 'react';
import { Product } from '../types';

interface PurchaseIncentivesProps {
  product: Product;
}

const PurchaseIncentives: React.FC<PurchaseIncentivesProps> = ({ product }) => {
  const getStockStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'in stock':
        return 'text-green-600';
      case 'low stock':
        return 'text-orange-600';
      case 'out of stock':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      {/* Stock Status */}
      <div className="flex items-center mb-4">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
        <span className={`font-medium ${getStockStatusColor(product.stockStatus)}`}>
          {product.stockStatus}
          {product.stockStatus.toLowerCase() === 'low stock' && ' - Order soon!'}
        </span>
      </div>

      {/* Shipping Information */}
      <div className="flex items-start mb-4">
        <svg className="w-5 h-5 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
        <div>
          <span className="font-medium block">Fast & Reliable Shipping</span>
          <span className="text-sm text-gray-600">{product.shippingInfo}</span>
        </div>
      </div>

      {/* Return Policy */}
      <div className="flex items-start mb-4">
        <svg className="w-5 h-5 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
        </svg>
        <div>
          <span className="font-medium block">30-Day Returns</span>
          <span className="text-sm text-gray-600">Not satisfied? Return within 30 days for a full refund</span>
        </div>
      </div>

      {/* Price Guarantee */}
      <div className="flex items-start">
        <svg className="w-5 h-5 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <div>
          <span className="font-medium block">Best Price Guarantee</span>
          <span className="text-sm text-gray-600">Found a better price? We'll match it!</span>
        </div>
      </div>

      {/* Purchase Protection Banner */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-sm text-blue-800 font-medium">Your purchase is protected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseIncentives;
