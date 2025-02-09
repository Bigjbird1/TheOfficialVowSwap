"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown, ChevronUp } from "lucide-react";
import { Category, navigationData } from "@/app/types/navigation";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const toggleCategory = (categoryName: string) => {
    setExpandedCategory(expandedCategory === categoryName ? null : categoryName);
  };

  return (
    <div
      className={`fixed inset-0 bg-white transform ${
        isOpen ? "translate-x-0" : "translate-x-full"
      } transition-transform duration-300 ease-in-out z-50 lg:hidden`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto">
          <div className="py-2">
            {navigationData.map((category) => (
              <div key={category.name} className="border-b">
                {category.subcategories ? (
                  <div>
                    <button
                      onClick={() => toggleCategory(category.name)}
                      className="flex items-center justify-between w-full p-4 text-left hover:bg-gray-50 transition"
                      aria-expanded={expandedCategory === category.name}
                    >
                      <span className="text-lg">{category.name}</span>
                      {expandedCategory === category.name ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                    {expandedCategory === category.name && (
                      <div className="bg-gray-50 px-4 py-2">
                        {category.subcategories.map((subcategory) => (
                          <Link
                            key={subcategory.name}
                            href={subcategory.href}
                            onClick={onClose}
                            className="block py-2 px-4 text-gray-600 hover:text-rose-500 transition"
                          >
                            {subcategory.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={category.href}
                    onClick={onClose}
                    className="block p-4 text-lg hover:bg-gray-50 transition"
                  >
                    {category.name}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
