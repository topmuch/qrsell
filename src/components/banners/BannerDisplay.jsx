import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import BannerItem from "./BannerItem";

export default function BannerDisplay({ position, userType = "all" }) {
    const [closedBanners, setClosedBanners] = useState(() => {
        const stored = localStorage.getItem('closedBanners');
        return stored ? JSON.parse(stored) : [];
    });

    const { data: banners = [] } = useQuery({
        queryKey: ['banners', position],
        queryFn: async () => {
            const allBanners = await base44.entities.Banner.list();
            return allBanners.filter(banner => banner.position === position);
        },
        refetchInterval: 60000, // Rafraîchir toutes les minutes
    });

    const handleCloseBanner = (bannerId) => {
        const newClosedBanners = [...closedBanners, bannerId];
        setClosedBanners(newClosedBanners);
        localStorage.setItem('closedBanners', JSON.stringify(newClosedBanners));
    };

    const getActiveBanner = () => {
        const now = new Date();
        
        const validBanners = banners.filter(banner => {
            // Vérifier si fermée
            if (closedBanners.includes(banner.id)) return false;
            
            // Vérifier si active
            if (!banner.is_active) return false;
            
            // Vérifier les dates
            const startDate = new Date(banner.start_date);
            const endDate = new Date(banner.end_date);
            if (now < startDate || now > endDate) return false;
            
            // Vérifier la cible
            if (banner.target !== 'all' && banner.target !== userType) return false;
            
            return true;
        });

        // Retourner la plus récente
        if (validBanners.length === 0) return null;
        
        return validBanners.sort((a, b) => 
            new Date(b.created_date) - new Date(a.created_date)
        )[0];
    };

    const activeBanner = getActiveBanner();

    if (!activeBanner) return null;

    return (
        <div className="w-full mb-4">
            <BannerItem 
                banner={activeBanner} 
                onClose={handleCloseBanner}
            />
        </div>
    );
}