import type { ServiceCategory, WeddingService } from "../types/wedding-services";

// Mock data - replace with actual API calls in production
const mockCategories: ServiceCategory[] = [
  {
    id: "plan-1",
    name: "Planning",
    description: "Wedding planning services",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "photo-1",
    name: "Photography",
    description: "Wedding photography services",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "food-1",
    name: "Catering",
    description: "Wedding catering services",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const mockServices: WeddingService[] = [
  {
    id: "1",
    name: "Wedding Planning",
    description: "Full-service wedding planning and coordination",
    price: 2000,
    priceType: "FIXED",
    categoryId: "plan-1",
    sellerId: "seller-1",
    images: ["/images/wedding-planning.jpg"],
    features: ["Full event coordination", "Vendor management", "Timeline planning"],
    availability: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  },
  {
    id: "2",
    name: "Photography",
    description: "Professional wedding photography services",
    price: 1500,
    priceType: "FIXED",
    categoryId: "photo-1",
    sellerId: "seller-2",
    images: ["/images/wedding-photography.jpg"],
    features: ["8 hours coverage", "Digital gallery", "Engagement shoot"],
    availability: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  },
  {
    id: "3",
    name: "Catering",
    description: "Custom wedding catering and menu planning",
    price: 50,
    priceType: "PER_PERSON",
    categoryId: "food-1",
    sellerId: "seller-3",
    images: ["/images/wedding-catering.jpg"],
    features: ["Custom menu planning", "Staff included", "Setup and cleanup"],
    availability: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  }
];

// In production, these would be actual API calls
export async function getCategories(): Promise<ServiceCategory[]> {
  try {
    // Simulated API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockCategories;
  } catch (error) {
    throw new Error("Failed to fetch categories");
  }
}

export async function getServices(): Promise<WeddingService[]> {
  try {
    // Simulated API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockServices;
  } catch (error) {
    throw new Error("Failed to fetch services");
  }
}
