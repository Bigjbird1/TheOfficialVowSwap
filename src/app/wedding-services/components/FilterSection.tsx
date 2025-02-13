"use client";

import { Filter } from 'lucide-react';

interface FilterSectionProps {
  minRating: number | null;
  toggleRatingFilter: () => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({ minRating, toggleRatingFilter }) => {
  return (
    <div className="border-b">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 border rounded-full hover:bg-gray-50 transition">
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button className="px-4 py-2 border rounded-full hover:bg-gray-50 transition">
            Price Range
          </button>
          <button className="px-4 py-2 border rounded-full hover:bg-gray-50 transition">
            Available Dates
          </button>
          <button
            onClick={toggleRatingFilter}
            className={`px-4 py-2 border rounded-full hover:bg-gray-50 transition ${minRating ? 'bg-rose-100' : ''}`}
          >
            Rating 4.0+
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterSection;
