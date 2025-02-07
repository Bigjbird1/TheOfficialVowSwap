import { useState } from 'react';
import { CreateBulkPurchaseResponseInput } from '@/app/types/bulk-purchase';

interface BulkPurchaseResponseFormProps {
  requestId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function BulkPurchaseResponseForm({
  requestId,
  onSuccess,
  onCancel,
}: BulkPurchaseResponseFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<CreateBulkPurchaseResponseInput, 'requestId'>>({
    customPrice: 0,
    estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 1 week from now
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/bulk-purchase/${requestId}/response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          requestId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to submit response');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Respond to Bulk Purchase Request</h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
          disabled={loading}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="customPrice"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Custom Price (per unit)
          </label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              id="customPrice"
              name="customPrice"
              min="0"
              step="0.01"
              required
              value={formData.customPrice}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  customPrice: parseFloat(e.target.value),
                }))
              }
              className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-primary focus:ring-primary sm:text-sm"
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="estimatedDelivery"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Estimated Delivery Date
          </label>
          <input
            type="date"
            id="estimatedDelivery"
            name="estimatedDelivery"
            required
            min={new Date().toISOString().split('T')[0]}
            value={formData.estimatedDelivery.toISOString().split('T')[0]}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                estimatedDelivery: new Date(e.target.value),
              }))
            }
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Notes (optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            value={formData.notes}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, notes: e.target.value }))
            }
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            placeholder="Add any additional notes or terms..."
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm">
            Error: {error}
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            {loading ? 'Submitting...' : 'Submit Response'}
          </button>
        </div>
      </form>
    </div>
  );
}
