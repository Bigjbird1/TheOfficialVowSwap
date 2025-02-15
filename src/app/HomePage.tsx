import React from 'react';
import HeroSection from './components/home/HeroSection';
import FeaturedCategories from './components/home/FeaturedCategories';
import PopularProducts from './components/home/PopularProducts';
import DealOfTheDay from './components/home/DealOfTheDay';
import WeddingThemes from './components/home/WeddingThemes';
import Testimonials from './components/home/Testimonials';
import TrustElements from './components/home/TrustElements';
import NewsletterSignup from './components/home/NewsletterSignup';
import Footer from './components/home/Footer';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturedCategories />
      <PopularProducts />
      <DealOfTheDay />
      <WeddingThemes />
      <Testimonials />
      <TrustElements />
      <NewsletterSignup />
      <Footer />
    </div>
  );
};

export default HomePage;
