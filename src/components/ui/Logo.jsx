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
          <linearGradient id="shopqr-logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6C4AB6" />
            <stop offset="100%" stopColor="#FF6B9D" />
          </linearGradient>
        </defs>
        {/* Q letter stylized with QR code pattern */}
        <circle cx="50" cy="50" r="42" fill="url(#shopqr-logo-gradient)"/>
        <circle cx="50" cy="50" r="28" fill="white"/>
        <circle cx="50" cy="50" r="20" fill="url(#shopqr-logo-gradient)"/>
        
        {/* QR code dots inside Q */}
        <rect x="44" y="44" width="4" height="4" fill="white" rx="1"/>
        <rect x="52" y="44" width="4" height="4" fill="white" rx="1"/>
        <rect x="44" y="52" width="4" height="4" fill="white" rx="1"/>
        <rect x="52" y="52" width="4" height="4" fill="white" rx="1"/>
        
        {/* Q tail */}
        <path d="M 65 65 L 75 75" stroke="url(#shopqr-logo-gradient)" strokeWidth="8" strokeLinecap="round"/>
      </svg>
      {showText && (
        <span style={{ 
          fontSize: fontSize[size], 
          fontWeight: '700',
          fontFamily: 'Inter, -apple-system, sans-serif',
          letterSpacing: '-0.02em',
          background: 'linear-gradient(135deg, #6C4AB6 0%, #FF6B9D 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          ShopQR
        </span>
      )}
    </div>
  );
}