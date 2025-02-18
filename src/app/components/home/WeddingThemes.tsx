"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { ChromePicker, ColorResult } from "react-color";
import { Paintbrush, Check, Undo } from "lucide-react";

interface ThemeItem {
  name: string;
  price: number;
  image: string;
}

interface WeddingTheme {
  name: string;
  description: string;
  image: string;
  popularItems: ThemeItem[];
  features: string[];
  accent: string;
  defaultColors: {
    primary: string;
    secondary: string;
    background: string;
  };
  typography: {
    heading: string;
    body: string;
  };
}

interface CustomTheme {
  themeName: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
  };
  typography: {
    heading: string;
    body: string;
  };
}

const themes: WeddingTheme[] = [
  {
    name: "Rustic Charm",
    description: "Blend natural elements with vintage touches for a warm, inviting atmosphere",
    image: "/images/themes/rustic.jpg",
    popularItems: [
      {
        name: "Mason Jar Lights",
        price: 34.99,
        image: "/images/products/mason-lights.jpg"
      },
      {
        name: "Wooden Table Numbers",
        price: 24.99,
        image: "/images/products/wood-numbers.jpg"
      },
      {
        name: "Burlap Table Runner",
        price: 29.99,
        image: "/images/products/burlap-runner.jpg"
      }
    ],
    features: [
      "Natural wood elements",
      "Vintage-inspired decor",
      "Warm lighting options",
      "Textured fabrics"
    ],
    accent: "bg-amber-100",
    defaultColors: {
      primary: "#8B4513",
      secondary: "#D2691E",
      background: "#FFF8DC"
    },
    typography: {
      heading: "font-serif",
      body: "font-sans"
    }
  },
  {
    name: "Modern Minimalist",
    description: "Clean lines and sophisticated simplicity for a contemporary celebration",
    image: "/images/themes/modern.jpg",
    popularItems: [
      {
        name: "Geometric Centerpiece",
        price: 45.99,
        image: "/images/products/geometric-center.jpg"
      },
      {
        name: "Acrylic Table Numbers",
        price: 39.99,
        image: "/images/products/acrylic-numbers.jpg"
      },
      {
        name: "Metal Candle Holders",
        price: 49.99,
        image: "/images/products/metal-holders.jpg"
      }
    ],
    features: [
      "Geometric shapes",
      "Metallic accents",
      "Minimalist design",
      "Contemporary materials"
    ],
    accent: "bg-gray-100",
    defaultColors: {
      primary: "#2C3E50",
      secondary: "#7F8C8D",
      background: "#FFFFFF"
    },
    typography: {
      heading: "font-sans",
      body: "font-sans"
    }
  },
  // ... (other themes remain the same, just add defaultColors and typography)
];

const fontOptions = [
  { label: "Serif", value: "font-serif" },
  { label: "Sans Serif", value: "font-sans" },
  { label: "Display", value: "font-display" },
];

