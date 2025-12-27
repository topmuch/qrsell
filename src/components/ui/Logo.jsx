import React from 'react';

export default function Logo({ size = 'md', showText = true }) {
  const sizes = {
    sm: { icon: 28, text: 'text-lg' },
    md: { icon: 36, text: 'text-xl' },
    lg: { icon: 52, text: 'text-3xl' }
  };

  const { icon, text } = sizes[size];

  return (
    <div className="flex items-center gap-3">
      <div 
        className="rounded-lg bg-white border-2 border-[#ed477c] flex items-center justify-center p-1 relative"
        style={{ width: icon, height: icon }}
      >
        {/* QR code pattern */}
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          className="text-[#ed477c]"
          style={{ width: icon * 0.75, height: icon * 0.75 }}
        >
          {/* QR corners */}
          <rect x="2" y="2" width="6" height="6" fill="currentColor"/>
          <rect x="16" y="2" width="6" height="6" fill="currentColor"/>
          <rect x="2" y="16" width="6" height="6" fill="currentColor"/>
          {/* QR dots pattern */}
          <rect x="10" y="2" width="2" height="2" fill="currentColor"/>
          <rect x="14" y="2" width="2" height="2" fill="currentColor"/>
          <rect x="10" y="6" width="2" height="2" fill="currentColor"/>
          <rect x="14" y="6" width="2" height="2" fill="currentColor"/>
          <rect x="2" y="10" width="2" height="2" fill="currentColor"/>
          <rect x="6" y="10" width="2" height="2" fill="currentColor"/>
          <rect x="10" y="10" width="6" height="6" fill="currentColor"/>
          <rect x="18" y="10" width="2" height="2" fill="currentColor"/>
          <rect x="10" y="18" width="2" height="2" fill="currentColor"/>
          <rect x="14" y="18" width="2" height="2" fill="currentColor"/>
          <rect x="18" y="14" width="2" height="2" fill="currentColor"/>
          <rect x="18" y="18" width="2" height="2" fill="currentColor"/>
        </svg>
        {/* TikTok musical note */}
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-black rounded-full flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="white" className="w-2 h-2">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
          </svg>
        </div>
      </div>
      {showText && (
        <span className={`font-bold ${text} text-[#222222]`}>
          Verdiq <span className="text-[#ed477c]">TikQR</span>
        </span>
      )}
    </div>
  );
}