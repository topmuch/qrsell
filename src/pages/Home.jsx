import React from 'react';
import { base44 } from '@/api/base44Client';
import Logo from '@/components/ui/Logo';
import NewHeroSection from '@/components/landing/NewHeroSection';
import HowItWorksNew from '@/components/landing/HowItWorksNew';
import ShopShowcase from '@/components/landing/ShopShowcase';
import WhyChooseUs from '@/components/landing/WhyChooseUs';
import TestimonialSection from '@/components/landing/TestimonialSection';
import FinalCTA from '@/components/landing/FinalCTA';
import Footer from '@/components/landing/Footer';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils/index';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              className="text-gray-600 hover:text-[#2563eb]"
              onClick={() => base44.auth.redirectToLogin()}
            >
              Connexion
            </Button>
            <Link to={createPageUrl('SubscriptionRequest')}>
              <Button className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-full px-6">
                Commencer
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="pt-16">
        <NewHeroSection />
        <HowItWorksNew />
        <ShopShowcase />
        <WhyChooseUs />
        <TestimonialSection />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}