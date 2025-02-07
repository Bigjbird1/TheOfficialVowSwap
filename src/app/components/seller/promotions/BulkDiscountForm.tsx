import { useState, useEffect } from 'react';
import { Promotion, CreatePromotionRequest } from '@/app/types/promotions';

interface BulkDiscountFormProps {
  promotion: Promotion | null;
  onCancel: () => void;
  onSuccess: () => void;
}

interface Product {
  id: string;
  name: string;
  price: number;
}

export default function BulkDiscountForm({ promotion, onCancel, onSuccess }: BulkDiscountFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState<CreatePromotionRequest>({
    name: promotion?.name || '',
    description: promotion?.description || '',
    type: 'BULK_DISCOUNT',
    startDate: promotion?.startDate ? new Date(promotion.startDate).toISOString().substring(0, 10) : new Date().toISOString().substring(0, 10),
    endDate: promotion?.endDate ? new Date(promotion.endDate).toISOString().substring(0, 10) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
    bulkDiscount: {
      productId: promotion?.bulkDiscount?.productId || '',
      minQuantity: promotion?.bulkDiscount?.minQuantity || 2,
      discount: promotion?.bulkDiscount?.discount || 0,
      isActive: true,
    },
  });

  useEffect(() => {
    // Fetch products when component mounts
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/seller/products');
        const data = await response.json();

        if (data.success) {
          setProducts(data.data);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

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
        throw new Error(data.error || 'Failed to save bulk discount');
      }
    } catch (error) {
      console.error('Error saving bulk discount:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('bulkDiscount.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        bulkDiscount: {
          ...prev.bulkDiscount!,
          [field]: field === 'isActive' ? (value === 'true') : value,
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
          <label htmlFor="bulkDiscount.productId" className="block text-sm font-medium text-gray-700">
            Product
          </label>
          <div className="mt-1">
            <select
              name="bulkDiscount.productId"
              id="bulkDiscount.productId"
              required
              value={formData.bulkDiscount?.productId}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Select a product</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} (${product.price})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="bulkDiscount.minQuantity" className="block text-sm font-medium text-gray-700">
            Minimum Quantity
          </label>
          <div className="mt-1">
            <input
              type="number"
              name="bulkDiscount.minQuantity"
              id="bulkDiscount.minQuantity"
              required
              min="2"
              value={formData.bulkDiscount?.minQuantity}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="bulkDiscount.discount" className="block text-sm font-medium text-gray-700">
            Discount Percentage
          </label>
          <div className="mt-1">
            <input
              type="number"
              name="bulkDiscount.discount"
              id="bulkDiscount.discount"
              required
              min="0"
              max="100"
              step="0.1"
              value={formData.bulkDiscount?.discount}
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
          {isSubmitting ? 'Saving...' : promotion ? 'Update Bulk Discount' : 'Create Bulk Discount'}
        </button>
      </div>
    </form>
  );
}
