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
    subcategories: [
      {
        name: "Featured Collections",
        examples: ["New Arrivals", "Best Sellers", "Trending Items"],
        href: "/products?filter=featured"
      },
      {
        name: "Shop by Style",
        examples: ["Modern", "Rustic", "Vintage", "Bohemian"],
        href: "/products?filter=style"
      },
      {
        name: "Shop by Season",
        examples: ["Spring", "Summer", "Fall", "Winter"],
        href: "/products?filter=season"
      },
      {
        name: "Special Deals",
        examples: ["Clearance", "Bundle Deals", "Limited Time Offers"],
        href: "/products?filter=deals"
      }
    ]
  },
  {
    name: "Decor",
    href: "/products?categories=decor",
    subcategories: [
      {
        name: "Ceremony Decor",
        examples: ["backdrops", "altar decorations", "aisle runners"],
        href: "/products?categories=decor&subcategory=ceremony"
      },
      {
        name: "Reception Decor",
        examples: ["centerpieces", "table runners", "chair decorations"],
        href: "/products?categories=decor&subcategory=reception"
      },
      {
        name: "Ambient Decor",
        examples: ["draperies", "wall hangings", "thematic props"],
        href: "/products?categories=decor&subcategory=ambient"
      },
      {
        name: "Outdoor Decor",
        examples: ["lighting", "archways", "floral installations"],
        href: "/products?categories=decor&subcategory=outdoor"
      }
    ]
  },
  {
    name: "Lighting",
    href: "/products?categories=lighting",
    subcategories: [
      {
        name: "Chandeliers & Pendant Lights",
        href: "/products?categories=lighting&subcategory=chandeliers"
      },
      {
        name: "String & Fairy Lights",
        href: "/products?categories=lighting&subcategory=string-lights"
      },
      {
        name: "Accent & Uplighting",
        href: "/products?categories=lighting&subcategory=accent"
      },
      {
        name: "Lanterns & Candles",
        href: "/products?categories=lighting&subcategory=lanterns"
      }
    ]
  },
  {
    name: "Furniture",
    href: "/products?categories=furniture",
    subcategories: [
      {
        name: "Seating",
        examples: ["chairs", "benches", "sofas"],
        href: "/products?categories=furniture&subcategory=seating"
      },
      {
        name: "Tables & Surfaces",
        examples: ["dining tables", "coffee tables"],
        href: "/products?categories=furniture&subcategory=tables"
      },
      {
        name: "Lounge & Outdoor Furniture",
        href: "/products?categories=furniture&subcategory=lounge"
      }
    ]
  },
  {
    name: "Floral",
    href: "/products?categories=floral",
    subcategories: [
      {
        name: "Bouquets",
        href: "/products?categories=floral&subcategory=bouquets"
      },
      {
        name: "Centerpieces & Arrangements",
        href: "/products?categories=floral&subcategory=centerpieces"
      },
      {
        name: "Garlands & Installations",
        href: "/products?categories=floral&subcategory=garlands"
      },
      {
        name: "Boutonnieres & Corsages",
        href: "/products?categories=floral&subcategory=boutonnieres"
      }
    ]
  },
  {
    name: "Accessories",
    href: "/products?categories=accessories",
    subcategories: [
      {
        name: "Invitations & Stationery",
        href: "/products?categories=accessories&subcategory=stationery"
      },
      {
        name: "Favors & Gifts",
        href: "/products?categories=accessories&subcategory=favors"
      },
      {
        name: "Bridal Accessories",
        examples: ["jewelry", "veils"],
        href: "/products?categories=accessories&subcategory=bridal"
      },
      {
        name: "Reception Accessories",
        examples: ["signage", "decor props"],
        href: "/products?categories=accessories&subcategory=reception"
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
