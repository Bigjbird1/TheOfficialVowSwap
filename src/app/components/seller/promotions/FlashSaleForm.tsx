import { useState, useEffect } from 'react';
import { Promotion, CreatePromotionRequest, DiscountType } from '@/app/types/promotions';

interface FlashSaleFormProps {
  promotion: Promotion | null;
  onCancel: () => void;
  onSuccess: () => void;
}

interface Product {
  id: string;
  name: string;
  price: number;
}

interface Category {
  id: string;
  name: string;
}

export default function FlashSaleForm({ promotion, onCancel, onSuccess }: FlashSaleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [formData, setFormData] = useState<CreatePromotionRequest>({
    name: promotion?.name || '',
    description: promotion?.description || '',
    type: 'FLASH_SALE',
    startDate: promotion?.startDate ? new Date(promotion.startDate).toISOString().substring(0, 10) : new Date().toISOString().substring(0, 10),
    endDate: promotion?.endDate ? new Date(promotion.endDate).toISOString().substring(0, 10) : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
    flashSale: {
      discountType: (promotion?.flashSale?.discountType as DiscountType) || 'PERCENTAGE',
      discountValue: promotion?.flashSale?.discountValue || 0,
      categoryId: promotion?.flashSale?.categoryId,
      productIds: promotion?.flashSale?.productIds || [],
    },
  });

  useEffect(() => {
    // Fetch products and categories when component mounts
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch('/api/seller/products'),
          fetch('/api/categories'),
        ]);

        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();

        if (productsData.success) {
          setProducts(productsData.data);
        }
        if (categoriesData.success) {
          setCategories(categoriesData.data);
        }

        if (promotion?.flashSale?.productIds) {
          setSelectedProducts(promotion.flashSale.productIds);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [promotion]);

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
        throw new Error(data.error || 'Failed to save flash sale');
      }
    } catch (error) {
      console.error('Error saving flash sale:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('flashSale.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        flashSale: {
          ...prev.flashSale!,
          [field]: value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProducts(prev => {
      const newSelection = prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId];

      setFormData(prevData => ({
        ...prevData,
        flashSale: {
          ...prevData.flashSale!,
          productIds: newSelection,
        },
      }));

      return newSelection;
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Flash Sale Name
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
          <label htmlFor="flashSale.discountType" className="block text-sm font-medium text-gray-700">
            Discount Type
          </label>
          <div className="mt-1">
            <select
              name="flashSale.discountType"
              id="flashSale.discountType"
              required
              value={formData.flashSale?.discountType}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="PERCENTAGE">Percentage</option>
              <option value="FIXED_AMOUNT">Fixed Amount</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="flashSale.discountValue" className="block text-sm font-medium text-gray-700">
            Discount Value
          </label>
          <div className="mt-1">
            <input
              type="number"
              name="flashSale.discountValue"
              id="flashSale.discountValue"
              required
              min="0"
              step={formData.flashSale?.discountType === 'PERCENTAGE' ? '1' : '0.01'}
              value={formData.flashSale?.discountValue}
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
              type="datetime-local"
              name="startDate"
              id="startDate"
              required
              value={formData.startDate}
              onChange={handleChange}
              min={new Date().toISOString().substring(0, 16)}
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
              type="datetime-local"
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
          <label htmlFor="flashSale.categoryId" className="block text-sm font-medium text-gray-700">
            Category (Optional)
          </label>
          <div className="mt-1">
            <select
              name="flashSale.categoryId"
              id="flashSale.categoryId"
              value={formData.flashSale?.categoryId || ''}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Select Products</label>
          <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {products.map(product => (
              <div
                key={product.id}
                className={`relative flex items-center space-x-3 rounded-lg border ${
                  selectedProducts.includes(product.id)
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-300'
                } px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-400`}
              >
                <div className="min-w-0 flex-1">
                  <button
                    type="button"
                    className="focus:outline-none w-full text-left"
                    onClick={() => handleProductSelect(product.id)}
                  >
                    <span className="absolute inset-0" aria-hidden="true" />
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="truncate text-sm text-gray-500">${product.price}</p>
                  </button>
                </div>
              </div>
            ))}
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
          {isSubmitting ? 'Saving...' : promotion ? 'Update Flash Sale' : 'Create Flash Sale'}
        </button>
      </div>
    </form>
  );
}
