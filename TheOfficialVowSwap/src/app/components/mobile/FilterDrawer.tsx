'use client';

import { useBreakpoint } from '@/app/hooks/useBreakpoint';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface FilterOption {
  id: string;
  label: string;
  options: {
    value: string;
    label: string;
  }[];
}

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterOption[];
  selectedFilters: Record<string, string[]>;
  onApplyFilters: (filters: Record<string, string[]>) => void;
}

const FilterDrawer = ({
  isOpen,
  onClose,
  filters,
  selectedFilters,
  onApplyFilters,
}: FilterDrawerProps) => {
  const { isMobile } = useBreakpoint();
  const [localFilters, setLocalFilters] = useState<Record<string, string[]>>(selectedFilters);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Don't render on desktop
  if (!isMobile) return null;

  const handleFilterChange = (filterId: string, value: string) => {
    setLocalFilters((prev) => {
      const currentValues = prev[filterId] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];
      
      return {
        ...prev,
        [filterId]: newValues,
      };
    });
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    setLocalFilters({});
  };

  const drawer = (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    >
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl transition-transform duration-300 transform ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Filters</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto">
          {filters.map((filter) => (
            <div key={filter.id} className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                {filter.label}
              </h3>
              <div className="space-y-2">
                {filter.options.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center space-x-3"
                  >
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-primary-600 rounded border-gray-300"
                      checked={(localFilters[filter.id] || []).includes(
                        option.value
                      )}
                      onChange={() =>
                        handleFilterChange(filter.id, option.value)
                      }
                    />
                    <span className="text-sm text-gray-700">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex space-x-4">
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              onClick={handleApply}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;

  return createPortal(drawer, document.body);
};

export default FilterDrawer;
