"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface PaymentMethod {
  id: string;
  type: string;
  lastFour: string | null;
  isDefault: boolean;
}

export default function PaymentMethods() {
  const { data: session } = useSession();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Omit<PaymentMethod, "id">>({
    type: "credit_card",
    lastFour: "",
    isDefault: false,
  });

  useEffect(() => {
    fetchPaymentMethods();
  }, [session]);

  async function fetchPaymentMethods() {
    try {
      const response = await fetch("/api/payment-methods");
      if (!response.ok) throw new Error("Failed to fetch payment methods");
      const data = await response.json();
      setPaymentMethods(data);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const response = await fetch("/api/payment-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to add payment method");
      
      await fetchPaymentMethods();
      setShowAddForm(false);
      setFormData({
        type: "credit_card",
        lastFour: "",
        isDefault: false,
      });
    } catch (error) {
      console.error("Error adding payment method:", error);
    }
  }

  async function handleUpdate(id: string) {
    try {
      const response = await fetch("/api/payment-methods", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...formData }),
      });

      if (!response.ok) throw new Error("Failed to update payment method");
      
      await fetchPaymentMethods();
      setIsEditing(null);
    } catch (error) {
      console.error("Error updating payment method:", error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this payment method?")) return;

    try {
      const response = await fetch(`/api/payment-methods?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete payment method");
      
      await fetchPaymentMethods();
    } catch (error) {
      console.error("Error deleting payment method:", error);
    }
  }

  async function handleSetDefault(id: string) {
    try {
      const method = paymentMethods.find(m => m.id === id);
      if (!method) return;

      const response = await fetch("/api/payment-methods", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...method, isDefault: true }),
      });

      if (!response.ok) throw new Error("Failed to set default payment method");
      
      await fetchPaymentMethods();
    } catch (error) {
      console.error("Error setting default payment method:", error);
    }
  }

  if (loading) {
    return <div className="animate-pulse">Loading payment methods...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Payment Methods</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          Add New Payment Method
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Payment Type
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="mt-1 block w-full p-2 border rounded-md"
                required
              >
                <option value="credit_card">Credit Card</option>
                <option value="paypal">PayPal</option>
              </select>
            </div>
            {formData.type === "credit_card" && (
              <div>
                <label htmlFor="lastFour" className="block text-sm font-medium text-gray-700">
                  Last 4 Digits
                </label>
                <input
                  type="text"
                  id="lastFour"
                  value={formData.lastFour || ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
                    setFormData({ ...formData, lastFour: value });
                  }}
                  className="mt-1 block w-full p-2 border rounded-md"
                  maxLength={4}
                  pattern="\d{4}"
                  required={formData.type === "credit_card"}
                />
              </div>
            )}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="isDefault">Set as default payment method</label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              Save Payment Method
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {paymentMethods.length === 0 ? (
          <p className="text-center py-8 text-gray-500">
            No payment methods saved yet. Add your first payment method above.
          </p>
        ) : (
          paymentMethods.map((method) => (
            <div
              key={method.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              {isEditing === method.id ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdate(method.id);
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                        Payment Type
                      </label>
                      <select
                        id="type"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="mt-1 block w-full p-2 border rounded-md"
                        required
                      >
                        <option value="credit_card">Credit Card</option>
                        <option value="paypal">PayPal</option>
                      </select>
                    </div>
                    {formData.type === "credit_card" && (
                      <div>
                        <label htmlFor="lastFour" className="block text-sm font-medium text-gray-700">
                          Last 4 Digits
                        </label>
                        <input
                          type="text"
                          id="lastFour"
                          value={formData.lastFour || ""}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "").slice(0, 4);
                            setFormData({ ...formData, lastFour: value });
                          }}
                          className="mt-1 block w-full p-2 border rounded-md"
                          maxLength={4}
                          pattern="\d{4}"
                          required={formData.type === "credit_card"}
                        />
                      </div>
                    )}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`isDefault-${method.id}`}
                        checked={formData.isDefault}
                        onChange={(e) =>
                          setFormData({ ...formData, isDefault: e.target.checked })
                        }
                        className="mr-2"
                      />
                      <label htmlFor={`isDefault-${method.id}`}>
                        Set as default payment method
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(null)}
                      className="px-4 py-2 border rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        {method.type === "credit_card"
                          ? `Credit Card ending in ${method.lastFour}`
                          : "PayPal"}
                        {method.isDefault && (
                          <span className="ml-2 text-sm text-primary">(Default)</span>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setIsEditing(method.id);
                          setFormData({
                            type: method.type,
                            lastFour: method.lastFour,
                            isDefault: method.isDefault,
                          });
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(method.id)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                      {!method.isDefault && (
                        <button
                          onClick={() => handleSetDefault(method.id)}
                          className="text-sm text-gray-600 hover:text-gray-800"
                        >
                          Set as Default
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
