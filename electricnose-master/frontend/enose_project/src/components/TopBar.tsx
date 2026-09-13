import React from 'react';
import {
  Maximize2,
  Minimize2,
  Radio,
  Settings,
  Sliders,
  Cpu,
  Terminal,
} from 'lucide-react';
import { ConnectionStatus } from '../types';
import { playChirp } from '../services/soundEffects';
import { ElectronicNoseLogo } from './ElectronicNoseLogo';

interface TopBarProps {
  mode: 'demo' | 'live';
  onModeChange: (mode: 'demo' | 'live') => void;
  connectionStatus: ConnectionStatus;
  portName: string | null;
  onOpenSettings: () => void;
  onOpenTerminal: () => void;
  chamberTime: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  mode,
  onModeChange,
  connectionStatus,
  portName,
  onOpenSettings,
  onOpenTerminal,
  chamberTime,
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  React.useEffect(() => {
    const handler = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-emerald-500/25 bg-[#f5f6f6]/95 backdrop-blur-xl px-4 sm:px-6 py-3 transition-all shadow-[0_4px_30px_rgba(252, 252, 253,0.6)]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
        
        {/* Brand & Title */}
        <div className="flex items-center gap-3.5 self-start md:self-auto">
          <ElectronicNoseLogo size="md" showTrademarkBadge={true} />
          <div>
            <h1 className="text-base sm:text-lg lg:text-xl font-extrabold tracking-tight flex items-center flex-wrap gap-x-2 gap-y-1">
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                <span className="green-black-text font-black">Electronic Nose</span>
                <sup className="text-[10px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-black text-emerald-300 border border-emerald-400/50 shadow-[0_0_8px_rgba(83, 118, 159,0.3)]">
                  TM
                </sup>
                <span className="text-slate-500 font-normal">:</span>
              </span>
              <span className="text-white font-bold whitespace-normal sm:whitespace-nowrap">
                AI Food Freshness &amp; Organic Health Analyzer
              </span>
            </h1>

            <p className="text-xs text-slate-400 font-medium flex items-center gap-2 flex-wrap mt-0.5">
              <span className="text-emerald-400 font-semibold">FAO &amp; Codex Alimentarius</span>
              <span className="text-emerald-900">&bull;</span>
              <span className="text-emerald-300 font-mono text-[11px]">USDA &amp; EU Organic Bio-Grading</span>
              <span className="text-emerald-900 hidden lg:inline">&bull;</span>
              <span className="text-slate-300 text-[11px] hidden lg:inline">BRCGS Global &bull; FSSAI Compliant</span>
            </p>
          </div>
        </div>

        {/* Center & Right Controls */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-2.5 w-full md:w-auto justify-between md:justify-end">
          
          {/* Mode Switcher */}
          <div className="flex items-center bg-[#f7f8f8] p-1 rounded-xl border border-emerald-950 shadow-inner">
            <button
              id="mode-demo-btn"
              onClick={() => {
                onModeChange('demo');
                playChirp(600, 0.03);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === 'demo'
                  ? 'green-black-gradient text-white font-bold shadow-[0_0_12px_rgba(83, 118, 159,0.45)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Demo (Simulated)</span>
            </button>
            <button
              id="mode-live-btn"
              onClick={() => {
                onModeChange('live');
                playChirp(750, 0.03);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === 'live'
                  ? 'green-black-gradient text-white font-bold shadow-[0_0_12px_rgba(83, 118, 159,0.45)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Live (Hardware)</span>
            </button>
          </div>

          {/* Connection Status Pill */}
          <div
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              connectionStatus === 'connected'
                ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-[0_0_10px_rgba(83, 118, 159,0.3)]'
                : connectionStatus === 'connecting'
                ? 'bg-lime-500/15 border-lime-500/50 text-lime-300 shadow-[0_0_10px_rgba(77, 116, 160,0.2)]'
                : 'bg-[#f7f8f8] border-emerald-950 text-slate-400'
            }`}
            title={portName || 'No device connected'}
          >
            <span className="relative flex h-2 w-2">
              {connectionStatus === 'connected' && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              {connectionStatus === 'connecting' && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  connectionStatus === 'connected'
                    ? 'bg-emerald-400 shadow-[0_0_8px_#6988ab]'
                    : connectionStatus === 'connecting'
                    ? 'bg-lime-400'
                    : 'bg-slate-600'
                }`}
              ></span>
            </span>
            <span className="font-mono text-[11px] truncate max-w-[120px] sm:max-w-[140px]">
              {connectionStatus === 'connected'
                ? portName ? `${portName.split(' ')[0]}` : 'Connected'
                : connectionStatus === 'connecting'
                ? 'Connecting…'
                : 'Not Connected'}
            </span>
          </div>

          {/* Chamber accumulation preview badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#f7f8f8] border border-emerald-950 text-[11px] text-slate-300 font-mono">
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span>Chamber: <strong className="text-emerald-300">{chamberTime}s</strong></span>
          </div>

          {/* Serial Terminal Button */}
          <button
            id="serial-terminal-btn"
            onClick={onOpenTerminal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#f7f8f8] hover:bg-[#eaebec] border border-emerald-950 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-300 transition-all text-xs font-mono"
            title="Open Serial Packet Monitor & Console"
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Terminal</span>
          </button>

          {/* Settings Button */}
          <button
            id="settings-btn"
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-[#f7f8f8] hover:bg-[#eaebec] border border-emerald-950 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-300 transition-all"
            title="Chamber Settings & Hardware Configuration"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4 text-emerald-400" />
          </button>

          {/* Fullscreen Kiosk Mode Button */}
          <button
            id="fullscreen-toggle-btn"
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-[#f7f8f8] hover:bg-[#eaebec] border border-emerald-950 text-slate-300 hover:text-white transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Kiosk Fullscreen'}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

      </div>
    </header>
  );
};
