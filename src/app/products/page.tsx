import ProductDetailsPage from "../ProductDetailsPage";

const mockProducts = [
  {
    id: "1",
    name: "Elegant Wedding Dress",
    price: 1200,
    description: "A beautiful, flowing wedding dress perfect for your special day.",
    category: "Dresses",
    rating: 4.5,
    reviewCount: 120,
    stockStatus: "In Stock", // Corrected type
    images: [
      {
        id: "1-1",
        url: "https://via.placeholder.com/800x800?text=Wedding+Dress+1",
        alt: "Wedding Dress 1",
      },
      {
        id: "1-2",
        url: "https://via.placeholder.com/800x800?text=Wedding+Dress+2",
        alt: "Wedding Dress 2",
      }
    ],
    specifications: {
      condition: "New",
      materials: "Silk, Lace",
      size: "M",
      color: "Ivory",
      width: "N/A",
      height: "N/A",
      depth: "N/A",
      weight: "2 lbs"
    },
    shippingInfo: "Free shipping within 5-7 business days.",
    sellerName: "Bridal Boutique",
    sellerRating: 4.8,
  },
  {
    id: "2",
    name: "Classic Tuxedo",
    price: 450,
    description: "A timeless tuxedo for a sophisticated look.",
    category: "Suits",
    rating: 4.2,
    reviewCount: 85,
    stockStatus: "Low Stock", // Corrected type
    images: [
      {
        id: "2-1",
        url: "https://via.placeholder.com/800x800?text=Tuxedo+1",
        alt: "Tuxedo 1",
      },
       {
        id: "2-2",
        url: "https://via.placeholder.com/800x800?text=Tuxedo+2",
        alt: "Tuxedo 2",
      }
    ],
    specifications: {
      condition: "New",
      materials: "Wool Blend",
      size: "L",
      color: "Black",
       width: "N/A",
      height: "N/A",
      depth: "N/A",
      weight: "4 lbs"
    },
    shippingInfo: "Express shipping available.",
    sellerName: "Groom's Corner",
    sellerRating: 4.6,
  },
    {
    id: "3",
    name: "Diamond Ring",
    price: 2500,
    description: "Stunning diamond ring.",
    category: "Jewelry",
    rating: 4.9,
    reviewCount: 200,
    stockStatus: "In Stock", // Corrected type
    images: [
      {
        id: "3-1",
        url: "https://via.placeholder.com/800x800?text=Diamond+Ring",
        alt: "Diamond Ring",
      }
    ],
    specifications: {
      condition: "New",
      materials: "White Gold, Diamond",
      size: "7",
      color: "Silver",
       width: "N/A",
      height: "N/A",
      depth: "N/A",
      weight: "0.1 lbs"
    },
    shippingInfo: "Free shipping.",
    sellerName: "Jeweler's Heaven",
    sellerRating: 5.0,
  },
];

export default function ProductsPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-center my-8">Popular Items</h2>
      <div className="grid grid-cols-1 gap-4">
        {mockProducts.map((product) => (
          <ProductDetailsPage key={product.id} id={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
