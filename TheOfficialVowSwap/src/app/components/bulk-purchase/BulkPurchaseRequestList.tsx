import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { BulkPurchaseRequest, BulkRequestStatus } from '@/app/types/bulk-purchase';
import BulkPurchaseResponseForm from './BulkPurchaseResponseForm';

interface BulkPurchaseRequestListProps {
  role: 'buyer' | 'seller';
}

export default function BulkPurchaseRequestList({ role }: BulkPurchaseRequestListProps) {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<BulkPurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<BulkRequestStatus | 'ALL'>('ALL');

  const fetchRequests = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: '10',
        role: role,
        ...(statusFilter !== 'ALL' && { status: statusFilter })
      });

      const response = await fetch(`/api/bulk-purchase?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }

      const data = await response.json();
      setRequests(data.requests);
      setTotalPages(Math.ceil(data.total / 10));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [currentPage, statusFilter, role]);

  const handleStatusChange = async (requestId: string, newStatus: BulkRequestStatus) => {
    try {
      const response = await fetch(`/api/bulk-purchase/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      fetchRequests();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update status');
    }
  };

  const getStatusBadgeColor = (status: BulkRequestStatus) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      RESPONDED: 'bg-blue-100 text-blue-800',
      ACCEPTED: 'bg-green-100 text-green-800',
      DECLINED: 'bg-red-100 text-red-800',
      COMPLETED: 'bg-purple-100 text-purple-800',
      CANCELLED: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">
          {role === 'seller' ? 'Bulk Purchase Requests' : 'My Bulk Purchase Requests'}
        </h2>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as BulkRequestStatus | 'ALL')}
          className="rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
        >
          <option value="ALL">All Statuses</option>
          {Object.values(BulkRequestStatus).map((status) => (
            <option key={status} value={status}>
              {status.charAt(0) + status.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No requests found.
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-white shadow rounded-lg p-6 space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium">
                    {request.product.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Quantity: {request.quantity}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${getStatusBadgeColor(
                    request.status
                  )}`}
                >
                  {request.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Contact Email</p>
                  <p>{request.contactEmail}</p>
                </div>
                {request.contactPhone && (
                  <div>
                    <p className="text-gray-500">Contact Phone</p>
                    <p>{request.contactPhone}</p>
                  </div>
                )}
              </div>

              {request.requirements && (
                <div>
                  <p className="text-gray-500 text-sm">Requirements</p>
                  <p className="text-sm mt-1">{request.requirements}</p>
                </div>
              )}

              {role === 'seller' && request.status === BulkRequestStatus.PENDING && (
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setSelectedRequest(request.id)}
                    className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
                  >
                    Respond
                  </button>
                  <button
                    onClick={() => handleStatusChange(request.id, BulkRequestStatus.DECLINED)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Decline
                  </button>
                </div>
              )}

              {request.responses.length > 0 && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="text-sm font-medium mb-2">Responses</h4>
                  {request.responses.map((response) => (
                    <div
                      key={response.id}
                      className="bg-gray-50 p-4 rounded-md space-y-2"
                    >
                      <div className="flex justify-between">
                        <p className="text-sm font-medium">
                          Custom Price: ${response.customPrice}
                        </p>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            response.status === 'ACCEPTED'
                              ? 'bg-green-100 text-green-800'
                              : response.status === 'DECLINED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {response.status}
                        </span>
                      </div>
                      <p className="text-sm">
                        Estimated Delivery: {new Date(response.estimatedDelivery).toLocaleDateString()}
                      </p>
                      {response.notes && (
                        <p className="text-sm text-gray-600">{response.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <BulkPurchaseResponseForm
              requestId={selectedRequest}
              onSuccess={() => {
                setSelectedRequest(null);
                fetchRequests();
              }}
              onCancel={() => setSelectedRequest(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
