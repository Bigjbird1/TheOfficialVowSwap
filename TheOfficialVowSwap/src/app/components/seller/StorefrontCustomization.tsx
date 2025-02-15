import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  StorefrontCustomization as StorefrontCustomizationType, 
  StorefrontUpdateData,
  StorefrontBusinessHours
} from '@/app/types/seller';

interface Props {
  initialData?: StorefrontCustomizationType;
}

export default function StorefrontCustomization({ initialData }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const updateBusinessHours = useCallback((
    day: keyof StorefrontBusinessHours,
    type: 'open' | 'close',
    value: string
  ) => {
    setFormData(prev => {
      const newHours: StorefrontBusinessHours = { ...(prev.businessHours || {}) };
      if (!newHours[day]) {
        newHours[day] = { open: '', close: '' };
      }
      newHours[day] = {
        ...newHours[day]!,
        [type]: value
      };
      return {
        ...prev,
        businessHours: newHours
      };
    });
  }, []);

  const [formData, setFormData] = useState<StorefrontCustomizationType>({
    bannerImage: initialData?.bannerImage || '',
    logoImage: initialData?.logoImage || '',
    themeColor: initialData?.themeColor || '#000000',
    accentColor: initialData?.accentColor || '#ffffff',
    fontFamily: initialData?.fontFamily || 'Inter',
    layout: initialData?.layout || {
      sections: [
        { id: '1', type: 'products', title: 'Products', order: 1, isVisible: true },
        { id: '2', type: 'about', title: 'About Us', order: 2, isVisible: true },
        { id: '3', type: 'contact', title: 'Contact', order: 3, isVisible: true }
      ]
    },
    socialLinks: initialData?.socialLinks || {},
    businessHours: initialData?.businessHours || {},
    policies: initialData?.policies || {}
  });

  const handleImageUpload = useCallback(async (type: 'banner' | 'logo', file: File) => {
    try {
      // TODO: Implement image upload to cloud storage
      const formData = new FormData();
      formData.append('file', file);
      
      // Mock upload for now
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        [type === 'banner' ? 'bannerImage' : 'logoImage']: imageUrl
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  }, []);

  const handleSectionOrderChange = useCallback((draggedId: string, targetId: string) => {
    setFormData(prev => {
      const newSections = [...prev.layout.sections];
      const draggedIndex = newSections.findIndex(s => s.id === draggedId);
      const targetIndex = newSections.findIndex(s => s.id === targetId);
      
      const [draggedSection] = newSections.splice(draggedIndex, 1);
      newSections.splice(targetIndex, 0, draggedSection);
      
      return {
        ...prev,
        layout: {
          sections: newSections.map((section, index) => ({
            ...section,
            order: index + 1
          }))
        }
      };
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/seller/storefront', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to update storefront');

      router.refresh();
    } catch (error) {
      console.error('Error updating storefront:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Preview Section */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div 
            className="h-48 bg-cover bg-center relative"
            style={{ backgroundImage: `url(${formData.bannerImage || '/placeholder-banner.jpg'})` }}
          >
            {formData.logoImage && (
              <div className="absolute bottom-4 left-4 h-20 w-20 rounded-full overflow-hidden border-4 border-white">
                <Image
                  src={formData.logoImage}
                  alt="Store logo"
                  width={80}
                  height={80}
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </div>

        {/* Image Upload Section */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Banner Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleImageUpload('banner', e.target.files[0])}
              className="mt-1 block w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Logo Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleImageUpload('logo', e.target.files[0])}
              className="mt-1 block w-full"
            />
          </div>
        </div>

        {/* Theme Customization */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Theme Color</label>
            <input
              type="color"
              value={formData.themeColor}
              onChange={(e) => setFormData(prev => ({ ...prev, themeColor: e.target.value }))}
              className="mt-1 block w-full h-10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Accent Color</label>
            <input
              type="color"
              value={formData.accentColor}
              onChange={(e) => setFormData(prev => ({ ...prev, accentColor: e.target.value }))}
              className="mt-1 block w-full h-10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Font Family</label>
            <select
              value={formData.fontFamily}
              onChange={(e) => setFormData(prev => ({ ...prev, fontFamily: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="Inter">Inter</option>
              <option value="Roboto">Roboto</option>
              <option value="Playfair Display">Playfair Display</option>
              <option value="Montserrat">Montserrat</option>
            </select>
          </div>
        </div>

        {/* Layout Customization */}
        <div>
          <h3 className="text-lg font-medium text-gray-900">Layout Sections</h3>
          <div className="mt-4 space-y-4">
            {formData.layout.sections.map((section) => (
              <div
                key={section.id}
                className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
                draggable
                onDragStart={(e) => e.dataTransfer.setData('text/plain', section.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const draggedId = e.dataTransfer.getData('text/plain');
                  handleSectionOrderChange(draggedId, section.id);
                }}
              >
                <div className="flex items-center">
                  <span className="mr-4">☰</span>
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => {
                      const newSections = formData.layout.sections.map(s =>
                        s.id === section.id ? { ...s, title: e.target.value } : s
                      );
                      setFormData(prev => ({
                        ...prev,
                        layout: { ...prev.layout, sections: newSections }
                      }));
                    }}
                    className="border-none focus:ring-0 font-medium"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={section.isVisible}
                      onChange={(e) => {
                        const newSections = formData.layout.sections.map(s =>
                          s.id === section.id ? { ...s, isVisible: e.target.checked } : s
                        );
                        setFormData(prev => ({
                          ...prev,
                          layout: { ...prev.layout, sections: newSections }
                        }));
                      }}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">Visible</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Social Links */}
        <div>
          <h3 className="text-lg font-medium text-gray-900">Social Links</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {['facebook', 'instagram', 'twitter', 'pinterest', 'website'].map((platform) => (
              <div key={platform}>
                <label className="block text-sm font-medium text-gray-700 capitalize">
                  {platform}
                </label>
                <input
                  type="url"
                  value={formData.socialLinks?.[platform] || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    socialLinks: {
                      ...prev.socialLinks,
                      [platform]: e.target.value
                    }
                  }))}
                  placeholder={`Enter ${platform} URL`}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Business Hours */}
        <div>
          <h3 className="text-lg font-medium text-gray-900">Business Hours</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
              <div key={day} className="flex space-x-4">
                <div className="w-1/3">
                  <label className="block text-sm font-medium text-gray-700 capitalize">
                    {day}
                  </label>
                </div>
                <div className="w-2/3 flex space-x-2">
                  <input
                    type="time"
                    value={formData.businessHours?.[day as keyof StorefrontBusinessHours]?.open || ''}
                    onChange={(e) => updateBusinessHours(day as keyof StorefrontBusinessHours, 'open', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <span className="mt-2">to</span>
                  <input
                    type="time"
                    value={formData.businessHours?.[day as keyof StorefrontBusinessHours]?.close || ''}
                    onChange={(e) => updateBusinessHours(day as keyof StorefrontBusinessHours, 'close', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Store Policies */}
        <div>
          <h3 className="text-lg font-medium text-gray-900">Store Policies</h3>
          <div className="mt-4 space-y-4">
            {['shipping', 'returns', 'customization', 'terms'].map((policy) => (
              <div key={policy}>
                <label className="block text-sm font-medium text-gray-700 capitalize">
                  {policy} Policy
                </label>
                <textarea
                  value={formData.policies?.[policy] || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    policies: {
                      ...prev.policies,
                      [policy]: e.target.value
                    }
                  }))}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder={`Enter your ${policy} policy`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
