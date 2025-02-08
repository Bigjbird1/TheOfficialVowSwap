import { useState } from 'react';
import { Promotion, FlashSale, DiscountType, CreatePromotionRequest } from '@/app/types/promotions';

interface FlashSaleFormProps {
  promotion?: Promotion | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function FlashSaleForm({ promotion, onCancel, onSuccess }: FlashSaleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreatePromotionRequest>({
    name: promotion?.name || '',
    description: promotion?.description || '',
    type: 'FLASH_SALE',
    startDate: promotion?.startDate.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
    endDate: promotion?.endDate.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
    flashSale: {
      discountType: (promotion?.flashSale?.discountType as DiscountType) || 'PERCENTAGE',
      discountValue: promotion?.flashSale?.discountValue || 0,
      productIds: promotion?.flashSale?.productIds || [],
      categoryId: promotion?.flashSale?.categoryId
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
        throw new Error('Failed to save flash sale');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving flash sale:', error);
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
        <label htmlFor="discountType" className="block text-sm font-medium text-gray-700">
          Discount Type
        </label>
        <select
          id="discountType"
          name="discountType"
          required
          value={formData.flashSale?.discountType}
          onChange={(e) => setFormData({
            ...formData,
            flashSale: {
              ...formData.flashSale!,
              discountType: e.target.value as DiscountType
            }
          })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="PERCENTAGE">Percentage</option>
          <option value="FIXED_AMOUNT">Fixed Amount</option>
        </select>
      </div>

      <div>
        <label htmlFor="discountValue" className="block text-sm font-medium text-gray-700">
          Discount Value
        </label>
        <input
          type="number"
          name="discountValue"
          id="discountValue"
          required
          min="0"
          step={formData.flashSale?.discountType === 'PERCENTAGE' ? '1' : '0.01'}
          value={formData.flashSale?.discountValue}
          onChange={(e) => setFormData({
            ...formData,
            flashSale: {
              ...formData.flashSale!,
              discountValue: parseFloat(e.target.value)
            }
          })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
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
