"use client";

import React, { useState, useRef } from 'react';
import { useWishlist } from '@/app/contexts/WishlistContext';
import { WishlistItem } from '@/app/types/registry';
import { Button } from '@/app/components/ui/Button';
import { Container } from '@/app/components/ui/Container';

export default function Wishlist() {
  const { state, updateItem, removeItem, reorderItems, toggleFavorite } = useWishlist();
  const [draggedItem, setDraggedItem] = useState<WishlistItem | null>(null);
  const draggedOverItem = useRef<string | null>(null);

  const handleDragStart = (item: WishlistItem) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent, itemId: string) => {
    e.preventDefault();
    draggedOverItem.current = itemId;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedItem || !draggedOverItem.current || !state.wishlist) return;

    const items = [...state.wishlist.items];
    const draggedIndex = items.findIndex(item => item.id === draggedItem.id);
    const dropIndex = items.findIndex(item => item.id === draggedOverItem.current);

    if (draggedIndex === dropIndex) return;

    // Remove dragged item from array
    const [removed] = items.splice(draggedIndex, 1);
    // Insert at new position
    items.splice(dropIndex, 0, removed);

    // Update positions
    const reorderedItems = items.map((item, index) => ({
      ...item,
      position: index,
    }));

    reorderItems(reorderedItems);
    setDraggedItem(null);
    draggedOverItem.current = null;
  };

  if (!state.wishlist) {
    return (
      <Container>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Your Wishlist</h2>
          <p className="text-gray-600">No items in your wishlist yet.</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Your Wishlist</h1>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {state.wishlist.items.map(item => (
            <div
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(item)}
              onDragOver={(e) => handleDragOver(e, item.id)}
              onDrop={handleDrop}
              className={`border rounded-lg p-4 ${
                draggedItem?.id === item.id ? 'opacity-50' : ''
              } cursor-move hover:shadow-md transition-shadow duration-200`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-medium">{item.name}</h3>
                    <Button
                      variant={item.favorite ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => toggleFavorite(item.id)}
                    >
                      {item.favorite ? "★" : "☆"}
                    </Button>
                  </div>
                  <p className="text-gray-600 mt-1">${item.price}</p>
                  {item.notes && (
                    <p className="text-sm text-gray-500 mt-2">{item.notes}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-sm text-gray-500">
                    <p>Quantity: {item.quantity}</p>
                    <p>Priority: {item.priority}</p>
                    <p>Status: {item.status}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {state.wishlist.items.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No items in your wishlist yet.</p>
          </div>
        )}
      </div>
    </Container>
  );
}
