"use client";

import { useState } from "react";
import { AddressManagerProps } from "@/app/types/dashboard";
import type { Address } from "@prisma/client";
import { toast } from "react-hot-toast";

export default function SavedAddresses({
  addresses,
  onAddAddress,
  onUpdateAddress,
  onDeleteAddress,
  isLoading,
}: AddressManagerProps) {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState<Partial<Address>>({});
  const [error, setError] = useState<string | null>(null);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await onAddAddress(newAddress as Omit<Address, "id" | "userId">);
      setNewAddress({});
      setIsEditing(null);
      toast.success("Address added successfully");
    } catch (error) {
      setError("Failed to add address. Please try again.");
      toast.error("Failed to add address");
    }
  };

  const handleUpdateAddress = async (id: string, updates: Partial<Address>) => {
    setError(null);
    try {
      await onUpdateAddress(id, updates);
      setIsEditing(null);
      toast.success("Address updated successfully");
    } catch (error) {
      setError("Failed to update address. Please try again.");
      toast.error("Failed to update address");
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this address?")) {
      return;
    }
    
    setError(null);
    try {
      await onDeleteAddress(id);
      toast.success("Address deleted successfully");
    } catch (error) {
      setError("Failed to delete address. Please try again.");
      toast.error("Failed to delete address");
    }
  };

  const handleSetDefault = async (id: string) => {
    setError(null);
    try {
      await onUpdateAddress(id, { isDefault: true });
      toast.success("Default address updated");
    } catch (error) {
      setError("Failed to set default address. Please try again.");
      toast.error("Failed to update default address");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg dark:bg-gray-700"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Saved Addresses</h2>
        <button
          onClick={() => setIsEditing("new")}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
        >
          Add New Address
        </button>
      </div>

      {/* Address List */}
      <div className="space-y-4">
        {addresses.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No addresses saved yet. Add your first address to get started.
          </div>
        ) : (
          addresses.map((address) => (
            <div
              key={address.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-shadow hover:shadow-md"
            >
              {isEditing === address.id ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdateAddress(address.id, newAddress);
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Street"
                      defaultValue={address.street}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, street: e.target.value })
                      }
                      className="border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md p-2 w-full focus:ring-2 focus:ring-primary"
                      required
                    />
                    <input
                      type="text"
                      placeholder="City"
                      defaultValue={address.city}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, city: e.target.value })
                      }
                      className="border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md p-2 w-full focus:ring-2 focus:ring-primary"
                      required
                    />
                    <input
                      type="text"
                      placeholder="State"
                      defaultValue={address.state}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, state: e.target.value })
                      }
                      className="border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md p-2 w-full focus:ring-2 focus:ring-primary"
                      required
                    />
                    <input
                      type="text"
                      placeholder="ZIP Code"
                      defaultValue={address.zipCode}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, zipCode: e.target.value })
                      }
                      className="border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md p-2 w-full focus:ring-2 focus:ring-primary"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Country"
                      defaultValue={address.country}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, country: e.target.value })
                      }
                      className="border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md p-2 w-full focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newAddress.isDefault || false}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, isDefault: e.target.checked })
                        }
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-300">Set as default address</span>
                    </label>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(null)}
                      className="px-4 py-2 border dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{address.street}</p>
                      <p className="text-gray-600 dark:text-gray-300">
                        {address.city}, {address.state} {address.zipCode}
                      </p>
                      <p className="text-gray-600 dark:text-gray-300">{address.country}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      {!address.isDefault && (
                        <button
                          onClick={() => handleSetDefault(address.id)}
                          className="text-sm text-primary hover:text-primary-dark transition-colors"
                        >
                          Set as Default
                        </button>
                      )}
                      <button
                        onClick={() => setIsEditing(address.id)}
                        className="text-primary hover:text-primary-dark transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(address.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  {address.isDefault && (
                    <span className="mt-2 inline-block px-2 py-1 text-xs bg-primary-50 dark:bg-primary-900 text-primary rounded">
                      Default Address
                    </span>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add New Address Form */}
      {isEditing === "new" && (
        <form onSubmit={handleAddAddress} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Add New Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Street"
              onChange={(e) =>
                setNewAddress({ ...newAddress, street: e.target.value })
              }
              className="border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md p-2 w-full focus:ring-2 focus:ring-primary"
              required
            />
            <input
              type="text"
              placeholder="City"
              onChange={(e) =>
                setNewAddress({ ...newAddress, city: e.target.value })
              }
              className="border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md p-2 w-full focus:ring-2 focus:ring-primary"
              required
            />
            <input
              type="text"
              placeholder="State"
              onChange={(e) =>
                setNewAddress({ ...newAddress, state: e.target.value })
              }
              className="border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md p-2 w-full focus:ring-2 focus:ring-primary"
              required
            />
            <input
              type="text"
              placeholder="ZIP Code"
              onChange={(e) =>
                setNewAddress({ ...newAddress, zipCode: e.target.value })
              }
              className="border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md p-2 w-full focus:ring-2 focus:ring-primary"
              required
            />
            <input
              type="text"
              placeholder="Country"
              onChange={(e) =>
                setNewAddress({ ...newAddress, country: e.target.value })
              }
              className="border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md p-2 w-full focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={newAddress.isDefault || false}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, isDefault: e.target.checked })
                }
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-600 dark:text-gray-300">Set as default address</span>
            </label>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsEditing(null)}
              className="px-4 py-2 border dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
            >
              Add Address
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
