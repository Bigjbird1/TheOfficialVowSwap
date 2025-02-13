import { Metadata } from "next"
import { HeroSection } from "./components/home/HeroSection"
import { TrustElements } from "./components/home/TrustElements"
import { PopularProducts } from "./components/home/PopularProducts"
import { ColorPalette } from "./components/home/ColorPalette"
import { WeddingThemes } from "./components/home/WeddingThemes"
import { SellerSection } from "./components/home/SellerSection"
import { DealOfTheDay } from "./components/home/DealOfTheDay"
import { FeaturedCategories } from "./components/home/FeaturedCategories"
import { Testimonials } from "./components/home/Testimonials"
import { NewsletterSignup } from "./components/home/NewsletterSignup"
import { Footer } from "./components/home/Footer"

// Metadata for SEO
export const metadata: Metadata = {
  title: "VowSwap - Wedding Decor Marketplace",
  description: "Discover unique wedding decor items to make your special day unforgettable. Shop from trusted sellers and find everything you need in one place.",
  keywords: "wedding decor, wedding marketplace, wedding items, wedding decorations, wedding planning",
  openGraph: {
    title: "VowSwap - Wedding Decor Marketplace",
    description: "Discover unique wedding decor items to make your special day unforgettable.",
    type: "website",
    url: "https://vowswap.com",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "VowSwap Wedding Marketplace"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "VowSwap - Wedding Decor Marketplace",
    description: "Discover unique wedding decor items to make your special day unforgettable.",
    images: ["/twitter-image.jpg"]
  }
}

export default function MarketplaceHome() {
  return (
    <div className="min-h-screen bg-white">
      <main id="main-content" className="flex-grow">
        <HeroSection />
        <TrustElements />
        <PopularProducts />
        <ColorPalette />
        <WeddingThemes />
        <SellerSection />
        <DealOfTheDay />
        <FeaturedCategories />
        <Testimonials />
        <NewsletterSignup />
      </main>
      <Footer />
    </div>
  )
}
