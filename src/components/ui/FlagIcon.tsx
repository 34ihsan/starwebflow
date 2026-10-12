'use client';

import React from 'react';

export type FlagCode = 'tr' | 'de' | 'en' | 'gb' | 'eu' | 'DE_TR' | 'DE_DE' | 'TR' | 'EU_EN' | string;

interface FlagIconProps {
  code: FlagCode;
  className?: string;
}

export function TurkeyFlag({ className = 'w-5 h-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 1200 800" className={className} xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <rect width="1200" height="800" fill="#E30A17" />
      <circle cx="420" cy="400" r="200" fill="#FFFFFF" />
      <circle cx="470" cy="400" r="160" fill="#E30A17" />
      <polygon
        points="583.33,400 681.33,431.84 620.76,348.45 620.76,451.55 681.33,368.16"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export function GermanyFlag({ className = 'w-5 h-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 5 3" className={className} xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <rect width="5" height="1" y="0" fill="#000000" />
      <rect width="5" height="1" y="1" fill="#DD0000" />
      <rect width="5" height="1" y="2" fill="#FFCE00" />
    </svg>
  );
}

export function UKFlag({ className = 'w-5 h-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 30" className={className} xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, overflow: 'hidden' }}>
      <rect width="60" height="30" fill="#012169" />
      <path d="M0 0 L60 30 M60 0 L0 30" stroke="#FFFFFF" strokeWidth="6" />
      <path d="M0 0 L60 30 M60 0 L0 30" stroke="#C8102E" strokeWidth="3" />
      <path d="M30 0 V30 M0 15 H60" stroke="#FFFFFF" strokeWidth="10" />
      <path d="M30 0 V30 M0 15 H60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  );
}

export function EUFlag({ className = 'w-5 h-3.5' }: { className?: string }) {
  const angles = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
  return (
    <svg viewBox="0 0 810 540" className={className} xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <rect width="810" height="540" fill="#003399" />
      <g fill="#FFCC00" transform="translate(405,270)">
        {angles.map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const x = Math.round(180 * Math.sin(rad));
          const y = Math.round(-180 * Math.cos(rad));
          return (
            <polygon
              key={deg}
              points="0,-18 5.3,-5.9 17.1,-5.5 7.5,1.5 11.2,12.7 0,5.7 -11.2,12.7 -7.5,1.5 -17.1,-5.5 -5.3,-5.9"
              transform={`translate(${x},${y})`}
            />
          );
        })}
      </g>
    </svg>
  );
}

export default function FlagIcon({ code, className = 'w-4.5 h-3' }: FlagIconProps) {
  const normalized = (code || '').toLowerCase().trim();
  const wrapperClass = `inline-flex items-center justify-center rounded-[2px] overflow-hidden shadow-[0_0_0_1px_rgba(0,0,0,0.12)] shrink-0 leading-none ${className}`;

  if (normalized === 'tr') {
    return (
      <span className={wrapperClass}>
        <TurkeyFlag className="w-full h-full block object-cover" />
      </span>
    );
  }

  if (normalized === 'de' || normalized === 'de_de' || normalized === 'de_tr') {
    return (
      <span className={wrapperClass}>
        <GermanyFlag className="w-full h-full block object-cover" />
      </span>
    );
  }

  if (normalized === 'en' || normalized === 'gb') {
    return (
      <span className={wrapperClass}>
        <UKFlag className="w-full h-full block object-cover" />
      </span>
    );
  }

  if (normalized === 'eu' || normalized === 'eu_en') {
    return (
      <span className={wrapperClass}>
        <EUFlag className="w-full h-full block object-cover" />
      </span>
    );
  }

  return null;
}
