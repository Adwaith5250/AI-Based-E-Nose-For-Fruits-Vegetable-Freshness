import React from 'react';

interface DiscoPulseBadgeProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animate?: boolean;
  glow?: boolean;
}

/**
 * DiscoPulseBadge — High-fidelity vector recreation of the user's uploaded
 * cyber-medical telemetry badge:
 * - Rounded squircle container with deep cosmic indigo interior
 * - Electric neon cyan luminous perimeter
 * - Centered glowing cyan heartbeat / sensor pulse waveform
 * - Top-right disco LED orb with cyan-to-pink gradient beacon
 */
export const DiscoPulseBadge: React.FC<DiscoPulseBadgeProps> = ({
  size = 'md',
  className = '',
  animate = true,
  glow = true
}) => {
  // Dimensions mapping
  const sizeMap = {
    xs: { outer: 'w-7 h-7', svgSize: 28, orbSize: 'w-2.5 h-2.5 -top-1 -right-1', stroke: 2 },
    sm: { outer: 'w-9 h-9', svgSize: 36, orbSize: 'w-3 h-3 -top-1 -right-1', stroke: 2.2 },
    md: { outer: 'w-11 h-11', svgSize: 44, orbSize: 'w-3.5 h-3.5 -top-1.5 -right-1.5', stroke: 2.5 },
    lg: { outer: 'w-14 h-14', svgSize: 56, orbSize: 'w-4.5 h-4.5 -top-2 -right-2', stroke: 2.8 },
    xl: { outer: 'w-20 h-20', svgSize: 80, orbSize: 'w-6 h-6 -top-2.5 -right-2.5', stroke: 3.2 }
  };

  const config = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${config.outer} ${className}`}
      title="AI Electronic Nose Telemetry Pulse Monitor"
    >
      {/* SVG Container with exact squircle and neon cyan outline */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Cyber Cyan glow filter */}
          <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Deep Navy/Indigo inner gradient */}
          <linearGradient id="badgeBodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e4e5e7" />
            <stop offset="50%" stopColor="#e4e5e7" />
            <stop offset="100%" stopColor="#e4e5e7" />
          </linearGradient>

          {/* Glowing neon cyan stroke gradient */}
          <linearGradient id="cyanStroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7e8792" />
            <stop offset="60%" stopColor="#737f8c" />
            <stop offset="100%" stopColor="#6c7682" />
          </linearGradient>

          {/* Wave line glow */}
          <filter id="waveGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Rounded Container (Squircle) */}
        <rect
          x="6"
          y="6"
          width="88"
          height="88"
          rx="26"
          ry="26"
          fill="url(#badgeBodyGradient)"
          stroke="url(#cyanStroke)"
          strokeWidth="4"
          filter={glow ? 'url(#cyanGlow)' : undefined}
        />

        {/* Inner subtle bevel */}
        <rect
          x="8"
          y="8"
          width="84"
          height="84"
          rx="24"
          ry="24"
          fill="none"
          stroke="rgba(115, 127, 140, 0.15)"
          strokeWidth="1.5"
        />

        {/* Pulse / Heartbeat Waveform Line - Exact matching curve */}
        <path
          d="M 22 51 L 35 51 L 42 33 L 52 69 L 60 41 L 66 51 L 78 51"
          fill="none"
          stroke="#737f8c"
          strokeWidth={config.stroke * 2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#waveGlow)"
          className={animate ? 'transition-all duration-300' : ''}
        />
      </svg>

      {/* Top-Right Glowing Disco LED Orb (Cyan-to-Hot-Pink Gradient) */}
      <span
        className={`absolute ${config.orbSize} rounded-full z-10 pointer-events-none flex items-center justify-center`}
        style={{
          background: 'linear-gradient(135deg, #737f8c 0%, #6f7782 100%)',
          boxShadow: '0 0 10px rgba(111, 119, 130, 0.85), 0 0 4px rgba(115, 127, 140, 0.9)'
        }}
      >
        {animate && (
          <span
            className="absolute inset-0 rounded-full animate-ping opacity-60 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, #737f8c 0%, #6f7782 100%)'
            }}
          />
        )}
      </span>
    </div>
  );
};
