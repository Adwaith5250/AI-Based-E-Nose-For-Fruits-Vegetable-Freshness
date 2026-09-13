import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Send, Trash2, X, Download, Check, AlertCircle, Copy } from 'lucide-react';

interface SerialTerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
  portName: string | null;
  baudRate: number;
}

interface TerminalLog {
  id: string;
  time: string;
  type: 'tx' | 'rx' | 'sys';
  data: string;
}

export const SerialTerminalModal: React.FC<SerialTerminalModalProps> = ({
  isOpen,
  onClose,
  portName,
  baudRate
}) => {
  const [logs, setLogs] = useState<TerminalLog[]>([
    { id: '1', time: '10:00:01.120', type: 'sys', data: `UART Subsystem Initialized. Baud: ${baudRate} 8-N-1` },
    { id: '2', time: '10:00:01.250', type: 'sys', data: `Web Serial API Driver Ready. Ready for device connection.` }
  ]);
  const [inputCmd, setInputCmd] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  // Add system message if portName changes
  useEffect(() => {
    if (portName) {
      setLogs((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          time: new Date().toLocaleTimeString() + '.' + String(Date.now()).slice(-3),
          type: 'sys',
          data: `Port Opened: ${portName} at ${baudRate} bps. DTR/RTS High.`
        }
      ]);
    }
  }, [portName, baudRate]);

  if (!isOpen) return null;

  const handleSendCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCmd.trim()) return;

    const cmd = inputCmd.trim();
    const timestamp = new Date().toLocaleTimeString() + '.' + String(Date.now()).slice(-3);

    // Append TX command
    setLogs((prev) => [
      ...prev,
      { id: String(Date.now()), time: timestamp, type: 'tx', data: cmd }
    ]);
    setInputCmd('');

    // Emulate realistic microcontroller response
    setTimeout(() => {
      let response = 'OK';
      if (cmd.toUpperCase().includes('PING')) {
        response = 'PONG: ARDUINO_E_NOSE_REV3_READY';
      } else if (cmd.toUpperCase().includes('BASELINE')) {
        response = `{"type":"baseline","mq135":138,"mq3":82,"temp":22.4,"rh":53.5,"status":"LOCKED"}`;
      } else if (cmd.toUpperCase().includes('SCAN')) {
        response = `{"type":"telemetry","mq135":195,"mq3":114,"fsr":640,"temp":22.6,"rh":54.1,"crc":3491}`;
      } else if (cmd.toUpperCase().includes('HEATER')) {
        response = `{"heater_c":380.2,"duty_cycle":85,"vcc":5.02}`;
      }

      setLogs((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          time: new Date().toLocaleTimeString() + '.' + String(Date.now() + 1).slice(-3),
          type: 'rx',
          data: response
        }
      ]);
    }, 180);
  };

  const handleClear = () => {
    setLogs([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-[#e4e5e7] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[80vh]">
        
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#e4e5e7]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Serial Bus Monitor
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  {baudRate} Baud 8-N-1
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                {portName || 'Port Disconnected (Loopback Console)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClear}
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs flex items-center gap-1"
              title="Clear terminal buffer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Terminal Log Console */}
        <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-1 bg-[#e9eaeb] select-text">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2 leading-relaxed">
              <span className="text-slate-600 text-[10px] shrink-0">{log.time}</span>
              {log.type === 'tx' && (
                <span className="text-amber-400 font-bold shrink-0">&rarr; TX:</span>
              )}
              {log.type === 'rx' && (
                <span className="text-emerald-400 font-bold shrink-0">&larr; RX:</span>
              )}
              {log.type === 'sys' && (
                <span className="text-sky-400 font-bold shrink-0">&bull; SYS:</span>
              )}
              <span
                className={`break-all ${
                  log.type === 'tx'
                    ? 'text-amber-200'
                    : log.type === 'rx'
                    ? 'text-emerald-200'
                    : 'text-sky-300/80'
                }`}
              >
                {log.data}
              </span>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Quick Command Chips */}
        <div className="px-4 py-2 border-t border-slate-800 bg-[#e4e5e7] flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="text-slate-500 font-mono text-[10px]">Macro Commands:</span>
          {['CMD:PING', 'CMD:BASELINE', 'CMD:SCAN:APPLE', 'CMD:HEATER:STATUS'].map((macro) => (
            <button
              key={macro}
              type="button"
              onClick={() => setInputCmd(macro)}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[10px] border border-slate-700 transition-colors"
            >
              {macro}
            </button>
          ))}
        </div>

        {/* Terminal Command Input Form */}
        <form
          onSubmit={handleSendCommand}
          className="p-3 border-t border-slate-800 bg-[#e4e5e7] flex items-center gap-2"
        >
          <input
            type="text"
            value={inputCmd}
            onChange={(e) => setInputCmd(e.target.value)}
            placeholder="Enter command (e.g. CMD:BASELINE, CMD:SCAN, CMD:PING)..."
            className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-md"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>

      </div>
    </div>
  );
};
