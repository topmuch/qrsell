import React from 'react';

export default function Logo({ size = 'md', showText = true, variant = 'light' }) {
  const sizes = {
    sm: '32px',
    md: '40px',
    lg: '56px'
  };

  const fontSize = {
    sm: '1.25rem',
    md: '1.5rem',
    lg: '2rem'
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <svg 
        width={sizes[size]} 
        height={sizes[size]} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="qrsell-logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6C4AB6" />
            <stop offset="50%" stopColor="#FF6B9D" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" rx="20" fill="url(#qrsell-logo-gradient)"/>
        <g opacity="0.95">
          <rect x="20" y="20" width="15" height="15" rx="2" fill="white"/>
          <rect x="65" y="20" width="15" height="15" rx="2" fill="white"/>
          <rect x="20" y="65" width="15" height="15" rx="2" fill="white"/>
          <circle cx="50" cy="50" r="12" fill="white"/>
          <rect x="42" y="20" width="8" height="8" rx="1" fill="white"/>
          <rect x="56" y="20" width="8" height="8" rx="1" fill="white"/>
          <rect x="42" y="72" width="8" height="8" rx="1" fill="white"/>
          <rect x="72" y="42" width="8" height="8" rx="1" fill="white"/>
          <rect x="72" y="56" width="8" height="8" rx="1" fill="white"/>
        </g>
      </svg>
      {showText && (
        <span style={{ 
          fontSize: fontSize[size], 
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #6C4AB6 0%, #FF6B9D 50%, #10B981 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          QRSell
        </span>
      )}
    </div>
  );
}