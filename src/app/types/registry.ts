    export type RegistryItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  priority: 'must-have' | 'nice-to-have';
  status: 'available' | 'purchased' | 'reserved';
  purchasedBy?: string;
  notes?: string;
  imageUrl?: string;
};

export type Registry = {
  id: string;
  userId: string;
  title: string;
  description?: string;
  eventDate?: Date;
  items: RegistryItem[];
  shareLink: string;
  createdAt: Date;
  updatedAt: Date;
};

export type WishlistItem = RegistryItem & {
  favorite: boolean;
  position: number;
};

export type Wishlist = {
  id: string;
  userId: string;
  items: WishlistItem[];
  createdAt: Date;
  updatedAt: Date;
};

export type RegistryNotification = {
  id: string;
  registryId: string;
  type: 'item_added' | 'item_purchased' | 'price_change' | 'reminder';
  message: string;
  createdAt: Date;
  read: boolean;
};
