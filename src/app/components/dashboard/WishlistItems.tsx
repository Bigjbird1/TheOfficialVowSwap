"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface WishlistItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
  };
  addedAt: string;
}

export default function WishlistItems() {
  const { data: session } = useSession();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlistItems();
  }, [session]);

  async function fetchWishlistItems() {
    try {
      const response = await fetch("/api/wishlist");
      if (!response.ok) throw new Error("Failed to fetch wishlist items");
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error("Error fetching wishlist items:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveFromWishlist(productId: string) {
    try {
      const response = await fetch(`/api/wishlist/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to remove from wishlist");
      
      await fetchWishlistItems();
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  }

  async function handleMoveToCart(productId: string) {
    try {
      // Add to cart
      const addToCartResponse = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      if (!addToCartResponse.ok) throw new Error("Failed to add to cart");

      // Remove from wishlist
      await handleRemoveFromWishlist(productId);
    } catch (error) {
      console.error("Error moving item to cart:", error);
    }
  }

  if (loading) {
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
                  {item.product.images[0] && (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover rounded-md"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <Link
                    href={`/product/${item.product.id}`}
                    className="text-lg font-medium hover:text-primary"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-lg font-semibold mt-1">
                    ${item.product.price.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Added {new Date(item.addedAt).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleMoveToCart(item.product.id)}
                      className="text-sm text-white bg-primary px-3 py-1 rounded-md hover:bg-primary/90"
                    >
                      Move to Cart
                    </button>
                    <button
                      onClick={() => handleRemoveFromWishlist(item.product.id)}
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
