"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import OrderHistory from "./OrderHistory";
import SavedAddresses from "./SavedAddresses";
import PaymentMethods from "./PaymentMethods";
import WishlistItems from "./WishlistItems";
import RegistryDetails from "./RegistryDetails";

const TABS = [
  { id: "orders", label: "Order History" },
  { id: "addresses", label: "Saved Addresses" },
  { id: "payments", label: "Payment Methods" },
  { id: "wishlist", label: "Wishlist" },
  { id: "registry", label: "Wedding Registry" },
] as const;

export default function DashboardLayout() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<typeof TABS[number]["id"]>("orders");

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <nav className="w-full md:w-64 bg-white rounded-lg shadow p-4">
          <ul className="space-y-2">
            {TABS.map((tab) => (
              <li key={tab.id}>
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 bg-white rounded-lg shadow p-6">
          {activeTab === "orders" && <OrderHistory />}
          {activeTab === "addresses" && <SavedAddresses />}
          {activeTab === "payments" && <PaymentMethods />}
          {activeTab === "wishlist" && <WishlistItems />}
          {activeTab === "registry" && <RegistryDetails />}
        </main>
      </div>
    </div>
  );
}
