"use client";

import Link from "next/link";
import { Category } from "@/app/types/navigation";

interface MegaMenuProps {
  category: Category;
  isOpen: boolean;
}

export default function MegaMenu({ category, isOpen }: MegaMenuProps) {
  console.log(`MegaMenu isOpen: ${isOpen}`);
  if (!category.subcategories) return null;

  return (
<div
  className={`absolute left-1/2 transform -translate-x-1/2 top-full mt-0.5 bg-white shadow-lg rounded-lg ${
    isOpen ? "opacity-100 translate-y-0 visible" : "opacity-0 -translate-y-1 invisible"
  } transition-all duration-150 ease-out z-50 max-w-4xl mx-auto w-screen border border-gray-100`}
  role="menu"
  aria-orientation="vertical"
  aria-labelledby={`${category.name}-menu-button`}
>
  <div className="w-full px-6 py-4">
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-4">
      {category.subcategories.map((subcategory) => (
        <div key={subcategory.name} className="space-y-2">
          <Link
            href={subcategory.href}
            className="text-base font-semibold text-gray-800 hover:text-rose-600 transition-colors duration-200"
          >
            {subcategory.name}
          </Link>
          {subcategory.examples && subcategory.examples.length > 0 && (
            <ul className="mt-1 space-y-1">
              {subcategory.examples.map((example) => (
                <li key={example} className="text-sm text-gray-600">
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
