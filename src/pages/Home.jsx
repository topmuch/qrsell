import React from 'react';
import Logo from '@/components/ui/Logo';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import TestimonialSection from '@/components/landing/TestimonialSection';
import PricingSection from '@/components/landing/PricingSection';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Dashboard')}>
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                Connexion
              </Button>
            </Link>
            <Link to={createPageUrl('Dashboard')}>
              <Button className="bg-gradient-to-r from-[#ed477c] to-[#ff6b9d] hover:opacity-90 text-white rounded-lg">
                Commencer
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="pt-16">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialSection />
        <PricingSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}