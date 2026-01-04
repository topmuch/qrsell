import React from 'react';

export default function Logo({ size = 'md', showText = true, variant = 'light' }) {
  const sizes = {
    sm: { width: 160, height: 'auto' },
    md: { width: 200, height: 'auto' },
    lg: { width: 280, height: 'auto' }
  };

  const { width } = sizes[size];
