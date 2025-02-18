"use client";

import React, { useState } from 'react';
import { useRegistry } from '@/app/contexts/RegistryContext';
import { Registry, RegistryItem } from '@/app/types/registry';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Modal } from '@/app/components/ui/Modal';
import { Container } from '@/app/components/ui/Container';
import RegistryShare from './RegistryShare';

type RegistryFormData = {
  title: string;
  description: string;
  eventDate: string;
};

type ItemFormData = {
  name: string;
  price: number;
  quantity: number;
  priority: 'must-have' | 'nice-to-have';
  notes: string;
  imageUrl: string;
};

export default function RegistryManager() {
  const { state, createRegistry, updateRegistry, deleteRegistry, addItem, updateItem, removeItem, generateShareLink } = useRegistry();
  const [showRegistryModal, setShowRegistryModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedRegistry, setSelectedRegistry] = useState<Registry | null>(null);
  const [selectedItem, setSelectedItem] = useState<RegistryItem | null>(null);
  const [registryForm, setRegistryForm] = useState<RegistryFormData>({
    title: '',
    description: '',
    eventDate: '',
  });
  const [itemForm, setItemForm] = useState<ItemFormData>({
    name: '',
    price: 0,
    quantity: 1,
    priority: 'nice-to-have',
    notes: '',
    imageUrl: '',
  });

  const handleRegistrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRegistry) {
      await updateRegistry({
        ...selectedRegistry,
        title: registryForm.title,
        description: registryForm.description,
        eventDate: new Date(registryForm.eventDate),
      });
    } else {
      await createRegistry({
        title: registryForm.title,
        description: registryForm.description,
        eventDate: new Date(registryForm.eventDate),
        userId: 'current-user-id', // This would come from auth context
        items: [],
        shareLink: '',
      });
    }
    setShowRegistryModal(false);
    resetRegistryForm();
  };

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRegistry) return;

    const itemData = {
      name: itemForm.name,
      price: itemForm.price,
      quantity: itemForm.quantity,
      priority: itemForm.priority,
      notes: itemForm.notes,
      imageUrl: itemForm.imageUrl,
      status: 'available' as const,
    };

    if (selectedItem) {
      await updateItem(selectedRegistry.id, { ...selectedItem, ...itemData });
    } else {
      await addItem(selectedRegistry.id, itemData);
    }
    setShowItemModal(false);
    resetItemForm();
  };

  const handleShare = async (registry: Registry) => {
    if (!registry.shareLink) {
      const shareLink = await generateShareLink(registry.id);
      await updateRegistry({ ...registry, shareLink });
    }
  };

  const resetRegistryForm = () => {
    setRegistryForm({
      title: '',
      description: '',
      eventDate: '',
    });
    setSelectedRegistry(null);
  };

  const resetItemForm = () => {
    setItemForm({
      name: '',
      price: 0,
      quantity: 1,
      priority: 'nice-to-have',
      notes: '',
      imageUrl: '',
    });
    setSelectedItem(null);
  };

  const editRegistry = (registry: Registry) => {
    setSelectedRegistry(registry);
    setRegistryForm({
      title: registry.title,
      description: registry.description || '',
      eventDate: registry.eventDate ? registry.eventDate.toISOString().split('T')[0] : '',
    });
    setShowRegistryModal(true);
  };

  const editItem = (registryId: string, item: RegistryItem) => {
    setSelectedRegistry(state.registries.find(r => r.id === registryId) || null);
    setSelectedItem(item);
    setItemForm({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      priority: item.priority,
      notes: item.notes || '',
      imageUrl: item.imageUrl || '',
    });
    setShowItemModal(true);
  };

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Your Registries</h1>
          <Button onClick={() => setShowRegistryModal(true)}>Create Registry</Button>
        </div>

        {state.registries.map(registry => (
          <div key={registry.id} className="border rounded-lg p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">{registry.title}</h2>
                <p className="text-gray-600">{registry.description}</p>
                {registry.eventDate && (
                  <p className="text-sm text-gray-500">
                    Event Date: {new Date(registry.eventDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="space-x-2">
                <Button onClick={() => editRegistry(registry)} variant="secondary">
                  Edit
                </Button>
                <RegistryShare
                  registryId={registry.id}
                  registryTitle={registry.title}
                  shareLink={registry.shareLink}
                />
                <Button
                  onClick={() => deleteRegistry(registry.id)}
                  variant="outline"
                >
                  Delete
                </Button>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Items</h3>
                <Button
                  onClick={() => {
                    setSelectedRegistry(registry);
                    setShowItemModal(true);
                  }}
                  variant="secondary"
                >
                  Add Item
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {registry.items.map(item => (
                  <div key={item.id} className="border rounded p-4">
                    <div className="flex justify-between">
                      <h4 className="font-medium">{item.name}</h4>
                      <span className="text-gray-600">${item.price}</span>
                    </div>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm">Quantity: {item.quantity}</p>
                      <p className="text-sm">Priority: {item.priority}</p>
                      <p className="text-sm">Status: {item.status}</p>
                    </div>
                    <div className="mt-4 space-x-2">
                      <Button
                        onClick={() => editItem(registry.id, item)}
                        variant="secondary"
                        size="sm"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => removeItem(registry.id, item.id)}
                        variant="outline"
                        size="sm"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={showRegistryModal}
        onClose={() => {
          setShowRegistryModal(false);
          resetRegistryForm();
        }}
        title={selectedRegistry ? 'Edit Registry' : 'Create Registry'}
      >
        <form onSubmit={handleRegistrySubmit} className="space-y-4">
          <Input
            label="Title"
            value={registryForm.title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegistryForm({ ...registryForm, title: e.target.value })}
            required
          />
          <Input
            label="Description"
            value={registryForm.description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegistryForm({ ...registryForm, description: e.target.value })}
            type="textarea"
          />
          <Input
            label="Event Date"
            type="date"
            value={registryForm.eventDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegistryForm({ ...registryForm, eventDate: e.target.value })}
          />
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowRegistryModal(false);
                resetRegistryForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {selectedRegistry ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showItemModal}
        onClose={() => {
          setShowItemModal(false);
          resetItemForm();
        }}
        title={selectedItem ? 'Edit Item' : 'Add Item'}
      >
        <form onSubmit={handleItemSubmit} className="space-y-4">
          <Input
            label="Name"
            value={itemForm.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setItemForm({ ...itemForm, name: e.target.value })}
            required
          />
          <Input
            label="Price"
            type="number"
            value={itemForm.price}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setItemForm({ ...itemForm, price: Number(e.target.value) })}
            required
            min={0}
            step={0.01}
          />
          <Input
            label="Quantity"
            type="number"
            value={itemForm.quantity}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setItemForm({ ...itemForm, quantity: Number(e.target.value) })}
            required
            min={1}
          />
          <div className="space-y-2">
            <label className="block text-sm font-medium">Priority</label>
            <select
              value={itemForm.priority}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setItemForm({ ...itemForm, priority: e.target.value as 'must-have' | 'nice-to-have' })}
              className="w-full border rounded-md p-2"
            >
              <option value="must-have">Must Have</option>
              <option value="nice-to-have">Nice to Have</option>
            </select>
          </div>
          <Input
            label="Notes"
            value={itemForm.notes}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setItemForm({ ...itemForm, notes: e.target.value })}
            type="textarea"
          />
          <Input
            label="Image URL"
            value={itemForm.imageUrl}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setItemForm({ ...itemForm, imageUrl: e.target.value })}
          />
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowItemModal(false);
                resetItemForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {selectedItem ? 'Update' : 'Add'}
            </Button>
          </div>
        </form>
      </Modal>
    </Container>
  );
}
