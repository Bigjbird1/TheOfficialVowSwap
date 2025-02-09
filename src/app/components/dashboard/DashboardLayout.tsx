"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import OrderHistory from "./OrderHistory";
import SavedAddresses from "./SavedAddresses";
import PaymentMethods from "./PaymentMethods";
import WishlistItems from "./WishlistItems";
import RegistryDetails from "./RegistryDetails";
import DashboardOverview from "./DashboardOverview";
import {
  TabConfig,
  Address,
  PaymentMethod,
  Product,
  Order,
  OrderHistoryProps,
  AddressManagerProps,
  PaymentMethodsProps,
  WishlistManagerProps,
  RegistryManagerProps
} from "@/app/types/dashboard";

const TABS: TabConfig[] = [
  { id: "overview", label: "Overview" },
  { id: "orders", label: "Order History" },
  { id: "addresses", label: "Saved Addresses" },
  { id: "payments", label: "Payment Methods" },
  { id: "wishlist", label: "Wishlist" },
  { id: "registry", label: "Wedding Registry" },
];

export default function DashboardLayout() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<TabConfig["id"]>("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  
  // Fetch initial data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [ordersRes, addressesRes, paymentMethodsRes, wishlistRes] = await Promise.all([
          fetch("/api/orders").then(res => res.json()),
          fetch("/api/addresses").then(res => res.json()),
          fetch("/api/payment-methods").then(res => res.json()),
          fetch("/api/wishlist").then(res => res.json()),
        ]);

        setOrders(ordersRes);
        setAddresses(addressesRes);
        setPaymentMethods(paymentMethodsRes);
        setWishlistItems(wishlistRes);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchDashboardData();
    }
  }, [session]);

  // Addresses state and handlers
  const [addresses, setAddresses] = useState<Address[]>([]);
  
  const handleAddAddress = useCallback(async (address: Omit<Address, "id" | "userId">) => {
    try {
      const response = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(address),
      });
      if (!response.ok) throw new Error("Failed to add address");
      const newAddress = await response.json();
      setAddresses(prev => [...prev, newAddress]);
    } catch (error) {
      console.error("Error adding address:", error);
    }
  }, []);

  const handleUpdateAddress = useCallback(async (id: string, address: Partial<Address>) => {
    try {
      const response = await fetch(`/api/addresses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(address),
      });
      if (!response.ok) throw new Error("Failed to update address");
      const updatedAddress = await response.json();
      setAddresses(prev => prev.map(addr => addr.id === id ? updatedAddress : addr));
    } catch (error) {
      console.error("Error updating address:", error);
    }
  }, []);

  const handleDeleteAddress = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete address");
      setAddresses(prev => prev.filter(addr => addr.id !== id));
    } catch (error) {
      console.error("Error deleting address:", error);
    }
  }, []);

  // Payment methods state and handlers
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  const handleAddPaymentMethod = useCallback(async (method: Omit<PaymentMethod, "id" | "userId">) => {
    try {
      const response = await fetch("/api/payment-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(method),
      });
      if (!response.ok) throw new Error("Failed to add payment method");
      const newMethod = await response.json();
      setPaymentMethods(prev => [...prev, newMethod]);
    } catch (error) {
      console.error("Error adding payment method:", error);
    }
  }, []);

  const handleDeletePaymentMethod = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/payment-methods/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete payment method");
      setPaymentMethods(prev => prev.filter(method => method.id !== id));
    } catch (error) {
      console.error("Error deleting payment method:", error);
    }
  }, []);

  // Wishlist state and handlers
  const [wishlistItems, setWishlistItems] = useState<(Product & { addedAt: Date })[]>([]);

  const handleRemoveFromWishlist = useCallback(async (productId: string) => {
    try {
      const response = await fetch(`/api/wishlist/${productId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to remove from wishlist");
      setWishlistItems(prev => prev.filter(item => item.id !== productId));
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  }, []);

  const handleMoveToCart = useCallback(async (productId: string) => {
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      if (!response.ok) throw new Error("Failed to add to cart");
      await handleRemoveFromWishlist(productId);
    } catch (error) {
      console.error("Error moving to cart:", error);
    }
  }, [handleRemoveFromWishlist]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent">
        My Account
      </h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <nav className="w-full md:w-64 bg-white rounded-xl shadow-lg shadow-gray-200/50 p-4 border border-gray-100">
          <ul className="space-y-2">
            {TABS.map((tab) => (
              <li key={tab.id}>
                <button
                  data-tab={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-md"
                      : "hover:bg-gray-50 text-gray-700 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 bg-white rounded-xl shadow-lg shadow-gray-200/50 p-8 border border-gray-100">
          {activeTab === "overview" && <DashboardOverview />}
          {activeTab === "orders" && (
            <OrderHistory 
              orders={orders} 
              isLoading={isLoading} 
            />
          )}
          {activeTab === "addresses" && (
            <SavedAddresses 
              addresses={addresses}
              onAddAddress={handleAddAddress}
              onUpdateAddress={handleUpdateAddress}
              onDeleteAddress={handleDeleteAddress}
              isLoading={isLoading}
            />
          )}
          {activeTab === "payments" && (
            <PaymentMethods 
              paymentMethods={paymentMethods}
              onAddPaymentMethod={handleAddPaymentMethod}
              onDeletePaymentMethod={handleDeletePaymentMethod}
              isLoading={isLoading}
            />
          )}
          {activeTab === "wishlist" && (
            <WishlistItems 
              items={wishlistItems}
              onRemoveFromWishlist={handleRemoveFromWishlist}
              onMoveToCart={handleMoveToCart}
              isLoading={isLoading}
            />
          )}
          {activeTab === "registry" && (
            <RegistryDetails 
              items={[]}
              onUpdateQuantity={(productId: string, quantity: number) => Promise.resolve()}
              onRemoveItem={(productId: string) => Promise.resolve()}
              isLoading={isLoading}
            />
          )}
        </main>
      </div>
    </div>
  );
}
