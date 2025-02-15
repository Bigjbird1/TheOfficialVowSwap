"use client"

import { useState } from "react"

interface ShippingInfo {
  fullName: string
  email: string
  address: string
  city: string
  state: string
  zipCode: string
}

interface ShippingFormProps {
  shippingInfo: ShippingInfo
  onSubmit: (e: React.FormEvent) => void
  onChange: (info: ShippingInfo) => void
}

export default function ShippingForm({ shippingInfo, onSubmit, onChange }: ShippingFormProps) {
  // State for validation errors
  const [errors, setErrors] = useState<Partial<Record<keyof ShippingInfo, string>>>({})

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  const validateField = (name: keyof ShippingInfo, value: string) => {
    if (name === 'email' && !emailRegex.test(value)) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }))
    } else if (name === 'zipCode' && !/^\d{5}(-\d{4})?$/.test(value)) {
      setErrors(prev => ({ ...prev, zipCode: 'Please enter a valid ZIP code' }))
    } else {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleChange = (name: keyof ShippingInfo, value: string) => {
    validateField(name, value)
    onChange({ ...shippingInfo, [name]: value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all fields before submission
    let hasErrors = false
    const newErrors: Partial<Record<keyof ShippingInfo, string>> = {}
    
    Object.entries(shippingInfo).forEach(([key, value]) => {
      if (!value) {
        hasErrors = true
        newErrors[key as keyof ShippingInfo] = 'This field is required'
      } else if (key === 'email' && !emailRegex.test(value)) {
        hasErrors = true
        newErrors.email = 'Please enter a valid email address'
      } else if (key === 'zipCode' && !/^\d{5}(-\d{4})?$/.test(value)) {
        hasErrors = true
        newErrors.zipCode = 'Please enter a valid ZIP code'
      }
    })

    setErrors(newErrors)

    if (!hasErrors) {
      onSubmit(e)
    }
  }

  return (
    <div role="region" aria-label="Shipping Information">
      <div className="mb-4">
        <div role="progressbar" aria-valuenow={1} aria-valuemin={1} aria-valuemax={3} className="sr-only">
          Step 1 of 3: Shipping Information
        </div>
        <div className="flex justify-between mb-2">
          <span className="font-medium">Shipping</span>
          <span className="text-gray-500">Step 1 of 3</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div className="h-full w-1/3 bg-rose-500 rounded-full"></div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          required
          autoComplete="name"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
          value={shippingInfo.fullName}
          onChange={(e) => handleChange('fullName', e.target.value)}
          aria-describedby={errors.fullName ? 'fullName-error' : undefined}
        />
        {errors.fullName && (
          <p className="mt-1 text-sm text-red-600" id="fullName-error">
            {errors.fullName}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          autoComplete="email"
          className={`mt-1 block w-full rounded-md shadow-sm focus:ring-rose-500 ${
            errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-rose-500'
          }`}
          value={shippingInfo.email}
          onChange={(e) => handleChange('email', e.target.value)}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600" id="email-error">
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
          Address
        </label>
        <input
          type="text"
          id="address"
          name="address"
          required
          autoComplete="street-address"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
          value={shippingInfo.address}
          onChange={(e) => handleChange('address', e.target.value)}
          aria-describedby={errors.address ? 'address-error' : undefined}
        />
        {errors.address && (
          <p className="mt-1 text-sm text-red-600" id="address-error">
            {errors.address}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
            City
          </label>
          <input
            type="text"
            id="city"
            name="city"
            required
            autoComplete="address-level2"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
            value={shippingInfo.city}
            onChange={(e) => handleChange('city', e.target.value)}
            aria-describedby={errors.city ? 'city-error' : undefined}
          />
          {errors.city && (
            <p className="mt-1 text-sm text-red-600" id="city-error">
              {errors.city}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700">
            State
          </label>
          <select
            id="state"
            name="state"
            required
            autoComplete="address-level1"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
            value={shippingInfo.state}
            onChange={(e) => handleChange('state', e.target.value)}
            aria-describedby={errors.state ? 'state-error' : undefined}
          >
            <option value="">Select a state</option>
            <option value="AL">Alabama</option>
            <option value="AK">Alaska</option>
            <option value="AZ">Arizona</option>
            {/* Add all US states */}
            <option value="WY">Wyoming</option>
          </select>
          {errors.state && (
            <p className="mt-1 text-sm text-red-600" id="state-error">
              {errors.state}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
          ZIP Code
        </label>
        <input
          type="text"
          id="zipCode"
          name="zipCode"
          required
          autoComplete="postal-code"
          inputMode="numeric"
          pattern="[0-9]*"
          className={`mt-1 block w-full rounded-md shadow-sm focus:ring-rose-500 ${
            errors.zipCode ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-rose-500'
          }`}
          value={shippingInfo.zipCode}
          onChange={(e) => handleChange('zipCode', e.target.value)}
          aria-describedby={errors.zipCode ? 'zipCode-error' : undefined}
          maxLength={10}
        />
        {errors.zipCode && (
          <p className="mt-1 text-sm text-red-600" id="zipCode-error">
            {errors.zipCode}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="w-full bg-rose-500 text-white py-3 rounded-full hover:bg-rose-600 transition focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
      >
        Continue to Payment
      </button>
      </form>
    </div>
  )
}
