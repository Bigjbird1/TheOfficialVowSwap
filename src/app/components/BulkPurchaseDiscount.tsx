import React, { useState } from 'react';
import { Product } from '../types';

interface BulkPurchaseDiscountProps {
  product: Product;
  onQuantityChange?: (quantity: number) => void;
}

interface DiscountTier {
  quantity: number;
  discount: number;
  label: string;
}

const BulkPurchaseDiscount: React.FC<BulkPurchaseDiscountProps> = ({ product, onQuantityChange }) => {
  const [quantity, setQuantity] = useState(1);

  // These would typically come from the backend
  const discountTiers: DiscountTier[] = [
    { quantity: 1, discount: 0, label: 'Single Item' },
    { quantity: 3, discount: 5, label: 'Small Bulk' },
    { quantity: 5, discount: 10, label: 'Medium Bulk' },
    { quantity: 10, discount: 15, label: 'Large Bulk' }
  ];

  const getCurrentTier = () => {
    for (let i = discountTiers.length - 1; i >= 0; i--) {
      if (quantity >= discountTiers[i].quantity) {
        return discountTiers[i];
      }
    }
    return discountTiers[0];
  };

  const getNextTier = () => {
    const currentTierIndex = discountTiers.findIndex(tier => tier.quantity > quantity);
    return currentTierIndex !== -1 ? discountTiers[currentTierIndex] : null;
  };

  const calculatePrice = (basePrice: number, quantity: number, discount: number) => {
    const discountedPrice = basePrice * (1 - discount / 100);
    return discountedPrice * quantity;
  };

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity);
    onQuantityChange?.(newQuantity);
  };

  const currentTier = getCurrentTier();
  const nextTier = getNextTier();
  const totalPrice = calculatePrice(product.price, quantity, currentTier.discount);
  const regularPrice = product.price * quantity;
  const savings = regularPrice - totalPrice;

  const progressToNextTier = nextTier
    ? ((quantity - currentTier.quantity) / (nextTier.quantity - currentTier.quantity)) * 100
    : 100;

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Bulk Purchase Savings</h3>

      {/* Quantity Selector */}
      <div className="flex items-center mb-4">
        <label htmlFor="quantity" className="mr-3 text-gray-600">
          Quantity:
        </label>
        <div className="flex items-center border rounded">
          <button
            onClick={() => handleQuantityChange(Math.max(1, quantity - 1))}
            className="px-3 py-1 border-r hover:bg-gray-100"
          >
            -
          </button>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => handleQuantityChange(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-16 text-center py-1 focus:outline-none"
            min="1"
          />
          <button
            onClick={() => handleQuantityChange(quantity + 1)}
            className="px-3 py-1 border-l hover:bg-gray-100"
          >
            +
          </button>
        </div>
      </div>

      {/* Current Discount Info */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Current Discount:</span>
          <span className="text-lg font-semibold text-green-600">{currentTier.discount}% off</span>
        </div>
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Regular Price:</span>
          <span className="line-through">${regularPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center font-medium">
          <span>Your Price:</span>
          <span className="text-green-600">${totalPrice.toFixed(2)}</span>
        </div>
        {savings > 0 && (
          <div className="mt-2 text-sm text-green-600 font-medium">
            You save: ${savings.toFixed(2)}
          </div>
        )}
      </div>

      {/* Progress to Next Tier */}
      {nextTier && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress to {nextTier.label} ({nextTier.discount}% off)</span>
            <span>{nextTier.quantity - quantity} more items</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 rounded-full h-2 transition-all duration-300"
              style={{ width: `${progressToNextTier}%` }}
            />
          </div>
        </div>
      )}

      {/* Discount Tiers */}
      <div className="space-y-2">
        <h4 className="font-medium text-sm mb-2">Volume Discount Tiers:</h4>
        {discountTiers.map((tier) => (
          <div
            key={tier.quantity}
            className={`flex justify-between items-center p-2 rounded ${
              tier === currentTier ? 'bg-blue-50 border border-blue-200' : ''
            }`}
          >
            <span className="text-sm">{tier.quantity}+ items</span>
            <span className="text-sm font-medium">{tier.discount}% off</span>
          </div>
        ))}
      </div>

      {/* Bulk Benefits */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <h4 className="font-medium text-sm mb-2">Bulk Purchase Benefits:</h4>
        <ul className="text-sm text-gray-600 space-y-2">
          <li className="flex items-center">
            <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            Priority Shipping
          </li>
          <li className="flex items-center">
            <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            Bulk Packaging
          </li>
          <li className="flex items-center">
            <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            Dedicated Support
          </li>
        </ul>
      </div>
    </div>
  );
};

export default BulkPurchaseDiscount;
