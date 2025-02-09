"use client"

import { useState } from 'react'
import { FilterOption, PriceRange, ProductFilters, SORT_OPTIONS, DEFAULT_PRICE_RANGE } from '../types/filters'

interface FilterBarProps {
  onFilterChange: (filters: ProductFilters) => void
  onSortChange: (sortOption: string) => void
}

export default function FilterBar({ onFilterChange, onSortChange }: FilterBarProps) {
  const [filters, setFilters] = useState<ProductFilters>({
    priceRange: DEFAULT_PRICE_RANGE,
  })

  const categories = [
    { label: 'Dresses', value: 'dresses' },
    { label: 'Suits', value: 'suits' },
    { label: 'Accessories', value: 'accessories' },
    { label: 'Decorations', value: 'decorations' },
  ]

  const subcategories = {
    dresses: [
      { label: 'Wedding Dresses', value: 'wedding-dresses' },
      { label: 'Bridesmaid Dresses', value: 'bridesmaid-dresses' },
      { label: 'Flower Girl Dresses', value: 'flower-girl-dresses' },
    ],
    suits: [
      { label: 'Tuxedos', value: 'tuxedos' },
      { label: 'Dress Suits', value: 'dress-suits' },
      { label: 'Ring Bearer Suits', value: 'ring-bearer-suits' },
    ],
    // Add more subcategories as needed
  }

  const brands = [
    { label: 'Vera Wang', value: 'vera-wang' },
    { label: 'David\'s Bridal', value: 'davids-bridal' },
    { label: 'BHLDN', value: 'bhldn' },
    // Add more brands
  ]

  const sizes = [
    { label: 'XS', value: 'xs' },
    { label: 'S', value: 's' },
    { label: 'M', value: 'm' },
    { label: 'L', value: 'l' },
    { label: 'XL', value: 'xl' },
    // Add more sizes
  ]

  const colors = [
    { label: 'White', value: 'white' },
    { label: 'Ivory', value: 'ivory' },
    { label: 'Champagne', value: 'champagne' },
    { label: 'Blush', value: 'blush' },
    // Add more colors
  ]

  const conditions = [
    { label: 'New with tags', value: 'new-with-tags' },
    { label: 'New without tags', value: 'new-without-tags' },
    { label: 'Like new', value: 'like-new' },
    { label: 'Good', value: 'good' },
  ]

  const handleFilterChange = (filterType: string, value: any) => {
    const newFilters = { ...filters, [filterType]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const renderDropdown = (label: string, options: FilterOption[], onChange: (value: string) => void) => (
    <div className="relative">
      <select
        className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  )

  return (
    <div className="flex flex-wrap gap-4 p-4 bg-white border-b">
      {/* Category */}
      {renderDropdown('Category', categories, (value) => handleFilterChange('category', value))}

      {/* Subcategory */}
      {renderDropdown('Subcategory', subcategories[filters.categories?.[0] as keyof typeof subcategories] || [], 
        (value) => handleFilterChange('subcategory', value))}

      {/* Brand */}
      {renderDropdown('Brand', brands, (value) => handleFilterChange('brand', value))}

      {/* Price Range */}
      <div className="relative">
        <select
          className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          onChange={(e) => {
            const [min, max] = e.target.value.split('-').map(Number)
            handleFilterChange('priceRange', { min, max })
          }}
        >
          <option value="0-10000">Price</option>
          <option value="0-100">Under $100</option>
          <option value="100-500">$100 - $500</option>
          <option value="500-1000">$500 - $1,000</option>
          <option value="1000-5000">$1,000 - $5,000</option>
          <option value="5000-10000">Over $5,000</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>

      {/* Size */}
      {renderDropdown('Size', sizes, (value) => handleFilterChange('size', value))}

      {/* Color */}
      {renderDropdown('Colour', colors, (value) => handleFilterChange('color', value))}

      {/* Condition */}
      {renderDropdown('Condition', conditions, (value) => handleFilterChange('condition', value))}

      {/* On Sale Toggle */}
      <label className="inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          onChange={(e) => handleFilterChange('onSale', e.target.checked)}
        />
        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        <span className="ms-3 text-sm font-medium text-gray-700">On sale</span>
      </label>

      {/* Sort */}
      <div className="ml-auto">
        {renderDropdown('Sort', SORT_OPTIONS, onSortChange)}
      </div>
    </div>
  )
}
