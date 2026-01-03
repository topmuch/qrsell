import React, { useEffect, useState } from 'react';
import NewHeroSection from '@/components/landing/NewHeroSection';
import HowItWorksNew from '@/components/landing/HowItWorksNew';
import ShopShowcase from '@/components/landing/ShopShowcase';
import WhyChooseUs from '@/components/landing/WhyChooseUs';
import TestimonialSection from '@/components/landing/TestimonialSection';
import PlansSection from '@/components/landing/PlansSection';
import FinalCTA from '@/components/landing/FinalCTA';
import Footer from '@/components/landing/Footer';
import { CheckCircle2, X } from 'lucide-react';

export default function Home() {
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('signup_success') === 'true') {
      setShowSuccess(true);
      // Nettoyer l'URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Success Banner */}
      {showSuccess && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-2xl w-full mx-4">
          <div className="bg-green-50 border-2 border-green-400 text-green-800 px-6 py-4 rounded-xl shadow-xl flex items-start gap-3 animate-in slide-in-from-top">
            <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-lg">Demande envoyée avec succès !</p>
              <p className="text-sm mt-1">Notre équipe validera votre demande sous 24h. Vous recevrez un email de confirmation.</p>
            </div>
            <button 
              onClick={() => setShowSuccess(false)}
              className="text-green-600 hover:text-green-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <main>
        <NewHeroSection />
        <HowItWorksNew />
        <ShopShowcase />
        <WhyChooseUs />
        <PlansSection />
        <TestimonialSection />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}