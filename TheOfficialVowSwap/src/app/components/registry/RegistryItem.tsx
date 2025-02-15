'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRegistry } from '../../contexts/RegistryContext';

interface RegistryItemProps {
  item: {
    productId: string;
    product: {
      id: string;
      name: string;
      price: number;
      images: string[];
      description: string;
    };
    quantity: number;
    purchased: number;
    priority: number;
  };
}

export function RegistryItem({ item }: RegistryItemProps) {
  const { updateRegistryItem, removeFromRegistry } = useRegistry();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    setIsUpdating(true);
    try {
      await updateRegistryItem(item.productId, { quantity: newQuantity });
    } catch (error) {
      console.error('Failed to update quantity:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePriorityChange = async (newPriority: number) => {
    setIsUpdating(true);
    try {
      await updateRegistryItem(item.productId, { priority: newPriority });
    } catch (error) {
      console.error('Failed to update priority:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm('Are you sure you want to remove this item from your registry?')) return;
    setIsUpdating(true);
    try {
      await removeFromRegistry(item.productId);
    } catch (error) {
      console.error('Failed to remove item:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const remainingNeeded = item.quantity - item.purchased;

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${isUpdating ? 'opacity-75' : ''}`}>
      <div className="flex gap-4">
        <div className="relative w-24 h-24">
          <Image
            src={item.product.images[0]}
            alt={item.product.name}
            fill
            className="object-cover rounded"
          />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{item.product.name}</h3>
          <p className="text-gray-600">${item.product.price.toFixed(2)}</p>
          
          <div className="mt-2 flex items-center gap-4">
            <div>
              <label className="block text-sm text-gray-600">Quantity</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQuantityChange(item.quantity - 1)}
                  disabled={isUpdating || item.quantity <= 1}
                  className="px-2 py-1 border rounded hover:bg-gray-100"
                >
                  -
                </button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(item.quantity + 1)}
                  disabled={isUpdating}
                  className="px-2 py-1 border rounded hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600">Priority</label>
              <select
                value={item.priority}
                onChange={(e) => handlePriorityChange(Number(e.target.value))}
                disabled={isUpdating}
                className="border rounded p-1"
              >
                <option value={0}>Low</option>
                <option value={1}>Medium</option>
                <option value={2}>High</option>
              </select>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {remainingNeeded} needed • {item.purchased} purchased
            </div>
            <button
              onClick={handleRemove}
              disabled={isUpdating}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
