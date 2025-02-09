"use client";

import { Fragment } from "react";
import Link from "next/link";
import { Category, SubCategory } from "@/app/types/navigation";

interface MegaMenuProps {
  category: Category;
  isOpen: boolean;
}

export default function MegaMenu({ category, isOpen }: MegaMenuProps) {
  if (!category.subcategories) return null;

  return (
    <div
      className={`absolute left-0 w-full bg-white shadow-lg transform ${
        isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1 pointer-events-none"
      } transition-all duration-200 ease-in-out z-50`}
      role="menu"
      aria-orientation="vertical"
      aria-labelledby={`${category.name}-menu-button`}
    >
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-6">
          {category.subcategories.map((subcategory) => (
            <div key={subcategory.name} className="space-y-3">
              <Link
                href={subcategory.href}
                className="text-base font-medium text-gray-900 hover:text-rose-500 transition"
              >
                {subcategory.name}
              </Link>
              {subcategory.examples && subcategory.examples.length > 0 && (
                <ul className="mt-2 space-y-2">
                  {subcategory.examples.map((example) => (
                    <li key={example} className="text-sm text-gray-500">
                      {example}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
