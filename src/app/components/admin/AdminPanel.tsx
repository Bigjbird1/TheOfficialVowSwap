'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  sellerId: string;
  seller: {
    storeName: string;
    isVerified: boolean;
  };
  createdAt: Date;
};

type FlaggedContent = {
  id: string;
  productId: string;
  reason: string;
  reportedBy: string;
  status: 'PENDING' | 'RESOLVED';
  createdAt: Date;
  product: Product;
};

export default function AdminPanel() {
  const [pendingProducts, setPendingProducts] = useState<Product[]>([]);
  const [flaggedContent, setFlaggedContent] = useState<FlaggedContent[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'flagged'>('products');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [productsRes, flaggedRes] = await Promise.all([
        fetch('/api/admin/pending-products'),
        fetch('/api/admin/flagged-content')
      ]);

      if (!productsRes.ok || !flaggedRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [productsData, flaggedData] = await Promise.all([
        productsRes.json(),
        flaggedRes.json()
      ]);

      setPendingProducts(productsData.products);
      setFlaggedContent(flaggedData.flaggedContent);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductAction = async (productId: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch('/api/admin/product-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, action }),
      });

      if (!response.ok) {
        throw new Error('Failed to process product review');
      }

      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process action');
    }
  };

  const handleFlaggedContentAction = async (contentId: string, action: 'resolve' | 'remove') => {
    try {
      const response = await fetch('/api/admin/flagged-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId, action }),
      });

      if (!response.ok) {
        throw new Error('Failed to process flagged content');
      }

      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process action');
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-6">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('products')}
          className={`py-2 px-4 border-b-2 font-medium text-sm ${
            activeTab === 'products'
              ? 'border-rose-500 text-rose-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Pending Products ({pendingProducts.length})
        </button>
        <button
          onClick={() => setActiveTab('flagged')}
          className={`py-2 px-4 border-b-2 font-medium text-sm ${
            activeTab === 'flagged'
              ? 'border-rose-500 text-rose-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Flagged Content ({flaggedContent.length})
        </button>
      </div>

      {activeTab === 'products' && (
        <div className="grid gap-6">
          {pendingProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-lg shadow-gray-200/50 p-6 border border-gray-100"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <img
                    src={product.images[0] || '/placeholder.jpg'}
                    alt={product.name}
                    className="h-24 w-24 object-cover rounded-lg"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pending Review
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{product.description}</p>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <span className="font-medium text-gray-900">${product.price.toFixed(2)}</span>
                    <span className="mx-2">•</span>
                    <span>{product.seller.storeName}</span>
                    {product.seller.isVerified && (
                      <svg
                        className="ml-1 h-4 w-4 text-blue-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0 space-x-2">
                  <button
                    onClick={() => handleProductAction(product.id, 'approve')}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleProductAction(product.id, 'reject')}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
          {pendingProducts.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <p className="text-gray-500">No pending products to review</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'flagged' && (
        <div className="grid gap-6">
          {flaggedContent.map((content) => (
            <div
              key={content.id}
              className="bg-white rounded-xl shadow-lg shadow-gray-200/50 p-6 border border-gray-100"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <img
                    src={content.product.images[0] || '/placeholder.jpg'}
                    alt={content.product.name}
                    className="h-24 w-24 object-cover rounded-lg"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                      {content.product.name}
                    </h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Flagged
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{content.reason}</p>
                  <div className="mt-2 text-sm text-gray-500">
                    <span>Reported by: {content.reportedBy}</span>
                    <span className="mx-2">•</span>
                    <span>
                      {new Date(content.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0 space-x-2">
                  <button
                    onClick={() => handleFlaggedContentAction(content.id, 'resolve')}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Resolve
                  </button>
                  <button
                    onClick={() => handleFlaggedContentAction(content.id, 'remove')}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Remove Listing
                  </button>
                </div>
              </div>
            </div>
          ))}
          {flaggedContent.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <p className="text-gray-500">No flagged content to review</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
