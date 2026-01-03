import React from 'react';

export default function Logo({ size = 'md', showText = true, variant = 'light' }) {
  const sizes = {
    sm: { width: 120, height: 'auto' },
    md: { width: 150, height: 'auto' },
    lg: { width: 200, height: 'auto' }
  };

  const { width } = sizes[size];

  return (
    <div className="flex items-center">
      <img 
        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6951cb5c7a9163102135b23b/2c7d2591f_18583244-eea7-4abd-9a28-79ea4649c3c6.png"
        alt="QRSell Logo"
        style={{ width: `${width}px`, height: 'auto' }}
        className="object-contain"
      />
    </div>
  );
}