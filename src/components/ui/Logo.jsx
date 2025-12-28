import React from 'react';

export default function Logo({ size = 'md', showText = true }) {
  const sizes = {
    sm: { icon: 32, text: 'text-lg' },
    md: { icon: 40, text: 'text-xl' },
    lg: { icon: 56, text: 'text-3xl' }
  };

  const { icon, text } = sizes[size];

  return (
    <div className="flex items-center gap-3">
      <div 
        className="rounded-lg bg-[#2563eb] flex items-center justify-center p-2 relative"
        style={{ width: icon, height: icon }}
      >
        {/* Stylized QR code pattern */}
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          className="text-white"
          style={{ width: icon * 0.75, height: icon * 0.75 }}
        >
          {/* QR corners - simplified */}
          <rect x="2" y="2" width="6" height="6" fill="currentColor" rx="1"/>
          <rect x="16" y="2" width="6" height="6" fill="currentColor" rx="1"/>
          <rect x="2" y="16" width="6" height="6" fill="currentColor" rx="1"/>
          
          {/* QR pattern dots */}
          <rect x="10" y="2" width="2" height="2" fill="currentColor" rx="0.5"/>
          <rect x="14" y="2" width="2" height="2" fill="currentColor" rx="0.5"/>
          <rect x="10" y="6" width="2" height="2" fill="currentColor" rx="0.5"/>
          <rect x="14" y="6" width="2" height="2" fill="currentColor" rx="0.5"/>
          
          <rect x="2" y="10" width="2" height="2" fill="currentColor" rx="0.5"/>
          <rect x="6" y="10" width="2" height="2" fill="currentColor" rx="0.5"/>
          
          {/* Center checkmark/arrow (symbolizes sale/validation) */}
          <path 
            d="M10 10 L12 14 L18 8" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            fill="none"
          />
          
          <rect x="18" y="10" width="2" height="2" fill="currentColor" rx="0.5"/>
          <rect x="10" y="18" width="2" height="2" fill="currentColor" rx="0.5"/>
          <rect x="14" y="18" width="2" height="2" fill="currentColor" rx="0.5"/>
          <rect x="18" y="14" width="2" height="2" fill="currentColor" rx="0.5"/>
          <rect x="18" y="18" width="2" height="2" fill="currentColor" rx="0.5"/>
        </svg>
      </div>
      {showText && (
        <span className={`font-bold ${text} tracking-wide`}>
          <span className="text-[#2563eb]">QR</span>
          <span className="text-[#111827]">Sell</span>
        </span>
      )}
    </div>
  );
}