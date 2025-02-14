"use client";

import { useRouter } from 'next/navigation';

export default function ListItemButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push('/seller/create-listing')}
      className="px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-rose-500 to-purple-600 rounded-xl hover:from-rose-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-all shadow-lg shadow-gray-200/50"
      aria-label="List an Item"
    >
      List an Item
    </button>
  );
}
