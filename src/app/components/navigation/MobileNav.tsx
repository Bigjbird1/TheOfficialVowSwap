"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown, ChevronUp, Heart, Gift, Package } from "lucide-react";
import { Category, navigationData } from "@/app/types/navigation";
import { useSession } from "next-auth/react";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

const quickLinks = [
  { name: "Wishlist", href: "/liked-items", icon: Heart },
  { name: "Registry", href: "/registry", icon: Gift },
  { name: "Orders", href: "/orders", icon: Package },
];

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const { data: session } = useSession();

  const toggleCategory = (categoryName: string) => {
    setExpandedCategory(expandedCategory === categoryName ? null : categoryName);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/25 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Mobile menu */}
      <div
        className={`fixed inset-y-0 right-0 w-full max-w-xs bg-white shadow-xl transform transition-all duration-300 ease-in-out lg:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold">Menu</h2>
            <button
              onClick={onClose}
              className="p-3 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#E35B96] focus:ring-offset-2"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Quick access tabs */}
          {session && (
            <div className="grid grid-cols-3 gap-1 p-2 bg-gray-50">
              {quickLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={onClose}
                  className="flex flex-col items-center p-3 rounded-lg hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#E35B96] focus:ring-offset-2"
                >
                  <link.icon className="w-6 h-6 mb-1 text-gray-600" />
                  <span className="text-sm text-gray-600">{link.name}</span>
                </Link>
              ))}
            </div>
          )}

          <nav className="flex-1 overflow-y-auto overscroll-contain">
            <div className="py-2">
              {navigationData.map((category) => (
                <div key={category.name} className="border-b">
                  {category.subcategories ? (
                    <div>
                      <button
                        onClick={() => toggleCategory(category.name)}
                        className="flex items-center justify-between w-full p-4 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#E35B96]"
                        aria-expanded={expandedCategory === category.name}
                      >
                        <span className="text-lg">{category.name}</span>
                        {expandedCategory === category.name ? (
                          <ChevronUp className="w-5 h-5 transition-transform duration-200" />
                        ) : (
                          <ChevronDown className="w-5 h-5 transition-transform duration-200" />
                        )}
                      </button>
                      <div
                        className={`overflow-hidden transition-all duration-200 ease-in-out ${
                          expandedCategory === category.name ? "max-h-96" : "max-h-0"
                        }`}
                      >
                        <div className="bg-gray-50 px-4 py-2">
                          {category.subcategories.map((subcategory) => (
                            <Link
                              key={subcategory.name}
                              href={subcategory.href}
                              onClick={onClose}
                              className="block py-3 px-4 text-gray-600 hover:text-[#E35B96] active:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#E35B96]"
                            >
                              {subcategory.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={category.href}
                      onClick={onClose}
                      className="block p-4 text-lg hover:bg-gray-50 active:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#E35B96]"
                    >
                      {category.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </nav>

          {/* Bottom section for additional links */}
          <div className="border-t p-4">
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/help"
                className="text-sm text-gray-600 hover:text-[#E35B96] transition-colors"
              >
                Help Center
              </Link>
              <Link
                href="/contact"
                className="text-sm text-gray-600 hover:text-[#E35B96] transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
