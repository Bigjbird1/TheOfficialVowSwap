"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { Loader2, AlertCircle } from "lucide-react";
import type { WeddingService, ServiceCategory } from "../types/wedding-services";
import SearchAndFilter from "./components/SearchAndFilter";
import { getServices, getCategories } from "../services/wedding-services";

/**
 * WeddingServicesPage displays a searchable, filterable grid of wedding services.
 * Includes image optimization, error handling, and accessibility features.
 */
export default function WeddingServicesPage() {
  const [services, setServices] = useState<WeddingService[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Memoized filtered services based on search query and selected category
  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const matchesSearch = searchQuery === "" || 
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === null || 
        service.categoryId === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [services, searchQuery, selectedCategory]);

  // Fetch both services and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [servicesData, categoriesData] = await Promise.all([
          getServices(),
          getCategories()
        ]);
        
        setServices(servicesData);
        setCategories(categoriesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load wedding services");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    );
  }

  // Error state
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
    <main className="max-w-7xl mx-auto px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">Wedding Services</h1>
      
      <SearchAndFilter
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
      />

      {/* Services Grid */}
      <div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        role="list"
        aria-label="Wedding services"
      >
        {filteredServices.map((service) => (
          <article 
            key={service.id}
            className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition"
            role="listitem"
          >
            <div className="relative aspect-w-16 aspect-h-9">
              <Image
                src={service.images[0]}
                alt={`${service.name} preview`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                priority={service.id === "1"} // Prioritize loading for first image
              />
            </div>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2">{service.name}</h2>
              <p className="text-gray-600 mb-4">{service.description}</p>
              <ul className="mb-4" aria-label="Service features">
                {service.features.map((feature, index) => (
                  <li key={index} className="text-gray-600 text-sm mb-1">
                    • {feature}
                  </li>
                ))}
              </ul>
              <div className="flex justify-between items-center">
                <span className="text-rose-500 font-medium">
                  ${service.price}
                  {service.priceType === "PER_PERSON" ? " per person" : ""}
                </span>
                <button 
                  className="px-4 py-2 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition"
                  aria-label={`Learn more about ${service.name}`}
                >
                  Learn More
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}
