"use client";

import React, { useState } from 'react';

interface FormData {
  itemName: string;
  description: string;
  price: string;
  category: string;
  inventory: string;
  discount: string;
}
import { 
  Camera, 
  Loader2, 
  X, 
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Package,
  Percent
} from 'lucide-react';
import { 
  Alert,
  AlertDescription,
  AlertTitle 
} from "@/app/components/ui/alert";

const CreateListing = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
  const [formData, setFormData] = useState<FormData>({
    itemName: '',
    description: '',
    price: '',
    category: '',
    inventory: '1',
    discount: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const CATEGORIES = [
    'Wedding Dresses',
    'Accessories',
    'Decorations',
    'Invitations',
    'Wedding Favors',
    'Other'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      setErrors(prev => ({
        ...prev,
        images: 'Maximum 5 images allowed'
      }));
      return;
    }
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    setImages(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.itemName.trim()) newErrors.itemName = 'Item name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.price || isNaN(Number(formData.price)) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Please enter a valid price';
    }
    if (!formData.category) newErrors.category = 'Please select a category';
    if (images.length === 0) newErrors.images = 'At least one image is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus({ type: '', message: '' });

    try {
      const submitData = new FormData();
      (Object.keys(formData) as Array<keyof FormData>).forEach(key => {
        submitData.append(key, formData[key]);
      });
      images.forEach(image => {
        submitData.append('images', image);
      });

      const response = await fetch('/api/seller/items', {
        method: 'POST',
        body: submitData
      });

      if (!response.ok) throw new Error('Failed to create listing');

      setSubmitStatus({
        type: 'success',
        message: 'Listing created successfully!'
      });

      setTimeout(() => {
        window.location.href = '/seller/listings';
      }, 2000);
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'Failed to create listing. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent mb-2">
          Create New Listing
        </h1>
        <p className="text-gray-600 mb-8">
          Share your wedding items with couples looking for their perfect pieces
        </p>

        {submitStatus.message && (
          <Alert className={`mb-6 ${
            submitStatus.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            {submitStatus.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <AlertTitle>
              {submitStatus.type === 'success' ? 'Success' : 'Error'}
            </AlertTitle>
            <AlertDescription>{submitStatus.message}</AlertDescription>
          </Alert>
        )}

        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium mb-3">Images * (Max 5)</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative aspect-square group">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded-xl"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-xl">
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {images.length < 5 && (
                  <div className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                    <label className="cursor-pointer p-4 text-center">
                      <Camera className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <span className="text-sm text-gray-500">Add Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
              {errors.images && (
                <p className="mt-2 text-sm text-red-500">{errors.images}</p>
              )}
            </div>

            {/* Item Details */}
            <div className="space-y-6">
              <div>
                <label htmlFor="itemName" className="block text-sm font-medium mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  id="itemName"
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleChange}
                  placeholder="Enter item name"
                  className={`w-full px-4 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-rose-500 transition ${
                    errors.itemName ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.itemName && (
                  <p className="mt-2 text-sm text-red-500">{errors.itemName}</p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe your item..."
                  className={`w-full px-4 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-rose-500 transition ${
                    errors.description ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.description && (
                  <p className="mt-2 text-sm text-red-500">{errors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-rose-500 transition ${
                      errors.category ? 'border-red-500' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Select a category</option>
                    {CATEGORIES.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-2 text-sm text-red-500">{errors.category}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium mb-2">
                    Price ($) *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className={`w-full pl-12 pr-4 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-rose-500 transition ${
                        errors.price ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                  </div>
                  {errors.price && (
                    <p className="mt-2 text-sm text-red-500">{errors.price}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="inventory" className="block text-sm font-medium mb-2">
                    Inventory Count
                  </label>
                  <div className="relative">
                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      id="inventory"
                      name="inventory"
                      value={formData.inventory}
                      onChange={handleChange}
                      min="1"
                      placeholder="1"
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-rose-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="discount" className="block text-sm font-medium mb-2">
                    Discount (%)
                  </label>
                  <div className="relative">
                    <Percent className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      id="discount"
                      name="discount"
                      value={formData.discount}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      placeholder="0"
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-rose-500 transition"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-200 rounded-full hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-full hover:from-rose-600 hover:to-purple-700 disabled:opacity-70 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Listing'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateListing;
