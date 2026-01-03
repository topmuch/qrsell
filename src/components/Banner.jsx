import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Banner({ position }) {
  const [dismissed, setDismissed] = React.useState(false);

  const { data: banner, isLoading } = useQuery({
    queryKey: ['banner', position],
    queryFn: async () => {
      const now = new Date();
      const banners = await base44.entities.Banner.filter({
        position: position,
        is_active: true
      });

      // Filter by date range on client side
      const activeBanner = banners.find(b => {
        const startDate = new Date(b.start_date);
        const endDate = new Date(b.end_date);
        return startDate <= now && endDate >= now;
      });

      return activeBanner || null;
    },
    staleTime: 60000, // Cache for 1 minute
    refetchInterval: 60000 // Refetch every minute
  });

  if (isLoading || !banner || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="relative mb-6"
      >
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all"
          aria-label="Fermer"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>

        {banner.link ? (
          <a
            href={banner.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow"
          >
            {banner.image_url ? (
              <img
                src={banner.image_url}
                alt={banner.text || 'Bannière'}
                className="w-full h-auto object-cover"
              />
            ) : (
              <div className="bg-gradient-to-r from-[#2563eb] to-[#3b82f6] p-8 text-white text-center">
                <p className="text-xl font-bold">{banner.text}</p>
              </div>
            )}
          </a>
        ) : (
          <div className="overflow-hidden rounded-xl shadow-lg">
            {banner.image_url ? (
              <img
                src={banner.image_url}
                alt={banner.text || 'Bannière'}
                className="w-full h-auto object-cover"
              />
            ) : (
              <div className="bg-gradient-to-r from-[#2563eb] to-[#3b82f6] p-8 text-white text-center">
                <p className="text-xl font-bold">{banner.text}</p>
              </div>
            )}
          </div>
        )}

        {banner.text && banner.image_url && (
          <p className="text-sm text-gray-600 mt-2 text-center">{banner.text}</p>
        )}
      </motion.div>
    </AnimatePresence>
  );
}