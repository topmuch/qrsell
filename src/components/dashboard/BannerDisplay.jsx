import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BannerDisplay({ position = 'dashboard' }) {
  const [dismissed, setDismissed] = React.useState(false);

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
    refetchInterval: 60000 // Rafraîchir toutes les minutes
  });

  const activeBanner = banners[0];

  if (!activeBanner || dismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="relative mb-6"
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
  );
}