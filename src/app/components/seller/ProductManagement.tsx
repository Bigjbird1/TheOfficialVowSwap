'use client';

import { useState, useEffect } from 'react';
import { ProductFormData } from '@/app/types/seller';
import ProductForm from './ProductForm';

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

type ProductWithDetails = Product & {
  category: Category;
  bulkDiscounts: Array<{
    minQuantity: number;
    discount: number;
  }>;
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
  }, []);

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
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-xl h-64"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-6 text-center shadow-lg shadow-gray-200/50 border border-red-100">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button
          onClick={() => setIsFormVisible(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-rose-500 to-purple-600 rounded-xl hover:from-rose-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-all shadow-lg shadow-rose-200/50"
          aria-label="Add New Product"
          data-testid="add-product-button"
        >
          Add New Product
        </button>
      </div>

      {(isFormVisible || editingProduct) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-lg shadow-gray-200/50 border border-gray-100">
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
            className="bg-white rounded-xl shadow-lg shadow-gray-200/50 p-6 space-y-4 border border-gray-100"
          >
            <div className="aspect-w-16 aspect-h-9 mb-4">
              <img
                src={product.images[0] || '/placeholder.jpg'}
                alt={product.name}
                className="object-cover rounded-xl"
              />
            </div>
            <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
            <p className="text-sm text-gray-500">{product.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                product.quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
              </span>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingProduct(product)}
                className="px-3 py-1 text-sm font-medium text-rose-600 hover:text-rose-800 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteProduct(product.id)}
                className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
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
