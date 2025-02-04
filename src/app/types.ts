export interface Product {
  id: string
  name: string
  price: number
  description: string
  category: string
  rating: number
  reviewCount: number
  stockStatus: string
  images: {
    id: string
    url: string
    alt: string
  }[]
  specifications: {
    [key: string]: string | undefined
  }
  shippingInfo: string
  sellerName: string
  sellerRating: number
}
