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

  const inputClasses = "mt-1 block w-full rounded-xl border-gray-200 shadow-sm focus:border-rose-500 focus:ring focus:ring-rose-500/20 bg-white";
  const buttonClasses = {
    primary: "px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-rose-500 to-purple-600 rounded-xl hover:from-rose-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-all shadow-lg shadow-rose-200/50",
    secondary: "px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 shadow-sm",
    danger: "px-3 py-1 text-sm font-medium text-red-600 hover:text-red-800 transition-colors",
    link: "text-sm font-medium text-rose-600 hover:text-rose-800 transition-colors"
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className={inputClasses}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={formData.description}
          onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className={inputClasses}
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
            className={inputClasses}
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
            className={inputClasses}
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
          className={inputClasses}
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
                className={inputClasses}
              />
              <button
                type="button"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  images: prev.images.filter((_, i) => i !== index)
                }))}
                className={buttonClasses.danger}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, images: [...prev.images, ''] }))}
            className={buttonClasses.link}
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
          className={inputClasses}
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">Bulk Discounts</label>
          <button
            type="button"
            onClick={addBulkDiscount}
            className={buttonClasses.link}
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
                className={inputClasses}
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
                className={inputClasses}
                min="0"
                max="100"
                step="0.1"
              />
              <button
                type="button"
                onClick={() => removeBulkDiscount(index)}
                className={buttonClasses.danger}
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
          className={buttonClasses.secondary}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={buttonClasses.primary}
        >
          {initialData ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
}
