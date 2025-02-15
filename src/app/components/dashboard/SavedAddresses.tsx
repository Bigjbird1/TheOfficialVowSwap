import React, { useState } from 'react';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert } from '../ui/alert';
import { Address, AddressManagerProps } from '@/app/types/dashboard';

type AddressFormData = {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const initialFormData: AddressFormData = {
  street: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'US',
  isDefault: false,
  createdAt: new Date(),
  updatedAt: new Date()
};

const SavedAddresses: React.FC<AddressManagerProps> = ({
  addresses,
  onAddAddress,
  onUpdateAddress,
  onDeleteAddress,
  isLoading
}) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AddressFormData>(initialFormData);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      updatedAt: new Date()
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await onUpdateAddress(editingId, formData);
        setEditingId(null);
      } else {
        await onAddAddress(formData);
      }

      // Reset form
      setFormData(initialFormData);
      setIsAddingNew(false);
    } catch (error) {
      console.error('Error saving address:', error);
    }
  };

  const handleEdit = (address: Address) => {
    setFormData({
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      isDefault: address.isDefault,
      createdAt: address.createdAt,
      updatedAt: new Date()
    });
    setEditingId(address.id);
    setIsAddingNew(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await onDeleteAddress(id);
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Saved Addresses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="h-24 bg-gray-200 rounded-lg"></div>
              <div className="h-24 bg-gray-200 rounded-lg"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Saved Addresses</CardTitle>
        </CardHeader>
        <CardContent>
          {addresses.length === 0 && !isAddingNew ? (
            <Alert>
              <p className="text-sm">
                No addresses saved yet. Add your first address to get started.
              </p>
            </Alert>
          ) : (
            <div className="space-y-6">
              {/* List of saved addresses */}
              {!isAddingNew && addresses.map((address) => (
                <div key={address.id} className="border rounded-lg p-4 relative">
                  <div className="absolute right-4 top-4 flex gap-2">
                    <button 
                      onClick={() => handleEdit(address)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(address.id)}
                      className="text-gray-600 hover:text-red-600"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  {address.isDefault && (
                    <span className="bg-rose-100 text-rose-600 text-sm px-2 py-1 rounded-full">
                      Default
                    </span>
                  )}
                  <div className="mt-2">
                    <p>{address.street}</p>
                    <p>{`${address.city}, ${address.state} ${address.zipCode}`}</p>
                    <p className="text-gray-600">{address.country}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add/Edit Address Form */}
          {isAddingNew ? (
            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Street Address</label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-rose-500 rounded border-gray-300"
                />
                <label className="ml-2 text-sm text-gray-700">Set as default address</label>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-rose-500 text-white px-4 py-2 rounded-md hover:bg-rose-600"
                >
                  {editingId ? 'Update Address' : 'Save Address'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingId(null);
                    setFormData(initialFormData);
                  }}
                  className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingNew(true)}
              className="mt-6 flex items-center gap-2 text-rose-500 hover:text-rose-600"
            >
              <PlusCircle className="w-5 h-5" />
              Add New Address
            </button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SavedAddresses;
