import React from 'react';
import {
  AlertCircle,
  Check,
  Cpu,
  Flame,
  Gauge,
  HelpCircle,
  Thermometer,
  Timer,
  X
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  chamberTime: number;
  onChamberTimeChange: (val: number) => void;
  baudRate: number;
  onBaudRateChange: (baud: number) => void;
  preferredDemoStage: string;
  onPreferredDemoStageChange: (stage: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  chamberTime,
  onChamberTimeChange,
  baudRate,
  onBaudRateChange,
  preferredDemoStage,
  onPreferredDemoStageChange
}) => {
  const [localChamberTime, setLocalChamberTime] = React.useState(chamberTime);

  React.useEffect(() => {
    setLocalChamberTime(chamberTime);
  }, [chamberTime]);

  if (!isOpen) return null;

  const handleApply = () => {
    const clamped = Math.max(5, Math.min(120, Number(localChamberTime) || 60));
    onChamberTimeChange(clamped);
    onClose();
  };

  const presets = [15, 30, 60, 90];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        id="settings-panel"
        className="w-full max-w-lg bg-[#e4e5e7] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Timer className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Chamber &amp; Hardware Configuration</h2>
              <p className="text-xs text-slate-400">Diagnostic Operating Parameters</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* Chamber Accumulation Time */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="chamber-time-input" className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                <span>Chamber accumulation time (s)</span>
                <span className="text-emerald-400 font-mono text-xs">({localChamberTime}s)</span>
              </label>
              <span className="text-xs text-slate-400 font-mono">Range: 5–120s</span>
            </div>

            <div className="flex items-center gap-3">
              <input
                id="chamber-time-input"
                type="number"
                min={5}
                max={120}
                value={localChamberTime}
                onChange={(e) => setLocalChamberTime(Number(e.target.value))}
                className="w-24 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-center text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="range"
                min={5}
                max={120}
                value={localChamberTime}
                onChange={(e) => setLocalChamberTime(Number(e.target.value))}
                className="flex-1 accent-emerald-500 h-2 bg-slate-900 rounded-lg cursor-pointer"
              />
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-slate-400">Presets:</span>
              {presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setLocalChamberTime(preset)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-mono transition-all ${
                    localChamberTime === preset
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {preset}s {preset === 60 ? '(Default)' : preset === 15 ? '(Quick)' : ''}
                </button>
              ))}
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Defines the duration the sealed sample chamber allows volatile organic compounds (VOCs) to concentrate before ADC sampling commences.
            </p>
          </div>

          {/* Exhibition Demo Override Stage */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-200">
                Demo Target Stage (For Exhibition Judges)
              </label>
              <span className="text-[11px] text-slate-400">Interactive Demo control</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { id: 'random', label: 'Random' },
                { id: 'Fresh', label: 'Fresh' },
                { id: 'Ripe', label: 'Ripe' },
                { id: 'Overripe', label: 'Overripe' },
                { id: 'Rotten', label: 'Rotten' }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onPreferredDemoStageChange(item.id)}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    preferredDemoStage === item.id
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">
              Allows selecting a specific stage scenario on demand to showcase model classification behaviors to judges.
            </p>
          </div>

          {/* Hardware Serial Settings */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-slate-400" />
              <span>Serial Baud Rate (Web Serial API)</span>
            </label>
            <div className="flex gap-2">
              {[9600, 115200].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => onBaudRateChange(rate)}
                  className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all ${
                    baudRate === rate
                      ? 'bg-slate-700 text-white font-bold border border-slate-500'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {rate} baud {rate === 9600 ? '(Arduino Standard)' : '(High Speed)'}
                </button>
              ))}
            </div>
          </div>

          {/* Hardware Sensor Specifications Reference */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-300 font-semibold">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <span>Sensors Array Pinout (Diagnostic Enclosure)</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-400 font-mono text-[11px]">
              <div className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>MQ-135 (Air Quality): <strong>Pin A0</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                <span>MQ-3 (Ethanol): <strong>Pin A1</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-purple-400" />
                <span>FSR 402 (Firmness): <strong>Pin A2</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-red-400" />
                <span>DHT11 (Temp/RH): <strong>Pin D2</strong></span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/60">
          <div className="text-xs text-slate-500">
            Changes apply to current session
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-emerald-950 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Save &amp; Apply</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
