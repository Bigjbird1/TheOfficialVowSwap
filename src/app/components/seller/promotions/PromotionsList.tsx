'use client';

import { useState, useEffect } from 'react';
import { Promotion, PromotionType, PromotionsListResponse } from '@/app/types/promotions';

interface FilterState {
  type: PromotionType | '';
  isActive: boolean | '';
}

interface SortState {
  field: keyof Promotion;
  direction: 'asc' | 'desc';
}

export default function PromotionsList() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    type: '',
    isActive: '',
  });
  const [sort, setSort] = useState<SortState>({
    field: 'createdAt',
    direction: 'desc',
  });

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(filters.type && { type: filters.type }),
        ...(filters.isActive !== '' && { isActive: filters.isActive.toString() }),
      });

      const response = await fetch(`/api/seller/promotions?${queryParams}`);
      const data: PromotionsListResponse = await response.json();

      if (!data.success || !data.data) {
        throw new Error(data.error || 'Failed to fetch promotions');
      }

      setPromotions(data.data.promotions);
      setTotalPages(Math.ceil(data.data.total / data.data.limit));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, [page, filters]);

  const handleFilterChange = (key: keyof FilterState, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filters change
  };

  const handleSort = (field: keyof Promotion) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const sortedPromotions = [...promotions].sort((a, b) => {
    const aValue = a[sort.field] ?? '';
    const bValue = b[sort.field] ?? '';
    const modifier = sort.direction === 'asc' ? 1 : -1;

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return aValue.localeCompare(bValue) * modifier;
    }
    
    if (aValue instanceof Date && bValue instanceof Date) {
      return (aValue.getTime() - bValue.getTime()) * modifier;
    }
    
    if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
      return (aValue === bValue ? 0 : aValue ? 1 : -1) * modifier;
    }
    
    return 0;
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-md">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <select
          className="px-3 py-2 border rounded-md"
          value={filters.type}
          onChange={(e) => handleFilterChange('type', e.target.value)}
        >
          <option value="">All Types</option>
          <option value="COUPON">Coupon</option>
          <option value="FLASH_SALE">Flash Sale</option>
          <option value="BULK_DISCOUNT">Bulk Discount</option>
        </select>

        <select
          className="px-3 py-2 border rounded-md"
          value={filters.isActive.toString()}
          onChange={(e) => handleFilterChange('isActive', e.target.value === 'true')}
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('name')}
              >
                Name {sort.field === 'name' && (sort.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('startDate')}
              >
                Start Date {sort.field === 'startDate' && (sort.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('endDate')}
              >
                End Date {sort.field === 'endDate' && (sort.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : sortedPromotions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center">
                  No promotions found
                </td>
              </tr>
            ) : (
              sortedPromotions.map((promotion) => (
                <tr key={promotion.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{promotion.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{promotion.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatDate(promotion.startDate)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatDate(promotion.endDate)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      promotion.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {promotion.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {promotion.type === 'COUPON' && promotion.couponCode && (
                      <span className="text-sm">
                        Code: {promotion.couponCode.code} ({promotion.couponCode.discountValue}
                        {promotion.couponCode.discountType === 'PERCENTAGE' ? '%' : ' off'})
                      </span>
                    )}
                    {promotion.type === 'FLASH_SALE' && promotion.flashSale && (
                      <span className="text-sm">
                        {promotion.flashSale.discountValue}
                        {promotion.flashSale.discountType === 'PERCENTAGE' ? '%' : ' off'}
                      </span>
                    )}
                    {promotion.type === 'BULK_DISCOUNT' && promotion.bulkDiscount && (
                      <span className="text-sm">
                        Min Qty: {promotion.bulkDiscount.minQuantity}, {promotion.bulkDiscount.discount}% off
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50 disabled:opacity-50"
          onClick={() => setPage(prev => Math.max(prev - 1, 1))}
          disabled={page === 1 || loading}
        >
          Previous
        </button>
        <span className="text-sm text-gray-700">
          Page {page} of {totalPages}
        </span>
        <button
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50 disabled:opacity-50"
          onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages || loading}
        >
          Next
        </button>
      </div>
    </div>
  );
}
