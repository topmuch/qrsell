import React, { useEffect, useState } from 'react';
import NewHeroSection from '@/components/landing/NewHeroSection';
import HowItWorksNew from '@/components/landing/HowItWorksNew';
import ShopShowcase from '@/components/landing/ShopShowcase';
import WhyChooseUs from '@/components/landing/WhyChooseUs';
import TestimonialSection from '@/components/landing/TestimonialSection';
import PlansSection from '@/components/landing/PlansSection';
import PricingPreview from '@/components/landing/PricingPreview';
import FinalCTA from '@/components/landing/FinalCTA';
import Footer from '@/components/landing/Footer';
import { CheckCircle2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils/index';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, ArrowRight } from 'lucide-react';

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
        
        {/* TikTok Guide Section */}
        <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-4 py-2 mb-4">
                <Play className="w-4 h-4 text-red-600" />
                <span className="text-sm font-semibold text-red-600">GUIDE TIKTOK</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Comment vendre sur TikTok avec QRSell
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Découvrez comment transformer vos vidéos TikTok en machine à vendre
              </p>
              <Card className="overflow-hidden shadow-xl">
                <div className="aspect-video">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src="https://www.youtube.com/embed/2kcWlO7GfbQ" 
                    title="Guide TikTok - QRSell" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                </div>
              </Card>
              <Link to={createPageUrl('TikTokGuidePublic')} className="inline-block mt-6">
                <Button variant="outline" size="lg" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                  Voir le guide complet
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <PricingPreview />
        <TestimonialSection />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}