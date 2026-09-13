import React from 'react';
import { Wind, Atom, Sparkles } from 'lucide-react';

interface ElectronicNoseLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTrademarkBadge?: boolean;
  className?: string;
}

export const ElectronicNoseLogo: React.FC<ElectronicNoseLogoProps> = ({
  size = 'md',
  showTrademarkBadge = true,
  className = '',
}) => {
  const dimensions = {
    sm: {
      box: 'w-9 h-9',
      radius: 'rounded-xl',
      windSize: 'w-4 h-4',
      atomSize: 'w-3 h-3',
      sparkleSize: 'w-2.5 h-2.5',
      tmText: 'text-[8px]',
      dot: 'w-1 h-1',
    },
    md: {
      box: 'w-11 h-11',
      radius: 'rounded-2xl',
      windSize: 'w-5 h-5',
      atomSize: 'w-3.5 h-3.5',
      sparkleSize: 'w-3 h-3',
      tmText: 'text-[9px]',
      dot: 'w-1.5 h-1.5',
    },
    lg: {
      box: 'w-14 h-14',
      radius: 'rounded-2xl',
      windSize: 'w-7 h-7',
      atomSize: 'w-4 h-4',
      sparkleSize: 'w-3.5 h-3.5',
      tmText: 'text-[10px]',
      dot: 'w-2 h-2',
    },
  }[size];

  return (
    <div
      id="electronic-nose-trademark-logo"
      className={`relative inline-flex items-center justify-center shrink-0 group select-none ${className}`}
      title="Electronic Nose™ — AI Chemical Volatile & Food Freshness Olfactory Sensor"
    >
      {/* Outer ambient olfactory sensor glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-emerald-500/25 via-green-500/20 to-amber-500/25 blur-md opacity-80 group-hover:opacity-100 group-hover:blur-lg transition-all duration-500" />

      {/* Main Trademark Emblem Container */}
      <div
        className={`relative ${dimensions.box} ${dimensions.radius} bg-[#e4e5e7] border border-emerald-400/50 p-1.5 flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(67, 103, 144,0.3),inset_0_1px_1px_rgba(20, 20, 21,0.2)] transition-transform duration-300 group-hover:scale-105 group-hover:border-emerald-300`}
      >
        {/* Subtle grid mesh background */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:6px_6px]" />

        {/* Diagonal specular sheen */}
        <div className="absolute -top-6 -left-6 w-12 h-16 bg-gradient-to-r from-transparent via-slate-900/40 to-transparent rotate-45 pointer-events-none group-hover:translate-x-12 transition-transform duration-700" />

        {/* Dynamic Dual-Layer Olfaction & AI Symbolism */}
        <div className="relative flex items-center justify-center">
          {/* Primary Scent / Gas Vapor Flow (Olfactory Sensor Intake) */}
          <Wind
            className={`${dimensions.windSize} text-emerald-300 drop-shadow-[0_0_6px_rgba(105, 136, 171,0.7)] transition-transform duration-300 group-hover:translate-x-0.5`}
          />

          {/* Core Molecular / Volatile Organic Compound Detection Center */}
          <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-[#ebeced]/90 border border-emerald-400/60 shadow-[0_0_8px_rgba(105, 136, 171,0.5)]">
            <Atom className={`${dimensions.atomSize} text-emerald-300 animate-[spin_12s_linear_infinite]`} />
          </div>

          {/* AI Neural Intelligence Sparkle Node */}
          <div className="absolute -top-1.5 -left-1">
            <Sparkles className={`${dimensions.sparkleSize} text-amber-300 animate-pulse drop-shadow-[0_0_4px_rgba(193, 162, 63,0.8)]`} />
          </div>
        </div>

        {/* Bottom Sensor Health Triple-LED Array */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1 opacity-75">
          <span className={`${dimensions.dot} rounded-full bg-emerald-400 shadow-[0_0_4px_#6988ab]`} />
          <span className={`${dimensions.dot} rounded-full bg-amber-400 shadow-[0_0_4px_#a98937] animate-pulse`} />
          <span className={`${dimensions.dot} rounded-full bg-lime-400 shadow-[0_0_4px_#4c719b]`} />
        </div>
      </div>

      {/* Trademark Pill Tag (TM) */}
      {showTrademarkBadge && (
        <span
          className={`absolute -top-1.5 -right-2 px-1 py-0.2 rounded-md bg-gradient-to-r from-emerald-950/90 to-amber-950/90 border border-emerald-400/60 text-emerald-300 font-mono font-black ${dimensions.tmText} tracking-tighter shadow-[0_0_8px_rgba(67, 103, 144,0.4)] backdrop-blur-sm`}
        >
          TM
        </span>
      )}
    </div>
  );
};
