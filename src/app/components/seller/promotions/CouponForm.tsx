import { useState } from 'react';
import { Promotion, CreatePromotionRequest, DiscountType } from '@/app/types/promotions';

interface CouponFormProps {
  promotion: Promotion | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function CouponForm({ promotion, onCancel, onSuccess }: CouponFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreatePromotionRequest>({
    name: promotion?.name || '',
    description: promotion?.description || '',
    type: 'COUPON',
    startDate: promotion?.startDate ? new Date(promotion.startDate).toISOString().substring(0, 10) : new Date().toISOString().substring(0, 10),
    endDate: promotion?.endDate ? new Date(promotion.endDate).toISOString().substring(0, 10) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
    couponCode: {
      code: promotion?.couponCode?.code || '',
      discountType: (promotion?.couponCode?.discountType as DiscountType) || 'PERCENTAGE',
      discountValue: promotion?.couponCode?.discountValue || 0,
      minimumPurchase: promotion?.couponCode?.minimumPurchase || undefined,
      maxUses: promotion?.couponCode?.maxUses || undefined,
      perUserLimit: promotion?.couponCode?.perUserLimit || undefined,
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = promotion
        ? `/api/seller/promotions?id=${promotion.id}`
        : '/api/seller/promotions';
      const method = promotion ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
      } else {
        throw new Error(data.error || 'Failed to save coupon');
      }
    } catch (error) {
      console.error('Error saving coupon:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('coupon.')) {
      const couponField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        couponCode: {
          ...prev.couponCode!,
          [couponField]: value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Promotion Name
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="name"
              id="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="description"
              id="description"
              value={formData.description || ''}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="coupon.code" className="block text-sm font-medium text-gray-700">
            Coupon Code
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="coupon.code"
              id="coupon.code"
              required
              value={formData.couponCode?.code}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="coupon.discountType" className="block text-sm font-medium text-gray-700">
            Discount Type
          </label>
          <div className="mt-1">
            <select
              name="coupon.discountType"
              id="coupon.discountType"
              required
              value={formData.couponCode?.discountType}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="PERCENTAGE">Percentage</option>
              <option value="FIXED_AMOUNT">Fixed Amount</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="coupon.discountValue" className="block text-sm font-medium text-gray-700">
            Discount Value
          </label>
          <div className="mt-1">
            <input
              type="number"
              name="coupon.discountValue"
              id="coupon.discountValue"
              required
              min="0"
              step={formData.couponCode?.discountType === 'PERCENTAGE' ? '1' : '0.01'}
              value={formData.couponCode?.discountValue}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="coupon.minimumPurchase" className="block text-sm font-medium text-gray-700">
            Minimum Purchase Amount
          </label>
          <div className="mt-1">
            <input
              type="number"
              name="coupon.minimumPurchase"
              id="coupon.minimumPurchase"
              min="0"
              step="0.01"
              value={formData.couponCode?.minimumPurchase || ''}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <div className="mt-1">
            <input
              type="date"
              name="startDate"
              id="startDate"
              required
              value={formData.startDate}
              onChange={handleChange}
              min={new Date().toISOString().substring(0, 10)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
            End Date
          </label>
          <div className="mt-1">
            <input
              type="date"
              name="endDate"
              id="endDate"
              required
              value={formData.endDate}
              onChange={handleChange}
              min={formData.startDate}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="coupon.maxUses" className="block text-sm font-medium text-gray-700">
            Maximum Uses
          </label>
          <div className="mt-1">
            <input
              type="number"
              name="coupon.maxUses"
              id="coupon.maxUses"
              min="0"
              value={formData.couponCode?.maxUses || ''}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="coupon.perUserLimit" className="block text-sm font-medium text-gray-700">
            Per User Limit
          </label>
          <div className="mt-1">
            <input
              type="number"
              name="coupon.perUserLimit"
              id="coupon.perUserLimit"
              min="0"
              value={formData.couponCode?.perUserLimit || ''}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>
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
          {isSubmitting ? 'Saving...' : promotion ? 'Update Coupon' : 'Create Coupon'}
        </button>
      </div>
    </form>
  );
}
