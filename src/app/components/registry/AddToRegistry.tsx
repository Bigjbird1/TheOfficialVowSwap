'use client';

import { useState } from 'react';
import { useRegistry } from '../../contexts/RegistryContext';
import { useSession } from 'next-auth/react';

interface AddToRegistryProps {
  productId: string;
}

export function AddToRegistry({ productId }: AddToRegistryProps) {
  const { data: session } = useSession();
  const { addToRegistry, isInRegistry } = useRegistry();
  const [isAdding, setIsAdding] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [priority, setPriority] = useState(0);
  const [error, setError] = useState('');

  const handleAddToRegistry = async () => {
    if (!session) {
      setError('Please sign in to add items to your registry');
      return;
    }

    setIsAdding(true);
    setError('');

    try {
      await addToRegistry(productId, quantity, priority);
      setShowOptions(false);
      // Reset values for next time
      setQuantity(1);
      setPriority(0);
    } catch (err) {
      setError('Failed to add item to registry. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  if (isInRegistry(productId)) {
    return (
      <div className="text-sm text-gray-600">
        ✓ Added to Registry
      </div>
    );
  }

  return (
    <div className="relative">
      {error && (
        <div className="mb-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {showOptions ? (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-2 py-1 border rounded hover:bg-gray-100"
              >
                -
              </button>
              <span className="w-8 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-2 py-1 border rounded hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              className="w-full border rounded p-2"
            >
              <option value={0}>Low Priority</option>
              <option value={1}>Medium Priority</option>
              <option value={2}>High Priority</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowOptions(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={handleAddToRegistry}
              disabled={isAdding}
              className={`flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isAdding ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isAdding ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowOptions(true)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add to Registry
        </button>
      )}
    </div>
  );
}
