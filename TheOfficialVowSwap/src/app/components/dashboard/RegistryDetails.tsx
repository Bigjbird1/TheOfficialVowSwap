import { useState } from 'react';
import { useRegistry } from '@/app/contexts/RegistryContext';
import Image from 'next/image';

export default function RegistryDetails() {
  const {
    registry,
    isLoading,
    updateRegistry,
    removeFromRegistry,
    updateRegistryItem
  } = useRegistry();

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(registry?.title || '');
  const [eventDate, setEventDate] = useState(registry?.eventDate ? new Date(registry.eventDate).toISOString().split('T')[0] : '');
  const [description, setDescription] = useState(registry?.description || '');
  const [isPublic, setIsPublic] = useState(registry?.isPublic || false);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!registry) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-semibold text-gray-800">No Registry Found</h2>
        <p className="mt-2 text-gray-600">Create a registry to get started!</p>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      await updateRegistry({
        title,
        eventDate: new Date(eventDate),
        description,
        isPublic
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update registry:', error);
    }
  };

  const handleUpdatePriority = async (productId: string, priority: number) => {
    try {
      await updateRegistryItem(productId, { priority });
    } catch (error) {
      console.error('Failed to update priority:', error);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      await removeFromRegistry(productId);
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const calculateProgress = (purchased: number, quantity: number) => {
    return (purchased / quantity) * 100;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Event Date</label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows={3}
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label className="ml-2 text-sm text-gray-700">Make registry public</label>
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{registry.title}</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Event Date: {new Date(registry.eventDate).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Edit Details
              </button>
            </div>
            {registry.description && (
              <p className="text-gray-600 mt-2">{registry.description}</p>
            )}
            <div className="mt-2 flex items-center">
              <span className="text-sm text-gray-500">
                {registry.isPublic ? 'Public Registry' : 'Private Registry'}
              </span>
              {registry.isPublic && (
                <button
                  onClick={() => navigator.clipboard.writeText(registry.shareableLink)}
                  className="ml-2 text-sm text-indigo-600 hover:text-indigo-500"
                >
                  Copy Share Link
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {registry.items.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start space-x-4">
              <div className="relative h-24 w-24 flex-shrink-0">
                <Image
                  src={item.product.images[0]}
                  alt={item.product.name}
                  fill
                  className="object-cover rounded-md"
                />
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <h3 className="text-lg font-medium text-gray-900">{item.product.name}</h3>
                  <button
                    onClick={() => handleRemoveItem(item.productId)}
                    className="text-red-600 hover:text-red-500"
                  >
                    Remove
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-500">${item.product.price.toFixed(2)}</p>
                <div className="mt-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Purchased: {item.purchased} of {item.quantity}</span>
                    <select
                      value={item.priority}
                      onChange={(e) => handleUpdatePriority(item.productId, Number(e.target.value))}
                      className="ml-4 border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="0">Low Priority</option>
                      <option value="1">Medium Priority</option>
                      <option value="2">High Priority</option>
                    </select>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${calculateProgress(item.purchased, item.quantity)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
