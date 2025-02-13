'use client';

import { useState } from 'react';
import { ProductFormData } from '@/app/types/seller';

type Category = {
  id: string;
  name: string;
  description?: string | null;
};

type ProductFormProps = {
  initialData?: ProductFormData;
  categories: Category[];
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
};

export default function ProductForm({ initialData, categories, onSubmit, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || 0,
    categoryId: initialData?.categoryId || (categories?.[0]?.id ?? ''),
    images: initialData?.images || [],
    quantity: initialData?.quantity || 0,
    tags: initialData?.tags || [],
    bulkDiscounts: initialData?.bulkDiscounts || [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const addBulkDiscount = () => {
    setFormData(prev => ({
      ...prev,
      bulkDiscounts: [...prev.bulkDiscounts, { minQuantity: 0, discount: 0 }],
    }));
  };

  const removeBulkDiscount = (index: number) => {
    setFormData(prev => ({
      ...prev,
      bulkDiscounts: prev.bulkDiscounts.filter((_, i) => i !== index),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={formData.description}
          onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          rows={3}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Price</label>
          <input
            type="number"
            value={formData.price}
            onChange={e => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            min="0"
            step="0.01"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Quantity</label>
          <input
            type="number"
            value={formData.quantity}
            onChange={e => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            min="0"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Category</label>
        <select
          value={formData.categoryId}
          onChange={e => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        >
          {(categories || []).map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Images (URLs)</label>
        <div className="space-y-2">
          {formData.images.map((url, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={e => {
                  const newImages = [...formData.images];
                  newImages[index] = e.target.value;
                  setFormData(prev => ({ ...prev, images: newImages }));
                }}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  images: prev.images.filter((_, i) => i !== index)
                }))}
                className="px-2 py-1 text-sm text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, images: [...prev.images, ''] }))}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            Add Image URL
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Tags</label>
        <input
          type="text"
          value={formData.tags.join(', ')}
          onChange={e => setFormData(prev => ({
            ...prev,
            tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
          }))}
          placeholder="Enter tags separated by commas"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">Bulk Discounts</label>
          <button
            type="button"
            onClick={addBulkDiscount}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            Add Discount
          </button>
        </div>
        <div className="space-y-2">
          {formData.bulkDiscounts.map((discount, index) => (
            <div key={index} className="flex gap-2 items-center">
              <input
                type="number"
                value={discount.minQuantity}
                onChange={e => {
                  const newDiscounts = [...formData.bulkDiscounts];
                  newDiscounts[index] = {
                    ...discount,
                    minQuantity: parseInt(e.target.value)
                  };
                  setFormData(prev => ({ ...prev, bulkDiscounts: newDiscounts }));
                }}
                placeholder="Min Quantity"
                className="w-32 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                min="1"
              />
              <input
                type="number"
                value={discount.discount}
                onChange={e => {
                  const newDiscounts = [...formData.bulkDiscounts];
                  newDiscounts[index] = {
                    ...discount,
                    discount: parseFloat(e.target.value)
                  };
                  setFormData(prev => ({ ...prev, bulkDiscounts: newDiscounts }));
                }}
                placeholder="Discount %"
                className="w-32 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                min="0"
                max="100"
                step="0.1"
              />
              <button
                type="button"
                onClick={() => removeBulkDiscount(index)}
                className="px-2 py-1 text-sm text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
        >
          {initialData ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
}
