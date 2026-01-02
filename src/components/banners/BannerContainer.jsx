import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import BannerDisplay from "./BannerDisplay";

export default function BannerContainer({ position, userPlan = "all" }) {
  const [visibleBanner, setVisibleBanner] = useState(null);

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ['banners', position],
    queryFn: async () => {
      const allBanners = await base44.entities.Banner.list();
      return allBanners;
    }
  });

  useEffect(() => {
    if (banners.length === 0) return;

    const now = new Date();

    // Filtrer les bannières actives, pour la position actuelle et la cible
    const activeBanners = banners.filter(banner => {
      // Vérifier si active
      if (!banner.is_active) return false;

      // Vérifier la position
      if (banner.position !== position) return false;

      // Vérifier les dates
      if (banner.start_date && new Date(banner.start_date) > now) return false;
      if (banner.end_date && new Date(banner.end_date) < now) return false;

      // Vérifier la cible
      if (banner.target !== "all" && banner.target !== userPlan) return false;

      // Vérifier si l'utilisateur l'a fermée
      const isClosed = localStorage.getItem(`banner_closed_${banner.id}`);
      if (isClosed === "true") return false;

      return true;
    });

    // Prendre la plus récente (par date de création)
    if (activeBanners.length > 0) {
      const mostRecent = activeBanners.sort((a, b) => 
        new Date(b.created_date) - new Date(a.created_date)
      )[0];
      setVisibleBanner(mostRecent);
    } else {
      setVisibleBanner(null);
    }
  }, [banners, position, userPlan]);

  if (isLoading || !visibleBanner) return null;

  return (
    <BannerDisplay 
      banner={visibleBanner} 
      onClose={() => setVisibleBanner(null)}
    />
  );
}