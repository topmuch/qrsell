import React from 'react';

export default function Logo({ size = 'md', showText = true, variant = 'light' }) {
  const sizes = {
    sm: { width: 160, height: 'auto' },
    md: { width: 200, height: 'auto' },
    lg: { width: 280, height: 'auto' }
  };

  const { width } = sizes[size];

  return (
    <div className="flex items-center">
      <img 
        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6951cb5c7a9163102135b23b/2d6c93027_9ae49238-0979-4f3a-941a-e36802732386.png"
        alt="QRSell Logo"
        style={{ width: `${width}px`, height: 'auto' }}
        className="object-contain"
      />
    </div>
  );
}