import React from 'react';

export default function Logo({ size = 'md', showText = false, variant = 'light' }) {
  const sizes = {
    sm: { width: 160, height: 'auto' },
    md: { width: 200, height: 'auto' },
    lg: { width: 280, height: 'auto' }
  };

  const { width } = sizes[size];

  // URL du logo QRSell officiel
  const logoSrc = 'https://drive.google.com/uc?export=view&id=1eveFkGHiW-tM5vck1UDR00SaO42huoKU';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <img 
        src={logoSrc} 
        alt="QRSell Logo" 
        width={width} 
        height="auto"
        style={{ display: 'block' }}
      />
      {showText && (
        <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
          QRsell
        </span>
      )}
    </div>
  );
}