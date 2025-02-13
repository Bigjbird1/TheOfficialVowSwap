"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import type { WeddingService, ServiceFilters } from "../types/wedding-services";
import { getServices } from "../services/wedding-services";
import ServiceSearch from "./components/ServiceSearch";
import FilterSection from "./components/FilterSection";
import VendorResults from "./components/VendorResults";

export default function WeddingServicesPage() {
  const [services, setServices] = useState<WeddingService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ServiceFilters>({
    categories: [],
    minRating: null,
    location: null,
    priceRange: null,
    dateRange: null
  });
  const [sortOption, setSortOption] = useState("Featured");

  // Fetch services on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const servicesData = await getServices();
        setServices(servicesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load wedding services");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter services based on all criteria
  const filteredServices = services.filter(service => {
    // Location filter
    const matchesLocation = !filters.location || 
      (service.seller?.location || '').toLowerCase().includes(filters.location.toLowerCase());
    
    // Category filter
    const matchesCategory = filters.categories.length === 0 || 
      filters.categories.includes(service.category?.name || '');
    
    // Rating filter
    const matchesRating = !filters.minRating || (service.reviews && service.reviews.length > 0 && 
      (service.reviews.reduce((acc, review) => acc + review.rating, 0) / service.reviews.length) >= filters.minRating);

    // Price range filter
    const matchesPrice = !filters.priceRange || 
      ((!filters.priceRange.min || (service.price || 0) >= filters.priceRange.min) &&
       (!filters.priceRange.max || (service.price || 0) <= filters.priceRange.max));

    // Date range filter
    const matchesDate = !filters.dateRange || !service.availability || 
      Object.entries(service.availability).some(([date, slots]) => {
        const bookingDate = new Date(date);
        return (!filters.dateRange?.start || bookingDate >= filters.dateRange.start) &&
               (!filters.dateRange?.end || bookingDate <= filters.dateRange.end) &&
               slots.some(slot => slot.isAvailable);
      });

    return matchesLocation && matchesCategory && matchesRating && matchesPrice && matchesDate;
  });

  // Handle filter changes
  const handleFilterChange = (newFilters: ServiceFilters) => {
    setFilters(newFilters);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-gray-600 text-center mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <ServiceSearch
        filters={filters}
        onFilterChange={handleFilterChange}
      />
      <FilterSection 
        filters={filters}
        onFilterChange={handleFilterChange}
      />
      <VendorResults 
        services={filteredServices} 
        sortOption={sortOption} 
        setSortOption={setSortOption}
      />
    </div>
  );
}
