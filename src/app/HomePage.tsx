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

export default function MarketplaceHome() {
  return (
    <div className="min-h-screen bg-geometric-pattern bg-[length:1000px_1000px] bg-center bg-fixed overflow-x-hidden">
      <main id="main-content" className="flex-grow">
        <div className="space-y-24 py-8">
          <div className="bg-white/80 backdrop-blur-sm"><HeroSection /></div>
          <div className="bg-white/80 backdrop-blur-sm py-12"><PopularProducts /></div>
          <div className="bg-white/80 backdrop-blur-sm py-12"><TrustElements /></div>
          <div className="bg-white/80 backdrop-blur-sm py-12"><ColorPalette /></div>
          <div className="bg-white/80 backdrop-blur-sm py-12"><WeddingThemes /></div>
          <div className="bg-white/80 backdrop-blur-sm py-12"><SellerSection /></div>
          <div className="bg-white/80 backdrop-blur-sm py-12"><DealOfTheDay /></div>
          <div className="bg-white/80 backdrop-blur-sm py-12"><FeaturedCategories /></div>
          <div className="bg-white/80 backdrop-blur-sm py-12"><Testimonials /></div>
          <div className="bg-white/80 backdrop-blur-sm py-12"><NewsletterSignup /></div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
