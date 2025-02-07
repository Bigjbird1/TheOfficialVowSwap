'use client';

import { useState } from 'react';
import { useRegistry } from '../../contexts/RegistryContext';
import { RegistryItem } from './RegistryItem';

interface RegistryProps {
  registry: {
    id: string;
    title: string;
    eventDate: Date;
    description?: string;
    isPublic: boolean;
    shareableLink: string;
    items: any[];
  };
}

export function Registry({ registry }: RegistryProps) {
  const { updateRegistry } = useRegistry();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(registry.title);
  const [eventDate, setEventDate] = useState(new Date(registry.eventDate).toISOString().split('T')[0]);
  const [description, setDescription] = useState(registry.description || '');
  const [isPublic, setIsPublic] = useState(registry.isPublic);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      await updateRegistry({
        title,
        eventDate: new Date(eventDate),
        description,
        isPublic,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update registry:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const sortedItems = [...registry.items].sort((a, b) => {
    // Sort by priority (high to low) then by date added (newest first)
    if (b.priority !== a.priority) {
      return b.priority - a.priority;
    }
    return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Registry Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wedding Date
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
                Make this registry public
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isUpdating}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold">{registry.title}</h1>
                <p className="text-gray-600">
                  Wedding Date: {new Date(registry.eventDate).toLocaleDateString()}
                </p>
                {registry.description && (
                  <p className="mt-2 text-gray-700">{registry.description}</p>
                )}
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Edit Registry
              </button>
            </div>

            {registry.isPublic && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600 mb-2">Share your registry:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={registry.shareableLink}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(registry.shareableLink)}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {sortedItems.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            No items in your registry yet. Start adding items from our product catalog!
          </div>
        ) : (
          sortedItems.map((item) => (
            <RegistryItem key={item.productId} item={item} />
          ))
        )}
      </div>
    </div>
  );
}
