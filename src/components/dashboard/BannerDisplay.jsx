import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BannerDisplay({ position = 'dashboard' }) {
  const [dismissed, setDismissed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: banners = [] } = useQuery({
    queryKey: ['active-banners', position],
    queryFn: async () => {
      const allBanners = await base44.entities.Banner.list();
      const now = new Date();
      
      return allBanners.filter(banner => 
        banner.is_active &&
        banner.position === position &&
        new Date(banner.start_date) <= now &&
        new Date(banner.end_date) >= now
      );
    },
    refetchInterval: 60000
  });

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [banners.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  if (banners.length === 0 || dismissed) {
    return null;
  }

  const activeBanner = banners[currentIndex];

  return (
    <div className="relative mb-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeBanner.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          <div className="bg-gradient-to-r from-[#2563eb] to-[#3b82f6] rounded-xl overflow-hidden shadow-lg">
            <div className="flex items-center justify-between p-6 md:p-8">
              <div className="flex-1">
                {activeBanner.image_url && (
                  <div className="mb-4">
                    <img 
                      src={activeBanner.image_url} 
                      alt={activeBanner.text}
                      className="max-h-40 md:max-h-48 w-auto rounded-lg object-contain"
                    />
                  </div>
                )}
                <p className="text-white font-semibold text-lg md:text-xl mb-4">{activeBanner.text}</p>
                {activeBanner.link && (
                  <a
                    href={activeBanner.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white text-[#2563eb] px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors text-base"
                  >
                    En savoir plus
                    <span>→</span>
                  </a>
                )}
              </div>
              <button
                onClick={() => setDismissed(true)}
                className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors ml-4"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation arrows - only show if multiple banners */}
      {banners.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg z-10 transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-14 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg z-10 transition-all"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>

          {/* Dots indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentIndex ? 'bg-white w-6' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}