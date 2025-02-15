"use client";

import { Filter, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/app/components/ui/dropdown-menu';
import { 
  ServiceFilters,
  VENDOR_CATEGORIES,
  PRICE_RANGES,
  DATE_RANGES,
} from '@/app/types/wedding-services';

interface FilterSectionProps {
  filters: ServiceFilters;
  onFilterChange: (filters: ServiceFilters) => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({ filters, onFilterChange }) => {
  const [location, setLocation] = useState<string>('');

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    
    onFilterChange({
      ...filters,
      categories: newCategories,
    });
  };

  const handlePriceRangeSelect = (index: number) => {
    onFilterChange({
      ...filters,
      priceRange: PRICE_RANGES[index],
    });
  };

  const handleDateRangeSelect = (index: number) => {
    onFilterChange({
      ...filters,
      dateRange: DATE_RANGES[index],
    });
  };

  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({
      ...filters,
      location,
    });
  };

  const handleRatingToggle = () => {
    onFilterChange({
      ...filters,
      minRating: filters.minRating === 4 ? null : 4,
    });
  };

  return (
    <div className="border-b">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center gap-4">
          {/* Categories Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2 border rounded-full hover:bg-gray-50 transition">
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className="w-4 h-4 ml-1" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {VENDOR_CATEGORIES.map((category) => (
                <DropdownMenuItem
                  key={category}
                  selected={filters.categories.includes(category)}
                  onClick={() => handleCategoryToggle(category)}
                >
                  {category}
                </DropdownMenuItem>
              ))}
              <div className="px-3.5 py-2.5 border-t">
                <form onSubmit={handleLocationSubmit} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="flex-1 px-2 py-1 text-sm border rounded"
                  />
                  <button
                    type="submit"
                    className="px-2 py-1 text-sm bg-rose-500 text-white rounded hover:bg-rose-600"
                  >
                    Set
                  </button>
                </form>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Price Range Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger className={`px-4 py-2 border rounded-full hover:bg-gray-50 transition ${filters.priceRange ? 'bg-rose-100' : ''}`}>
              {filters.priceRange?.label || 'Price Range'}
              <ChevronDown className="w-4 h-4 ml-1 inline" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {PRICE_RANGES.map((range, index) => (
                <DropdownMenuItem
                  key={range.label}
                  selected={filters.priceRange?.label === range.label}
                  onClick={() => handlePriceRangeSelect(index)}
                >
                  {range.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Date Range Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger className={`px-4 py-2 border rounded-full hover:bg-gray-50 transition ${filters.dateRange ? 'bg-rose-100' : ''}`}>
              {filters.dateRange?.label || 'Available Dates'}
              <ChevronDown className="w-4 h-4 ml-1 inline" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {DATE_RANGES.map((range, index) => (
                <DropdownMenuItem
                  key={range.label}
                  selected={filters.dateRange?.label === range.label}
                  onClick={() => handleDateRangeSelect(index)}
                >
                  {range.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Rating Filter */}
          <button
            onClick={handleRatingToggle}
            className={`px-4 py-2 border rounded-full hover:bg-gray-50 transition ${filters.minRating ? 'bg-rose-100' : ''}`}
          >
            Rating 4.0+
          </button>
        </div>

        {/* Active Filters Display */}
        {(filters.categories.length > 0 || filters.location || filters.priceRange || filters.dateRange || filters.minRating) && (
          <div className="flex flex-wrap gap-2 mt-4">
            {filters.categories.map((category) => (
              <span
                key={category}
                className="px-2 py-1 text-sm bg-rose-100 text-rose-700 rounded-full flex items-center gap-1"
                onClick={() => handleCategoryToggle(category)}
              >
                {category}
                <button className="hover:text-rose-900">×</button>
              </span>
            ))}
            {filters.location && (
              <span
                className="px-2 py-1 text-sm bg-rose-100 text-rose-700 rounded-full flex items-center gap-1"
                onClick={() => onFilterChange({ ...filters, location: null })}
              >
                {filters.location}
                <button className="hover:text-rose-900">×</button>
              </span>
            )}
            {filters.priceRange && (
              <span
                className="px-2 py-1 text-sm bg-rose-100 text-rose-700 rounded-full flex items-center gap-1"
                onClick={() => onFilterChange({ ...filters, priceRange: null })}
              >
                {filters.priceRange.label}
                <button className="hover:text-rose-900">×</button>
              </span>
            )}
            {filters.dateRange && (
              <span
                className="px-2 py-1 text-sm bg-rose-100 text-rose-700 rounded-full flex items-center gap-1"
                onClick={() => onFilterChange({ ...filters, dateRange: null })}
              >
                {filters.dateRange.label}
                <button className="hover:text-rose-900">×</button>
              </span>
            )}
            {filters.minRating && (
              <span
                className="px-2 py-1 text-sm bg-rose-100 text-rose-700 rounded-full flex items-center gap-1"
                onClick={() => onFilterChange({ ...filters, minRating: null })}
              >
                Rating 4.0+
                <button className="hover:text-rose-900">×</button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterSection;
