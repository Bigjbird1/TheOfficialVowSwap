"use client";

import React, { useState } from 'react';
import { Heart, ShoppingBag, Trash2, Grid, List, Filter, Search } from 'lucide-react';
import { Alert, AlertDescription } from '@/app/components/ui/alert';

interface LikedItem {
  id: number;
  name: string;
  price: string;
  seller: string;
  rating: number;
  category?: string;
}

const LikedItemsPage = () => {
  const [likedItems, setLikedItems] = useState<LikedItem[]>([
    { 
      id: 1, 
      name: "Crystal Chandelier", 
      price: "$299",
      seller: "Luxury Decor Co.",
      rating: 4.8,
      category: "Lighting"
    },
    { 
      id: 2, 
      name: "Rustic Wooden Arch", 
      price: "$499",
      seller: "Woodland Crafts",
      rating: 4.9,
      category: "Decor"
    },
    { 
      id: 3, 
      name: "Vintage Table Runner", 
      price: "$79",
      seller: "Antique Collections",
      rating: 4.7,
      category: "Accessories"
    },
    { 
      id: 4, 
      name: "Floral Centerpiece", 
      price: "$199",
      seller: "Bloom & Decor",
      rating: 4.6,
      category: "Floral"
    }
  ]);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showRemoveAlert, setShowRemoveAlert] = useState(false);
  const [removedItemName, setRemovedItemName] = useState('');

  const removeFromLiked = (itemId: number, itemName: string) => {
    setLikedItems(likedItems.filter(item => item.id !== itemId));
    setRemovedItemName(itemName);
    setShowRemoveAlert(true);
    setTimeout(() => setShowRemoveAlert(false), 3000);
  };

  const filteredItems = likedItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.seller.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = [...new Set(likedItems.map(item => item.category))];
  const totalValue = likedItems.reduce((sum, item) => 
    sum + parseFloat(item.price.replace('$', '')), 0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Floating Alert */}
      {showRemoveAlert && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <Alert className="bg-white border-rose-200">
            <AlertDescription>
              Removed {removedItemName} from liked items
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Header section */}
      <div className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-1">My Liked Items</h1>
              <p className="text-gray-600">
                {likedItems.length} items · Total value: ${totalValue.toFixed(2)}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition ${
                  viewMode === 'grid' ? 'bg-rose-100 text-rose-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition ${
                  viewMode === 'list' ? 'bg-rose-100 text-rose-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search your liked items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
              />
            </div>
            <button className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {likedItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No liked items yet</h2>
            <p className="text-gray-600 mb-8">Start exploring and save items you love!</p>
            <button className="px-8 py-3 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition transform hover:scale-105 duration-200">
              Explore Items
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600">No items match your search</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : 
            "space-y-4"
          }>
            {filteredItems.map((item) => (
              <div 
                key={item.id} 
                className={`bg-white rounded-lg shadow-sm hover:shadow-md transition ${
                  viewMode === 'list' ? 'flex gap-6 p-4' : 'p-6'
                }`}
              >
                <div className={`relative ${viewMode === 'list' ? 'w-32 h-32' : 'mb-4'}`}>
                  <img
                    src="/api/placeholder/400/400"
                    alt={item.name}
                    className="w-full h-full aspect-square object-cover rounded-lg"
                  />
                  {item.category && (
                    <span className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur-sm text-xs rounded-full">
                      {item.category}
                    </span>
                  )}
                </div>
                <div className={viewMode === 'list' ? 'flex-1' : ''}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-lg hover:text-rose-500 transition cursor-pointer">
                      {item.name}
                    </h3>
                    <button 
                      onClick={() => removeFromLiked(item.id, item.name)}
                      className="text-gray-400 hover:text-rose-500 transition p-1 hover:bg-rose-50 rounded-full"
                      aria-label="Remove from liked items"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">by {item.seller}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-rose-500 font-semibold">{item.price}</span>
                    <span className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded-full">
                      ★ {item.rating}
                    </span>
                  </div>
                  <button className="w-full px-4 py-2 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition flex items-center justify-center gap-2 transform hover:scale-105 duration-200">
                    <ShoppingBag className="w-4 h-4" />
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LikedItemsPage;
