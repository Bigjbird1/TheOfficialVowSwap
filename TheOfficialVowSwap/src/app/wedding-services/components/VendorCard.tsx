"use client";

import { MapPin, Star, Calendar } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { WeddingService } from '@/app/types/wedding-services';

interface VendorCardProps {
  service: WeddingService;
}

export const VendorCard: React.FC<VendorCardProps> = ({ service }) => {
  // Calculate next available date
  const getNextAvailableDate = () => {
    if (!service.availability) return null;
    
    const today = new Date();
    const availableDates = Object.entries(service.availability)
      .filter(([date, slots]) => {
        const bookingDate = new Date(date);
        return bookingDate >= today && slots.some(slot => slot.isAvailable);
      })
      .map(([date]) => new Date(date))
      .sort((a, b) => a.getTime() - b.getTime());

    return availableDates[0] || null;
  };

  const nextAvailableDate = getNextAvailableDate();

  return (
    <Link 
      href={`/wedding-services/${service.id}`}
      className="block border rounded-lg overflow-hidden hover:shadow-lg transition"
    >
      <div>
        <div className="aspect-video relative">
          <Image
            src={service.images[0] || '/api/placeholder/800/600'}
            alt={`${service.name} preview`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-semibold">{service.name}</h3>
            <span className="text-rose-500 font-semibold">
              {service.price ? `From $${service.price}` : 'Contact for pricing'}
              {service.priceType === 'HOURLY' ? '/hour' : ''}
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-4">{service.description}</p>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <MapPin className="w-4 h-4" />
            {service.seller?.location || 'Location not specified'}
          </div>
          {nextAvailableDate && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <Calendar className="w-4 h-4" />
              <span>
                Next available: {nextAvailableDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          )}
          {service.reviews && service.reviews.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-current text-yellow-400" />
                <span className="font-medium">
                  {(service.reviews.reduce((acc, review) => acc + review.rating, 0) / service.reviews.length).toFixed(1)}
                </span>
              </div>
              <span className="text-gray-500 text-sm">({service.reviews.length} reviews)</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};
