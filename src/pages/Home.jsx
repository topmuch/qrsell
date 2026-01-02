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
  // Vérifier si la demande a été envoyée avec succès
  const urlParams = new URLSearchParams(window.location.search);
  const signupSuccess = urlParams.get('signup_success') === 'true';

  return (
    <div className="min-h-screen bg-white">
      {/* Message de confirmation */}
      {signupSuccess && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
          <div className="bg-green-50 border-2 border-green-400 text-green-800 px-6 py-4 rounded-xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Demande envoyée avec succès !</h3>
                <p className="text-sm">Notre équipe validera votre demande sous 24h. Vous recevrez un email de confirmation.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main>
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