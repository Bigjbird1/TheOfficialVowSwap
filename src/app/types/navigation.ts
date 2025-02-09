export interface SubCategory {
  name: string;
  examples?: string[];
  href: string;
}

export interface Category {
  name: string;
  href: string;
  subcategories?: SubCategory[];
}

export const navigationData: Category[] = [
  {
    name: "All Items",
    href: "/products",
  },
  {
    name: "Decor",
    href: "/products/decor",
    subcategories: [
      {
        name: "Ceremony Decor",
        examples: ["backdrops", "altar decorations", "aisle runners"],
        href: "/products/decor/ceremony"
      },
      {
        name: "Reception Decor",
        examples: ["centerpieces", "table runners", "chair decorations"],
        href: "/products/decor/reception"
      },
      {
        name: "Ambient Decor",
        examples: ["draperies", "wall hangings", "thematic props"],
        href: "/products/decor/ambient"
      },
      {
        name: "Outdoor Decor",
        examples: ["lighting", "archways", "floral installations"],
        href: "/products/decor/outdoor"
      }
    ]
  },
  {
    name: "Lighting",
    href: "/products/lighting",
    subcategories: [
      {
        name: "Chandeliers & Pendant Lights",
        href: "/products/lighting/chandeliers"
      },
      {
        name: "String & Fairy Lights",
        href: "/products/lighting/string-lights"
      },
      {
        name: "Accent & Uplighting",
        href: "/products/lighting/accent"
      },
      {
        name: "Lanterns & Candles",
        href: "/products/lighting/lanterns"
      }
    ]
  },
  {
    name: "Furniture",
    href: "/products/furniture",
    subcategories: [
      {
        name: "Seating",
        examples: ["chairs", "benches", "sofas"],
        href: "/products/furniture/seating"
      },
      {
        name: "Tables & Surfaces",
        examples: ["dining tables", "coffee tables"],
        href: "/products/furniture/tables"
      },
      {
        name: "Lounge & Outdoor Furniture",
        href: "/products/furniture/lounge"
      }
    ]
  },
  {
    name: "Floral",
    href: "/products/floral",
    subcategories: [
      {
        name: "Bouquets",
        href: "/products/floral/bouquets"
      },
      {
        name: "Centerpieces & Arrangements",
        href: "/products/floral/centerpieces"
      },
      {
        name: "Garlands & Installations",
        href: "/products/floral/garlands"
      },
      {
        name: "Boutonnieres & Corsages",
        href: "/products/floral/boutonnieres"
      }
    ]
  },
  {
    name: "Accessories",
    href: "/products/accessories",
    subcategories: [
      {
        name: "Invitations & Stationery",
        href: "/products/accessories/stationery"
      },
      {
        name: "Favors & Gifts",
        href: "/products/accessories/favors"
      },
      {
        name: "Bridal Accessories",
        examples: ["jewelry", "veils"],
        href: "/products/accessories/bridal"
      },
      {
        name: "Reception Accessories",
        examples: ["signage", "decor props"],
        href: "/products/accessories/reception"
      }
    ]
  },
  {
    name: "Wedding Services",
    href: "/wedding-services",
    subcategories: [
      {
        name: "Photography & Videography",
        href: "/wedding-services/photography"
      },
      {
        name: "Catering",
        href: "/wedding-services/catering"
      },
      {
        name: "Planning & Coordination",
        href: "/wedding-services/planning"
      },
      {
        name: "Music & Entertainment",
        href: "/wedding-services/entertainment"
      },
      {
        name: "Beauty Services",
        href: "/wedding-services/beauty"
      },
      {
        name: "Transportation",
        href: "/wedding-services/transportation"
      },
      {
        name: "Rentals",
        href: "/wedding-services/rentals"
      }
    ]
  }
];
