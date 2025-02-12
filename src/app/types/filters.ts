export type SortOption = 'price_asc' | 'price_desc' | 'popularity' | 'newest' | 'new_arrivals';

export interface PriceRange {
  min: number;
  max: number;
}

export interface ProductFilters {
  categories?: string[];
  priceRange?: PriceRange;
  ratings?: number[];
  themes?: string[];
  search?: string;
  sortBy?: SortOption;
  newArrivals?: boolean;
  subcategory?: string;
  brand?: string;
  size?: string;
  color?: string;
  condition?: string;
  onSale?: boolean;
}

export interface FilterOption {
  label: string;
  value: string;
}

export const WEDDING_THEMES: FilterOption[] = [
  { label: 'Rustic', value: 'rustic' },
  { label: 'Modern', value: 'modern' },
  { label: 'Vintage', value: 'vintage' },
  { label: 'Bohemian', value: 'bohemian' },
  { label: 'Classic', value: 'classic' },
  { label: 'Beach', value: 'beach' },
  { label: 'Garden', value: 'garden' },
  { label: 'Minimalist', value: 'minimalist' }
];

export const SORT_OPTIONS: FilterOption[] = [
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Most Popular', value: 'popularity' },
  { label: 'Recently Added', value: 'newest' },
  { label: 'New Arrivals', value: 'new_arrivals' }
];

export const RATING_OPTIONS: FilterOption[] = [
  { label: '4★ & up', value: '4' },
  { label: '3★ & up', value: '3' },
  { label: '2★ & up', value: '2' },
  { label: '1★ & up', value: '1' }
];

export const DEFAULT_PRICE_RANGE: PriceRange = {
  min: 0,
  max: 10000
};
