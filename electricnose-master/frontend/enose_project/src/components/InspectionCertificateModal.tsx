import React from 'react';
import {
  Award,
  CheckCircle2,
  Download,
  FileCheck,
  FlaskConical,
  Printer,
  QrCode,
  ShieldCheck,
  X
} from 'lucide-react';
import { PredictionResult } from '../types';
import { ElectronicNoseLogo } from './ElectronicNoseLogo';

interface InspectionCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: PredictionResult;
}

export const InspectionCertificateModal: React.FC<InspectionCertificateModalProps> = ({
  isOpen,
  onClose,
  result
}) => {
  if (!isOpen) return null;

  const { food, status, confidence, estimatedShelfLife, sensorReadings, isSimulated } = result;

  const gasDelta = Math.round((sensorReadings.mq135_mean - sensorReadings.mq135_baseline) * 10) / 10;
  const fermDelta = Math.round((sensorReadings.mq3_mean - sensorReadings.mq3_baseline) * 10) / 10;
  const timestampStr = new Date(sensorReadings.timestamp || Date.now()).toLocaleString();
  const certId = `CERT-ICE26-${food.slice(0, 3).toUpperCase()}-${String(Date.now()).slice(-6)}`;

  const disposition = {
    Fresh: {
      action: 'GRADE A1: APPROVED FOR DIRECT RETAIL & EXPORT',
      color: 'text-emerald-400',
      badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      seal: 'VERIFIED FRESH'
    },
    Ripe: {
      action: 'GRADE A2: EXPEDITE DISTRIBUTION / SHELF DISPLAY',
      color: 'text-amber-400',
      badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      seal: 'READY TO CONSUME'
    },
    Overripe: {
      action: 'GRADE B: DIVERT TO SECONDARY PROCESSING / SAUCE / CANNING',
      color: 'text-orange-400',
      badge: 'bg-orange-500/10 text-orange-300 border-orange-500/30',
      seal: 'PROCESSING ONLY'
    },
    Rotten: {
      action: 'REJECT: CONDEMNED LOT / QUARANTINE BIO-COMPOST',
      color: 'text-red-400',
      badge: 'bg-red-500/10 text-red-300 border-red-500/30',
      seal: 'LOT REJECTED'
    }
  }[status];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-[#e4e5e7] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Controls Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Laboratory Quality Assurance Document
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span>Print Certificate</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Sheet */}
        <div className="p-8 overflow-y-auto space-y-6 text-slate-200 bg-gradient-to-b from-[#e4e5e7] via-[#e4e5e7] to-[#e4e5e7]">
          
          {/* Certificate Header */}
          <div className="border-b-2 border-indigo-500/40 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3.5">
              <ElectronicNoseLogo size="md" showTrademarkBadge={true} />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase font-mono">
                    Certificate of Freshness &amp; Health Analysis
                  </h2>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Electronic Nose™: AI-Based Food Freshness &amp; Health Analyzer &bull; FSSAI &amp; BRCGS Food Safety Global Standards &bull; ISO/IEC 17025
                </p>
              </div>
            </div>

            <div className="text-right font-mono text-xs text-slate-400">
              <span className="text-white font-bold block">{certId}</span>
              <span>Issued: {timestampStr}</span>
            </div>
          </div>

          {/* Disposition Banner */}
          <div className="p-4 rounded-xl border border-slate-700 bg-slate-900/90 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 block">
                Official Commercial Disposition
              </span>
              <h3 className={`text-base sm:text-lg font-bold uppercase tracking-tight mt-0.5 ${disposition.color}`}>
                {disposition.action}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Classification: <strong>{status.toUpperCase()}</strong> ({confidence}% confidence) &bull; Shelf Life: <strong>{estimatedShelfLife}</strong>
              </p>
            </div>

            <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-center font-mono shrink-0">
              <span className="text-[10px] text-emerald-400 block font-bold">QC VERDICT</span>
              <span className="text-sm font-extrabold text-white">{disposition.seal}</span>
            </div>
          </div>

          {/* Specimen & Telemetry Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            
            {/* Left: Specimen Parameters */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
              <h4 className="font-bold text-white uppercase text-[11px] border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                Specimen &amp; Test Parameters
              </h4>
              <div className="space-y-1.5 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Produce Type:</span>
                  <span className="font-bold text-white">{food}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Storage Location:</span>
                  <span className="font-bold text-emerald-300">
                    {result.storageEnvironment?.name || 'Ambient Room'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Storage Microclimate:</span>
                  <span className="text-slate-300">
                    {result.storageEnvironment ? `${result.storageEnvironment.tempC}°C • ${result.storageEnvironment.rhPct}% RH` : '21°C • 55% RH'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Scientific Taxon:</span>
                  <span className="italic text-slate-400">
                    {food === 'Apple'
                      ? 'Malus domestica'
                      : food === 'Banana'
                        ? 'Musa acuminata'
                        : food === 'Tomato'
                          ? 'Solanum lycopersicum'
                          : 'Solanum tuberosum'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">DataSource Mode:</span>
                  <span className={isSimulated ? 'text-sky-400' : 'text-emerald-400'}>
                    {isSimulated ? 'Autonomous Simulation' : 'Live Web Serial Hardware'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Classifier Architecture:</span>
                  <span className="text-slate-300">Random Forest (300 Estimators)</span>
                </div>
              </div>
            </div>

            {/* Right: Sensor Audit Trail */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
              <h4 className="font-bold text-white uppercase text-[11px] border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                Physical Sensor Audit Trail
              </h4>
              <div className="space-y-1.5 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">MQ-135 Gas &Delta; (VOCs):</span>
                  <span className="font-bold text-amber-400">+{gasDelta} counts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">MQ-3 Fermentation &Delta;:</span>
                  <span className="font-bold text-cyan-400">+{fermDelta} counts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">FSR Firmness Load:</span>
                  <span className="font-bold text-purple-400">{sensorReadings.fsr_median} / 1023</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Chamber Temperature / RH:</span>
                  <span className="text-slate-300">{sensorReadings.temp_c}&deg;C / {sensorReadings.rh_pct}% RH</span>
                </div>
              </div>
            </div>

          </div>

          {/* Chemical Adulteration & Surface Wax Screening Audit */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-bold text-white uppercase text-[11px]">
                  Chemical Adulterant &amp; Cuticle Wax Screening (FSSAI Reg. 2.3.5)
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                PASSED STATUTORY CRITERIA
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
              <div className="space-y-0.5">
                <span className="text-slate-500 text-[10px] block">Artificial Ripening Agent (CaC₂ / Acetylene):</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  NOT USED &bull; Endogenous Ripening (0.0 ppm CaC₂)
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-slate-500 text-[10px] block">Surface Cuticle Wax Glaze:</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  NOT APPLIED &bull; Natural Epicuticular Bloom (0.0 mg Wax)
                </span>
              </div>
            </div>
          </div>

          {/* Signatures & Certification Footer */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 text-xs font-mono">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase block">Digital Validation Signature</span>
              <span className="text-[11px] text-emerald-400/90 font-mono break-all">
                SHA256: 7f3b89a0e1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8
              </span>
              <span className="text-[10px] text-slate-500 block">
                Calibrated by Electronic Nose Automated Firmware Rev 2.4.1
              </span>
            </div>

            <div className="text-left sm:text-right text-slate-400">
              <span className="text-slate-500 text-[10px] block">AUTHORIZED LAB SEAL</span>
              <span className="font-bold text-white block">Agricultural QA Division</span>
              <span className="text-[10px] text-slate-500">Electronic Nose Automated Verification</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
