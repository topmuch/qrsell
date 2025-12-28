import React from 'react';

export default function Logo({ size = 'md', showText = true, variant = 'light' }) {
  const sizes = {
    sm: { icon: 32, text: 'text-lg' },
    md: { icon: 40, text: 'text-xl' },
    lg: { icon: 56, text: 'text-3xl' }
  };

  const { icon, text } = sizes[size];
  const isDark = variant === 'dark';

  return (
    <div className="flex items-center gap-3">
      <div 
        className={`rounded-xl ${isDark ? 'bg-white' : 'bg-[#2563eb]'} flex items-center justify-center p-1.5 relative`}
        style={{ width: icon, height: icon }}
      >
        {/* Simplified QR code pattern */}
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          className={isDark ? 'text-[#2563eb]' : 'text-white'}
          style={{ width: icon * 0.7, height: icon * 0.7 }}
        >
          {/* Corner markers */}
          <rect x="2" y="2" width="7" height="7" fill="currentColor" rx="1"/>
          <rect x="15" y="2" width="7" height="7" fill="currentColor" rx="1"/>
          <rect x="2" y="15" width="7" height="7" fill="currentColor" rx="1"/>
          
          {/* Center pattern with checkmark */}
          <rect x="11" y="11" width="9" height="9" fill="currentColor" rx="1"/>
          <path 
            d="M13 16.5L15 18.5L19 14" 
            stroke="white" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            fill="none"
          />
          
          {/* Scattered dots for QR aesthetic */}
          <rect x="11" y="2" width="2" height="2" fill="currentColor"/>
          <rect x="2" y="11" width="2" height="2" fill="currentColor"/>
          <rect x="6" y="11" width="2" height="2" fill="currentColor"/>
          <rect x="15" y="11" width="2" height="2" fill="currentColor"/>
          <rect x="11" y="6" width="2" height="2" fill="currentColor"/>
        </svg>
      </div>
      {showText && (
        <span className={`font-bold ${text} ${isDark ? 'text-white' : 'text-[#111827]'}`} style={{ letterSpacing: '0.02em' }}>
          <span className="font-extrabold">QR</span>
          <span className="font-medium">Sell</span>
        </span>
      )}
    </div>
  );
}