"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

import { WishlistManagerProps } from "@/app/types/dashboard";

export default function WishlistItems({
  items,
  onRemoveFromWishlist,
  onMoveToCart,
  isLoading
}: WishlistManagerProps) {
  if (isLoading) {
    return <div className="animate-pulse">Loading wishlist...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">My Wishlist</h2>

      {items.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Your wishlist is empty.</p>
          <Link
            href="/products"
            className="mt-4 inline-block text-primary hover:text-primary/80"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4">
                <div className="w-24 h-24 relative">
                  {item.images[0] && (
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-md"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <Link
                    href={`/product/${item.id}`}
                    className="text-lg font-medium hover:text-primary"
                  >
                    {item.name}
                  </Link>
                  <p className="text-lg font-semibold mt-1">
                    ${item.price.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Added {new Date(item.addedAt).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => onMoveToCart(item.id)}
                      className="text-sm text-white bg-primary px-3 py-1 rounded-md hover:bg-primary/90"
                    >
                      Move to Cart
                    </button>
                    <button
                      onClick={() => onRemoveFromWishlist(item.id)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
