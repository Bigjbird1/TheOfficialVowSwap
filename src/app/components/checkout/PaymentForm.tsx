"use client"

import { useState, ChangeEvent } from "react"
import InputMask from "react-input-mask"

interface InputMaskChangeEvent extends ChangeEvent<HTMLInputElement> {
  target: HTMLInputElement & {
    value: string
    mask?: string | Array<(string | RegExp)>
  }
}

interface PaymentInfo {
  cardNumber: string
  expiryDate: string
  cvv: string
  nameOnCard: string
}

interface PaymentFormProps {
  paymentInfo: PaymentInfo
  onSubmit: (e: React.FormEvent) => void
  onChange: (info: PaymentInfo) => void
}

export default function PaymentForm({ paymentInfo, onSubmit, onChange }: PaymentFormProps) {
  const [errors, setErrors] = useState<Partial<Record<keyof PaymentInfo, string>>>({})

  // Validation functions
  const validateCardNumber = (value: string) => {
    const cleanValue = value.replace(/\D/g, '')
    if (cleanValue.length !== 16) {
      return 'Please enter a valid 16-digit card number'
    }
    return ''
  }

  const validateExpiryDate = (value: string) => {
    const [month, year] = value.split('/')
    const currentYear = new Date().getFullYear() % 100
    const currentMonth = new Date().getMonth() + 1

    if (!month || !year || month.length !== 2 || year.length !== 2) {
      return 'Please enter a valid expiry date'
    }

    const numMonth = parseInt(month)
    const numYear = parseInt(year)

    if (numMonth < 1 || numMonth > 12) {
      return 'Invalid month'
    }

    if (numYear < currentYear || (numYear === currentYear && numMonth < currentMonth)) {
      return 'Card has expired'
    }

    return ''
  }

  const validateCVV = (value: string) => {
    const cleanValue = value.replace(/\D/g, '')
    if (cleanValue.length !== 3 && cleanValue.length !== 4) {
      return 'CVV must be 3 or 4 digits'
    }
    return ''
  }

  const handleChange = (name: keyof PaymentInfo, value: string) => {
    let error = ''
    
    switch (name) {
      case 'cardNumber':
        error = validateCardNumber(value)
        break
      case 'expiryDate':
        error = validateExpiryDate(value)
        break
      case 'cvv':
        error = validateCVV(value)
        break
      case 'nameOnCard':
        error = value.trim() ? '' : 'Name is required'
        break
    }

    setErrors(prev => ({ ...prev, [name]: error }))
    onChange({ ...paymentInfo, [name]: value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all fields before submission
    const newErrors: Partial<Record<keyof PaymentInfo, string>> = {
      cardNumber: validateCardNumber(paymentInfo.cardNumber),
      expiryDate: validateExpiryDate(paymentInfo.expiryDate),
      cvv: validateCVV(paymentInfo.cvv),
      nameOnCard: paymentInfo.nameOnCard.trim() ? '' : 'Name is required'
    }

    setErrors(newErrors)

    if (!Object.values(newErrors).some(error => error)) {
      onSubmit(e)
    }
  }

  // Card type detection
  const detectCardType = (number: string) => {
    const clean = number.replace(/\D/g, '')
    if (clean.startsWith('4')) return 'Visa'
    if (/^5[1-5]/.test(clean)) return 'Mastercard'
    if (/^3[47]/.test(clean)) return 'American Express'
    if (/^6(?:011|5)/.test(clean)) return 'Discover'
    return 'Unknown'
  }

  const cardType = detectCardType(paymentInfo.cardNumber)

  return (
    <div role="region" aria-label="Payment Information">
      <div className="mb-4">
        <div role="progressbar" aria-valuenow={2} aria-valuemin={1} aria-valuemax={3} className="sr-only">
          Step 2 of 3: Payment Information
        </div>
        <div className="flex justify-between mb-2">
          <span className="font-medium">Payment</span>
          <span className="text-gray-500">Step 2 of 3</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div className="h-full w-2/3 bg-rose-500 rounded-full"></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="nameOnCard" className="block text-sm font-medium text-gray-700">
          Name on Card
        </label>
        <input
          type="text"
          id="nameOnCard"
          name="ccname"
          required
          autoComplete="cc-name"
          className={`mt-1 block w-full rounded-md shadow-sm focus:ring-rose-500 ${
            errors.nameOnCard ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-rose-500'
          }`}
          value={paymentInfo.nameOnCard}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('nameOnCard', e.target.value)}
          aria-describedby={errors.nameOnCard ? 'nameOnCard-error' : undefined}
        />
        {errors.nameOnCard && (
          <p className="mt-1 text-sm text-red-600" id="nameOnCard-error">
            {errors.nameOnCard}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
          Card Number
        </label>
        <InputMask
          mask="9999 9999 9999 9999"
          maskChar={null}
          type="text"
          id="cardNumber"
          name="cardnumber"
          required
          autoComplete="cc-number"
          aria-label={`Credit card number (${cardType})`}
          className={`mt-1 block w-full rounded-md shadow-sm focus:ring-rose-500 ${
            errors.cardNumber ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-rose-500'
          }`}
          value={paymentInfo.cardNumber}
          onChange={(e: InputMaskChangeEvent) => handleChange('cardNumber', e.target.value)}
          aria-describedby={errors.cardNumber ? 'cardNumber-error' : undefined}
        />
        {errors.cardNumber && (
          <p className="mt-1 text-sm text-red-600" id="cardNumber-error">
            {errors.cardNumber}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
            Expiry Date
          </label>
          <InputMask
            mask="99/99"
            maskChar={null}
            type="text"
            id="expiryDate"
            name="cc-exp"
            required
            autoComplete="cc-exp"
            placeholder="MM/YY"
            aria-label="Credit card expiration date (MM/YY)"
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-rose-500 ${
              errors.expiryDate ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-rose-500'
            }`}
            value={paymentInfo.expiryDate}
            onChange={(e: InputMaskChangeEvent) => handleChange('expiryDate', e.target.value)}
            aria-describedby={errors.expiryDate ? 'expiryDate-error' : undefined}
          />
          {errors.expiryDate && (
            <p className="mt-1 text-sm text-red-600" id="expiryDate-error">
              {errors.expiryDate}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">
            CVV
          </label>
          <InputMask
            mask="9999"
            maskChar={null}
            type="text"
            id="cvv"
            name="cvc"
            required
            autoComplete="cc-csc"
            aria-label="Credit card security code (3 or 4 digits)"
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-rose-500 ${
              errors.cvv ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-rose-500'
            }`}
            value={paymentInfo.cvv}
            onChange={(e: InputMaskChangeEvent) => handleChange('cvv', e.target.value)}
            aria-describedby={errors.cvv ? 'cvv-error' : undefined}
          />
          {errors.cvv && (
            <p className="mt-1 text-sm text-red-600" id="cvv-error">
              {errors.cvv}
            </p>
          )}
        </div>
      </div>

        <div className="flex items-center justify-between mt-6 mb-2">
          <div className="text-sm text-gray-500">Secure Payment</div>
          <div className="flex space-x-2">
            <span className={`${cardType === 'Visa' ? 'opacity-100' : 'opacity-50'}`} aria-label="Visa">
              <img src="/visa.svg" alt="" className="h-6" />
            </span>
            <span className={`${cardType === 'Mastercard' ? 'opacity-100' : 'opacity-50'}`} aria-label="Mastercard">
              <img src="/mastercard.svg" alt="" className="h-6" />
            </span>
            <span className={`${cardType === 'American Express' ? 'opacity-100' : 'opacity-50'}`} aria-label="American Express">
              <img src="/amex.svg" alt="" className="h-6" />
            </span>
            <span className={`${cardType === 'Discover' ? 'opacity-100' : 'opacity-50'}`} aria-label="Discover">
              <img src="/discover.svg" alt="" className="h-6" />
            </span>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-rose-500 text-white py-3 rounded-full hover:bg-rose-600 transition focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
        >
          Review Order
        </button>
      </form>
    </div>
  )
}
