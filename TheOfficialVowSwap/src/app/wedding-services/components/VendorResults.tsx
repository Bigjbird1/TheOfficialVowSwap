"use client";

import type { WeddingService } from '@/app/types/wedding-services';
import { VendorCard } from './VendorCard';

interface VendorResultsProps {
  services: WeddingService[];
  sortOption: string;
  setSortOption: (value: string) => void;
}

const VendorResults: React.FC<VendorResultsProps> = ({ services, sortOption, setSortOption }) => {
  const sortedServices = [...services].sort((a, b) => {
    if (sortOption === "Highest Rated" && a.reviews && b.reviews) {
      const aRating = a.reviews.reduce((acc, review) => acc + review.rating, 0) / a.reviews.length;
      const bRating = b.reviews.reduce((acc, review) => acc + review.rating, 0) / b.reviews.length;
      return bRating - aRating;
    }
    // For "Featured" or other options, maintain original order
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Wedding Vendors</h2>
        <select
          className="border rounded-lg px-4 py-2"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          aria-label="Sort Vendors"
        >
          <option>Featured</option>
          <option>Highest Rated</option>
        </select>
      </div>
      {sortedServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedServices.map((service) => (
            <VendorCard key={service.id} service={service} />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-600">No vendors found.</div>
      )}
    </div>
  );
};

export default VendorResults;
