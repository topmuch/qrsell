import React from 'react';

export default function Logo({ size = 'md', showText = true, variant = 'light' }) {
  const sizes = {
    sm: { height: 32 },
    md: { height: 40 },
    lg: { height: 56 }
  };

  const { height } = sizes[size];

  return (
    <div className="flex items-center gap-2">
      <img 
        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6951cb5c7a9163102135b23b/2c7d2591f_18583244-eea7-4abd-9a28-79ea4649c3c6.png"
        alt="QRSell Logo"
        style={{ height: `${height}px`, width: 'auto' }}
        className="object-contain"
      />
    </div>
  );
}