import React from 'react';
import { Button } from "@/components/ui/button";

const categories = [
  { value: 'all', label: 'Tout', icon: '🛍️' },
  { value: 'Mode', label: 'Mode', icon: '👔' },
  { value: 'Électroménager', label: 'Électroménager', icon: '🔌' },
  { value: 'Beauté', label: 'Beauté', icon: '💄' },
  { value: 'Accessoires', label: 'Accessoires', icon: '👜' },
  { value: 'Alimentation', label: 'Alimentation', icon: '🍎' },
  { value: 'Électronique', label: 'Électronique', icon: '📱' },
  { value: 'Maison', label: 'Maison', icon: '🏠' },
  { value: 'Sport', label: 'Sport', icon: '⚽' },
  { value: 'Autre', label: 'Autre', icon: '📦' }
];

export default function CategoryBar({ selectedCategory, onCategoryChange, availableCategories }) {
  // Filter to show only categories that have products
  const visibleCategories = categories.filter(
    cat => cat.value === 'all' || availableCategories.includes(cat.value)
  );

  if (visibleCategories.length <= 1) return null;

  return (
    <div className="bg-white border-b sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
          {visibleCategories.map((cat) => (
            <Button
              key={cat.value}
              variant={selectedCategory === cat.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => onCategoryChange(cat.value)}
              className={`whitespace-nowrap flex items-center gap-2 ${
                selectedCategory === cat.value
                  ? 'bg-[#2563eb] text-white'
                  : 'hover:bg-gray-50'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}