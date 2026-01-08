import React from 'react';

export default function Logo({ size = 'md', showText = false, variant = 'light' }) {
  const sizes = {
    sm: '40px',
    md: '52px',
    lg: '68px'
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <img 
        src="https://labrasileira.pro/LOGO.png" 
        alt="Logo"
        style={{ 
          height: sizes[size],
          width: 'auto',
          objectFit: 'contain'
        }}
      />
      {showText && (
        <span style={{ 
          fontSize: size === 'sm' ? '1.25rem' : size === 'md' ? '1.5rem' : '2rem', 
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