export const WeddingThemes = () => {
  const [selectedTheme, setSelectedTheme] = useState<WeddingTheme | null>(null);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [activeColorPicker, setActiveColorPicker] = useState<"primary" | "secondary" | "background" | null>(null);
  const [customTheme, setCustomTheme] = useState<CustomTheme | null>(null);

  // Load saved theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("vowswap-theme");
    if (savedTheme) {
      setCustomTheme(JSON.parse(savedTheme));
    }
  }, []);

  // Save theme to localStorage when it changes
  useEffect(() => {
    if (customTheme) {
      localStorage.setItem("vowswap-theme", JSON.stringify(customTheme));
      // Apply theme to document
      document.documentElement.style.setProperty("--primary-color", customTheme.colors.primary);
      document.documentElement.style.setProperty("--secondary-color", customTheme.colors.secondary);
      document.documentElement.style.setProperty("--background-color", customTheme.colors.background);
    }
  }, [customTheme]);

  const handleThemeSelect = (theme: WeddingTheme) => {
    setSelectedTheme(theme);
    if (!customTheme) {
      setCustomTheme({
        themeName: theme.name,
        colors: theme.defaultColors,
        typography: theme.typography
      });
    }
  };

  const handleCustomizeTheme = () => {
    if (selectedTheme && !customTheme) {
      setCustomTheme({
        themeName: selectedTheme.name,
        colors: selectedTheme.defaultColors,
        typography: selectedTheme.typography
      });
    }
    setIsCustomizing(true);
  };

  const handleColorChange = (color: ColorResult, type: "primary" | "secondary" | "background") => {
    if (customTheme) {
      setCustomTheme({
        ...customTheme,
        colors: {
          ...customTheme.colors,
          [type]: color.hex
        }
      });
    }
  };

  const handleTypographyChange = (value: string, type: "heading" | "body") => {
    if (customTheme) {
      setCustomTheme({
        ...customTheme,
        typography: {
          ...customTheme.typography,
          [type]: value
        }
      });
    }
  };

  const resetTheme = () => {
    if (selectedTheme) {
      setCustomTheme({
        themeName: selectedTheme.name,
        colors: selectedTheme.defaultColors,
        typography: selectedTheme.typography
      });
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className={`text-3xl font-bold text-gray-900 mb-4 ${customTheme?.typography.heading}`}>
            Wedding Themes
          </h2>
          <p className={`text-lg text-gray-600 ${customTheme?.typography.body}`}>
            Discover and customize your perfect wedding style
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {themes.map((theme) => (
            <div
              key={theme.name}
              className={`rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ${
                customTheme?.themeName === theme.name ? "ring-2 ring-[#E35B96]" : ""
              } ${theme.accent}`}
              style={
                customTheme?.themeName === theme.name
                  ? {
                      backgroundColor: customTheme.colors.background,
                      borderColor: customTheme.colors.primary,
                    }
                  : {}
              }
            >
              {/* Theme Image */}
              <div className="relative h-64">
                <Image
                  src={theme.image}
                  alt={`${theme.name} wedding theme example`}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.src = "/images/placeholder-theme.jpg";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className={`text-2xl font-bold text-white mb-2 ${customTheme?.typography.heading}`}>
                    {theme.name}
                  </h3>
                  <p className={`text-white/90 ${customTheme?.typography.body}`}>{theme.description}</p>
                </div>
              </div>

              {/* Theme Features */}
              <div className="p-6">
                <div className="mb-6">
                  <h4 className={`font-semibold text-gray-900 mb-3 ${customTheme?.typography.heading}`}>
                    Key Features:
                  </h4>
                  <ul className="space-y-2">
                    {theme.features.map((feature, index) => (
                      <li
                        key={index}
                        className={`flex items-center text-gray-700 ${customTheme?.typography.body}`}
                      >
                        <svg
                          className="w-5 h-5 text-rose-500 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-between items-center">
                  <Button
                    variant="ghost"
                    onClick={() => handleThemeSelect(theme)}
                  >
                    View Collection
                  </Button>
                  <Button
                    onClick={() => handleThemeSelect(theme)}
                  >
                    Select Theme
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Theme Customization Modal */}
        <Modal
          isOpen={isCustomizing}
          onClose={() => setIsCustomizing(false)}
          title="Customize Your Theme"
          description="Personalize colors and typography to match your vision"
        >
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium mb-4">Colors</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(["primary", "secondary", "background"] as const).map((colorType) => (
                  <div key={colorType} className="relative">
                    <button
                      onClick={() => setActiveColorPicker(activeColorPicker === colorType ? null : colorType)}
                      className="w-full p-2 border rounded-lg flex items-center justify-between"
                      style={{
                        backgroundColor: customTheme?.colors[colorType],
                        color: colorType === "background" ? "#000" : "#fff"
                      }}
                    >
                      <span className="capitalize">{colorType}</span>
                      <Paintbrush className="w-4 h-4" />
                    </button>
                    {activeColorPicker === colorType && (
                      <div className="absolute z-10 mt-2">
                        <ChromePicker
                          color={customTheme?.colors[colorType]}
                          onChange={(color) => handleColorChange(color, colorType)}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium mb-4">Typography</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Headings</label>
                  <select
                    value={customTheme?.typography.heading}
                    onChange={(e) => handleTypographyChange(e.target.value, "heading")}
                    className="w-full p-2 border rounded-lg"
                  >
                    {fontOptions.map((font) => (
                      <option key={font.value} value={font.value}>
                        {font.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Body Text</label>
                  <select
                    value={customTheme?.typography.body}
                    onChange={(e) => handleTypographyChange(e.target.value, "body")}
                    className="w-full p-2 border rounded-lg"
                  >
                    {fontOptions.map((font) => (
                      <option key={font.value} value={font.value}>
                        {font.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={resetTheme}
              >
                <Undo className="w-4 h-4 mr-2" />
                Reset to Default
              </Button>
              <Button onClick={() => setIsCustomizing(false)}>
                <Check className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </Modal>

        {/* Theme Details Modal */}
        <Modal
          isOpen={!!selectedTheme && !isCustomizing}
          onClose={() => setSelectedTheme(null)}
          title={selectedTheme?.name}
          description={selectedTheme?.description}
        >
          {selectedTheme && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Theme Preview */}
              <div>
                <div className="relative h-80 rounded-lg overflow-hidden mb-4">
                  <Image
                    src={selectedTheme.image}
                    alt={selectedTheme.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex justify-between items-center mt-4">
                  <Button
                    variant="outline"
                    onClick={handleCustomizeTheme}
                  >
                    Customize Theme
                  </Button>
                  <Link
                    href={`/products?theme=${selectedTheme.name.toLowerCase()}`}
                  >
                    <Button>
                      Shop Collection
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Popular Items */}
              <div>
                <h4 className={`text-xl font-semibold text-gray-900 mb-4 ${customTheme?.typography.heading}`}>
                  Popular Items in this Theme
                </h4>
                <div className="space-y-4">
                  {selectedTheme.popularItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-4 p-3 rounded-lg bg-gray-50"
                      style={{ backgroundColor: customTheme?.colors.background }}
                    >
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.src = "/images/placeholder-product.jpg";
                          }}
                        />
                      </div>
                      <div className="flex-grow">
                        <h5 className={`font-medium text-gray-900 ${customTheme?.typography.heading}`}>
                          {item.name}
                        </h5>
                        <p className="text-rose-500 font-semibold">${item.price}</p>
                      </div>
                      <Link
                        href={`/products/${item.name.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        <Button variant="outline">
                          View
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </section>
  );
};

export default WeddingThemes;
