import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ProductFilters({ activeFilter, onFilterChange, counts }) {
  const filters = [
    { id: 'all', label: 'Tous les produits', count: counts.all },
    { id: 'new', label: '💎 Nouveautés', count: counts.new },
    { id: 'hot', label: '🔥 En demande', count: counts.hot },
    { id: 'promo', label: '🎉 Promos', count: counts.promo }
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {filters.map((filter) => (
        <Button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          variant={activeFilter === filter.id ? 'default' : 'outline'}
          className={`rounded-full ${
            activeFilter === filter.id
              ? 'bg-[#ed477c] hover:bg-[#d43a6b] text-white'
              : 'hover:border-[#ed477c] hover:text-[#ed477c]'
          }`}
        >
          {filter.label}
          {filter.count > 0 && (
            <Badge 
              variant="secondary" 
              className="ml-2 bg-white/20 text-white"
            >
              {filter.count}
            </Badge>
          )}
        </Button>
      ))}
    </div>
  );
}