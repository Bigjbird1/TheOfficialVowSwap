import { useState } from 'react';
import { Promotion, BulkDiscount, CreatePromotionRequest } from '@/app/types/promotions';

interface BulkDiscountFormProps {
  promotion?: Promotion | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function BulkDiscountForm({ promotion, onCancel, onSuccess }: BulkDiscountFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreatePromotionRequest>({
    name: promotion?.name || '',
    description: promotion?.description || '',
    type: 'BULK_DISCOUNT',
    startDate: promotion?.startDate.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
    endDate: promotion?.endDate.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
    bulkDiscount: {
      productId: promotion?.bulkDiscount?.productId || '',
      minQuantity: promotion?.bulkDiscount?.minQuantity || 2,
      discount: promotion?.bulkDiscount?.discount || 0,
      isActive: promotion?.bulkDiscount?.isActive ?? true
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = promotion 
        ? `/api/seller/promotions/${promotion.id}`
        : '/api/seller/promotions';
      
      const response = await fetch(url, {
        method: promotion ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save bulk discount');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving bulk discount:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          name="name"
          id="name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          name="description"
          id="description"
          rows={3}
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <input
            type="date"
            name="startDate"
            id="startDate"
            required
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
            End Date
          </label>
          <input
            type="date"
            name="endDate"
            id="endDate"
            required
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="productId" className="block text-sm font-medium text-gray-700">
          Product ID
        </label>
        <input
          type="text"
          name="productId"
          id="productId"
          required
          value={formData.bulkDiscount?.productId}
          onChange={(e) => setFormData({
            ...formData,
            bulkDiscount: {
              ...formData.bulkDiscount!,
              productId: e.target.value
            }
          })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="minQuantity" className="block text-sm font-medium text-gray-700">
          Minimum Quantity
        </label>
        <input
          type="number"
          name="minQuantity"
          id="minQuantity"
          required
          min="2"
          value={formData.bulkDiscount?.minQuantity}
          onChange={(e) => setFormData({
            ...formData,
            bulkDiscount: {
              ...formData.bulkDiscount!,
              minQuantity: parseInt(e.target.value)
            }
          })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="discount" className="block text-sm font-medium text-gray-700">
          Discount Percentage
        </label>
        <input
          type="number"
          name="discount"
          id="discount"
          required
          min="0"
          max="100"
          value={formData.bulkDiscount?.discount}
          onChange={(e) => setFormData({
            ...formData,
            bulkDiscount: {
              ...formData.bulkDiscount!,
              discount: parseFloat(e.target.value)
            }
          })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="isActive"
          id="isActive"
          checked={formData.bulkDiscount?.isActive}
          onChange={(e) => setFormData({
            ...formData,
            bulkDiscount: {
              ...formData.bulkDiscount!,
              isActive: e.target.checked
            }
          })}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
          Active
        </label>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {isSubmitting ? 'Saving...' : promotion ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}
