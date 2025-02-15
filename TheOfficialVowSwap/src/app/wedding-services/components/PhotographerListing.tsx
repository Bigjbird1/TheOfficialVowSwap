import React, { useState } from 'react';
import { Star, Calendar, MapPin, Clock, Camera, Award, Heart, Share2 } from 'lucide-react';

export const PhotographerListing = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  const vendor = {
    id: "1",
    name: "Elegant Moments Photography",
    hourlyRate: 250,
    fullDayRate: 2500,
    description: "Award-winning wedding photography studio specializing in candid moments and artistic portraits. Our signature style blends photojournalistic storytelling with fine art photography to capture your special day in its most authentic and beautiful form.",
    category: "Photography",
    rating: 4.8,
    reviewCount: 156,
    availability: "Available for 2025-2026 weddings",
    images: [
      { id: "1", url: "/api/placeholder/600/400", alt: "Wedding ceremony capture" },
      { id: "2", url: "/api/placeholder/600/400", alt: "Couple portrait" },
      { id: "3", url: "/api/placeholder/600/400", alt: "Reception moments" },
      { id: "4", url: "/api/placeholder/600/400", alt: "Detail shots" },
      { id: "5", url: "/api/placeholder/600/400", alt: "Group photos" },
      { id: "6", url: "/api/placeholder/600/400", alt: "First look" }
    ],
    specifications: {
      "Experience": "12 years",
      "Style": "Contemporary, Photojournalistic, Fine Art",
      "Team Size": "3 photographers, 1 assistant",
      "Equipment": "Professional Sony Mirrorless Cameras",
      "Delivery Time": "6-8 weeks",
      "Coverage Hours": "Up to 10 hours",
      "Photos Delivered": "700+ edited photos",
      "Services Included": "Engagement session, Online gallery, Print rights",
      "Insurance": "Full liability coverage",
      "Backup Equipment": "Yes, multiple camera bodies and lenses"
    },
    packages: [
      {
        name: "Essential Collection",
        price: 2500,
        includes: [
          "8 hours of coverage",
          "1 photographer",
          "500+ edited photos",
          "Online gallery",
          "Print rights"
        ]
      },
      {
        name: "Premium Collection",
        price: 3500,
        includes: [
          "10 hours of coverage",
          "2 photographers",
          "700+ edited photos",
          "Engagement session",
          "Online gallery",
          "Print rights",
          "Wedding album"
        ]
      },
      {
        name: "Luxury Collection",
        price: 4500,
        includes: [
          "12 hours of coverage",
          "2 photographers",
          "1000+ edited photos",
          "Engagement session",
          "Bridal session",
          "Online gallery",
          "Print rights",
          "Premium wedding album",
          "Parent albums"
        ]
      }
    ],
    location: "San Francisco Bay Area, CA",
    travelInfo: "Available for destination weddings. Travel fees may apply beyond 50 miles.",
    photographerName: "Sarah Anderson",
    awards: [
      "Best of Weddings 2024 - The Knot",
      "Wedding Wire Couples' Choice 2024",
      "SF Wedding Photography Award 2023"
    ]
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{vendor.name}</h1>
            <div className="flex items-center gap-4 text-gray-600">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-current text-yellow-400" />
                <span className="font-medium">{vendor.rating}</span>
                <span className="text-gray-500">({vendor.reviewCount} reviews)</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-5 h-5" />
                <span>{vendor.location}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-4 py-2 border rounded-full hover:bg-gray-50">
              <Heart className="w-5 h-5" />
              Save
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border rounded-full hover:bg-gray-50">
              <Share2 className="w-5 h-5" />
              Share
            </button>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="grid grid-cols-12 gap-4 mb-8">
          <div className="col-span-8">
            <img
              src={vendor.images[selectedImageIndex].url}
              alt={vendor.images[selectedImageIndex].alt}
              className="w-full h-96 object-cover rounded-lg"
            />
          </div>
          <div className="col-span-4 grid grid-cols-2 gap-4">
            {vendor.images.slice(1, 5).map((image, index) => (
              <img
                key={image.id}
                src={image.url}
                alt={image.alt}
                className="w-full h-44 object-cover rounded-lg cursor-pointer hover:opacity-90 transition"
                onClick={() => setSelectedImageIndex(index + 1)}
              />
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="col-span-2">
            <div className="bg-white rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-semibold mb-4">About the Photographer</h2>
              <p className="text-gray-600 mb-6">{vendor.description}</p>
              
              <div className="grid grid-cols-2 gap-6">
                {Object.entries(vendor.specifications).map(([key, value]) => (
                  <div key={key}>
                    <h3 className="font-medium text-gray-900">{key}</h3>
                    <p className="text-gray-600">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-semibold mb-6">Awards & Recognition</h2>
              <div className="grid grid-cols-1 gap-4">
                {vendor.awards.map((award, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Award className="w-6 h-6 text-yellow-400" />
                    <span>{award}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Booking */}
          <div className="col-span-1">
            <div className="bg-white rounded-lg p-6 border sticky top-4">
              <h2 className="text-2xl font-semibold mb-6">Photography Packages</h2>
              
              {vendor.packages.map((pkg, index) => (
                <div key={index} className="mb-6 p-4 border rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">{pkg.name}</h3>
                  <p className="text-2xl font-bold text-rose-500 mb-4">${pkg.price}</p>
                  <ul className="space-y-2">
                    {pkg.includes.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-gray-600">
                        <Camera className="w-4 h-4" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <button className="w-full mt-4 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition">
                    Book Now
                  </button>
                </div>
              ))}

              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-5 h-5" />
                  <span>{vendor.availability}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-5 h-5" />
                  <span>Response time: Within 24 hours</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotographerListing;
