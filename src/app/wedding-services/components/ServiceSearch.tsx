"use client";

import { Search, MapPin, ChevronDown } from 'lucide-react';
import { ServiceFilters, VENDOR_CATEGORIES } from '@/app/types/wedding-services';
import { useState } from 'react';

interface ServiceSearchProps {
  filters: ServiceFilters;
  onFilterChange: (filters: ServiceFilters) => void;
}

const ServiceSearch: React.FC<ServiceSearchProps> = ({ 
  filters,
  onFilterChange
}) => {
  const [locationInput, setLocationInput] = useState(filters.location || '');

  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({
      ...filters,
      location: locationInput || null
    });
  };

  const handleCategoryChange = (category: string) => {
    const newCategories = category 
      ? [category] 
      : [];
    
    onFilterChange({
      ...filters,
      categories: newCategories
    });
  };

  return (
    <div className="bg-gradient-to-r from-rose-500 to-purple-600 py-16">
      <div className="max-w-7xl mx-auto px-8">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          Find the Perfect Wedding Vendors
        </h1>
        <div className="max-w-3xl mx-auto">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <form onSubmit={handleLocationSubmit}>
                  <input
                    type="text"
                    placeholder="Enter location..."
                    className="w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    aria-label="Location"
                  />
                </form>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  className="w-full pl-12 pr-4 py-3 border rounded-lg appearance-none bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  value={filters.categories[0] || ''}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  aria-label="Category"
                >
                  <option value="">All Categories</option>
                  {VENDOR_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            </div>
            <button
              onClick={handleLocationSubmit}
              className="w-full mt-4 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition font-semibold"
            >
              Search Vendors
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceSearch;
