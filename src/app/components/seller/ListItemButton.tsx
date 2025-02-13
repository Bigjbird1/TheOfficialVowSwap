"use client";

import { useState, useEffect } from 'react';
import { ProductFormData } from '@/app/types/seller';
import ProductForm from '@/app/components/seller/ProductForm';

type Category = {
  id: string;
  name: string;
  description?: string | null;
};

export default function ListItemButton() {
  const [showForm, setShowForm] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (showForm) {
      fetchCategories();
    }
  }, [showForm]);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      console.error('Fetch Categories Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowForm(true)}
        className="px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-rose-500 to-purple-600 rounded-xl hover:from-rose-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-all shadow-lg shadow-gray-200/50"
        aria-label="List an Item"
      >
        List an Item
      </button>

      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-lg shadow-gray-200/50 border border-gray-100">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent mb-4">New Product</h3>
            {isLoading ? (
              <div className="text-center py-4">Loading categories...</div>
            ) : error ? (
              <div className="text-red-600 text-center py-4">{error}</div>
            ) : (
              <ProductForm
                categories={categories}
                onSubmit={async (data: ProductFormData) => {
                  try {
                    const response = await fetch('/api/seller/products', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(data),
                    });

                    if (!response.ok) throw new Error('Failed to create product');
                    
                    setShowForm(false);
                    window.location.reload(); // Refresh to show new product
                  } catch (err) {
                    console.error('Create Product Error:', err);
                    alert('Failed to create product. Please try again.');
                  }
                }}
                onCancel={() => setShowForm(false)}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
