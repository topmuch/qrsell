import React from 'react';

export default function Logo({ size = 'md', showText = true }) {
  const sizes = {
    sm: { icon: 24, text: 'text-lg' },
    md: { icon: 32, text: 'text-xl' },
    lg: { icon: 48, text: 'text-3xl' }
  };

  const { icon, text } = sizes[size];

  return (
    <div className="flex items-center gap-2">
      <div 
        className="rounded-xl bg-gradient-to-br from-[#ed477c] to-[#ff6b9d] flex items-center justify-center"
        style={{ width: icon, height: icon }}
      >
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          className="text-white"
          style={{ width: icon * 0.6, height: icon * 0.6 }}
        >
          <path 
            d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7M3 7L12 13L21 7M3 7H21" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <rect x="7" y="3" width="10" height="10" rx="2" fill="currentColor" opacity="0.3"/>
        </svg>
      </div>
      {showText && (
        <span className={`font-bold ${text} bg-gradient-to-r from-[#ed477c] to-[#ff6b9d] bg-clip-text text-transparent`}>
          TiktocQR
        </span>
      )}
    </div>
  );
}