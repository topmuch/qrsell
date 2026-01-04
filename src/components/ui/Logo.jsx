import React from 'react';

export default function Logo({ size = 'md', showText = true, variant = 'light' }) {
  const sizes = {
    sm: { width: 160, height: 'auto' },
    md: { width: 200, height: 'auto' },
    lg: { width: 280, height: 'auto' }
  };

  const { width } = sizes[size];

  // Ajuste le chemin selon où tu stockes ton logo
  const logoSrc = variant === 'light' 
    ? '/logo-light.png' 
    : '/logo-dark.png';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <img 
        src={logoSrc} 
        alt="Logo" 
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
