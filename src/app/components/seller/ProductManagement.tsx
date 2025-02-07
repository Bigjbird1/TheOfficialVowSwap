'use client';

import { useState, useEffect } from 'react';
type Category = {
  id: string;
  name: string;
  description?: string | null;
};

type Product = {
  id: string;
  sellerId: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  category: Category;
  images: string[];
  quantity: number;
  isActive: boolean;
  rating: number;
  totalSales: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  bulkDiscounts: Array<{
    id: string;
    minQuantity: number;
    discount: number;
    isActive: boolean;
  }>;
};
import { ProductFormData } from '@/app/types/seller';

type ProductWithDetails = Product & {
  category: Category;
  bulkDiscounts: Array<{
    minQuantity: number;
    discount: number;
  }>;
};

type ProductFormProps = {
  initialData?: ProductWithDetails;
  categories: Category[];
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
};

const ProductForm = ({ initialData, categories, onSubmit, onCancel }: ProductFormProps) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || 0,
    categoryId: initialData?.categoryId || categories[0]?.id || '',
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
          {categories.map(category => (
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
};

export default function ProductManagement() {
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<ProductWithDetails | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/seller/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const handleCreateProduct = async (data: ProductFormData) => {
    try {
      const response = await fetch('/api/seller/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to create product');
      
      await fetchProducts();
      setIsFormVisible(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
    }
  };

  const handleUpdateProduct = async (data: ProductFormData) => {
    if (!editingProduct) return;

    try {
      const response = await fetch('/api/seller/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, id: editingProduct.id }),
      });

      if (!response.ok) throw new Error('Failed to update product');
      
      await fetchProducts();
      setEditingProduct(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/seller/products?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete product');
      
      await fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center py-8">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
        <button
          onClick={() => setIsFormVisible(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          Add New Product
        </button>
      </div>

      {(isFormVisible || editingProduct) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingProduct ? 'Edit Product' : 'New Product'}
            </h3>
            <ProductForm
              initialData={editingProduct || undefined}
              categories={categories}
              onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
              onCancel={() => {
                setIsFormVisible(false);
                setEditingProduct(null);
              }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map(product => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow p-6 space-y-4"
          >
            <div className="aspect-w-16 aspect-h-9 mb-4">
              <img
                src={product.images[0] || '/placeholder.jpg'}
                alt={product.name}
                className="object-cover rounded-md"
              />
            </div>
            <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
            <p className="text-sm text-gray-500">{product.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
              <span className={`px-2 py-1 rounded-full text-sm ${
                product.quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
              </span>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingProduct(product)}
                className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteProduct(product.id)}
                className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
