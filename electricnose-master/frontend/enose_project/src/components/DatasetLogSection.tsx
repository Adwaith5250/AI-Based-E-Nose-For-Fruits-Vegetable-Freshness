import React, { useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Database,
  Download,
  FileSpreadsheet,
  Layers,
  ListFilter,
  Loader2,
  Plus,
  Send,
  Tag
} from 'lucide-react';
import { FreshnessStage, PredictionResult, ScanLogEntry } from '../types';
import { getStoredLogs, logScan } from '../services/apiIntegration';

interface DatasetLogSectionProps {
  currentResult: PredictionResult;
  onLoggedSuccess: (entry: ScanLogEntry) => void;
}

const STAGES: FreshnessStage[] = ['Fresh', 'Ripe', 'Overripe', 'Rotten'];

export const DatasetLogSection: React.FC<DatasetLogSectionProps> = ({
  currentResult,
  onLoggedSuccess
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [foodId, setFoodId] = useState(`${currentResult.food.toUpperCase()}_01`);
  const [trueStage, setTrueStage] = useState<FreshnessStage>(currentResult.status);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentLogs, setRecentLogs] = useState<ScanLogEntry[]>(() => getStoredLogs());
  const [showLogsTable, setShowLogsTable] = useState(false);

  // When food changes in report, update foodId placeholder
  React.useEffect(() => {
    setFoodId(`${currentResult.food.toUpperCase()}_${String(recentLogs.length + 1).padStart(2, '0')}`);
    setTrueStage(currentResult.status);
  }, [currentResult, recentLogs.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodId.trim() || isSubmitting) return;

    setIsSubmitting(true);

    const newEntry: ScanLogEntry = {
      id: `scan_${Date.now()}`,
      readingId: currentResult.readingId,
      timestamp: new Date().toISOString(),
      foodId: foodId.trim(),
      food: currentResult.food,
      predictedStage: currentResult.status,
      trueStage,
      confidence: currentResult.confidence,
      readings: currentResult.sensorReadings,
      notes: notes.trim()
    };

    try {
      await logScan(newEntry);
      setRecentLogs((prev) => [newEntry, ...prev]);
      onLoggedSuccess(newEntry);
      setNotes('');
      // increment index for next scan
      setFoodId(`${currentResult.food.toUpperCase()}_${String(recentLogs.length + 2).padStart(2, '0')}`);
    } catch (err) {
      console.error('Failed to log scan', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCsv = () => {
    if (recentLogs.length === 0) return;

    const headers = [
      'FoodID',
      'FoodType',
      'TrueStage',
      'PredictedStage',
      'Confidence',
      'MQ135_Baseline',
      'MQ3_Baseline',
      'MQ135_Mean',
      'MQ135_Std',
      'MQ3_Mean',
      'MQ3_Std',
      'FSR_Median',
      'Temp_C',
      'RH_Pct',
      'Timestamp',
      'Notes'
    ];

    const rows = recentLogs.map((log) => [
      log.foodId,
      log.food,
      log.trueStage,
      log.predictedStage,
      log.confidence,
      log.readings.mq135_baseline,
      log.readings.mq3_baseline,
      log.readings.mq135_mean,
      log.readings.mq135_std,
      log.readings.mq3_mean,
      log.readings.mq3_std,
      log.readings.fsr_median,
      log.readings.temp_c,
      log.readings.rh_pct,
      log.timestamp,
      `"${(log.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `electronic_nose_dataset_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section
      id="dataset-log-section"
      aria-label="Dataset Ground Truth Logging"
      className="rounded-2xl bg-[#e4e5e7]/95 border border-indigo-500/25 shadow-[0_4px_24px_rgba(252, 252, 253,0.3)] overflow-hidden animate-in fade-in-50 duration-300"
    >
      {/* Collapsible Header - Strictly No 1,2,3 numbering */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 sm:p-6 flex items-center justify-between text-left hover:bg-indigo-950/20 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/20 via-indigo-500/20 to-purple-500/20 border border-cyan-400/40 text-cyan-300 shadow-[0_0_12px_rgba(99, 108, 119,0.3)]">
            <Database className="w-4 h-4 text-cyan-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Log This Scan &bull; Dataset Ground-Truth Acquisition
              </h3>
              <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 shadow-[0_0_8px_rgba(99, 108, 119,0.2)]">
                Live Hardware Mode Active
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Annotate and append current 9-sensor reading to training dataset buffer
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <span className="hidden sm:inline">
            Buffer: <strong className="text-cyan-300 font-semibold">{recentLogs.length}</strong> samples
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4 text-cyan-400" /> : <ChevronDown className="w-4 h-4 text-cyan-400" />}
        </div>
      </button>

      {/* Panel Body */}
      {isOpen && (
        <div className="p-5 sm:p-6 pt-0 border-t border-slate-800 space-y-6">
          
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Food ID Input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="food-id-input"
                  className="text-xs font-semibold text-slate-200 flex items-center gap-1.5"
                >
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  <span>Specimen Tag / Food ID</span>
                </label>
                <input
                  id="food-id-input"
                  type="text"
                  required
                  value={foodId}
                  onChange={(e) => setFoodId(e.target.value)}
                  placeholder="e.g. APPLE_01, TOMATO_04"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[11px] text-slate-500">
                  Unique physical sample barcode or lab identifier.
                </span>
              </div>

              {/* Operator True Stage Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-slate-400" />
                  <span>True Stage (Operator Visual Ground Truth)</span>
                </label>
                <div className="grid grid-cols-4 gap-2 pt-0.5">
                  {STAGES.map((stage) => {
                    const isChecked = trueStage === stage;
                    return (
                      <label
                        key={stage}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-emerald-500/15 border-emerald-500/60 text-white shadow-sm ring-1 ring-emerald-500/40'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="trueStage"
                          value={stage}
                          checked={isChecked}
                          onChange={() => setTrueStage(stage)}
                          className="sr-only"
                        />
                        <span>{stage}</span>
                      </label>
                    );
                  })}
                </div>
                <span className="text-[11px] text-slate-500">
                  Physically verified condition for supervised dataset training.
                </span>
              </div>

            </div>

            {/* Notes Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="operator-notes-input"
                className="text-xs font-semibold text-slate-200"
              >
                Operator Observation Notes
              </label>
              <textarea
                id="operator-notes-input"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Cuticle shows slight browning on calyx; harvested 5 days prior; ambient humidity 54%."
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowLogsTable(!showLogsTable)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
                >
                  <ListFilter className="w-3.5 h-3.5" />
                  <span>
                    {showLogsTable ? 'Hide Buffer View' : `View Logged Buffer (${recentLogs.length})`}
                  </span>
                </button>

                {recentLogs.length > 0 && (
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
                    title="Download dataset CSV for offline model training and analysis"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Export CSV</span>
                  </button>
                )}
              </div>

              <button
                id="append-dataset-btn"
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-sm transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Appending...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Append to Dataset</span>
                  </>
                )}
              </button>
            </div>

          </form>

          {/* Dataset Table Modal / Viewer */}
          {showLogsTable && (
            <div className="pt-4 border-t border-slate-800 space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  Dataset Memory Buffer ({recentLogs.length} records)
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  Ready for model re-training
                </span>
              </div>

              {recentLogs.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-900 text-center text-xs text-slate-500">
                  No samples logged in this session yet. Submit the form above to record your first specimen.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-52 overflow-y-auto">
                  <table className="w-full text-left font-mono text-[11px]">
                    <thead className="bg-slate-950 text-slate-400 sticky top-0 border-b border-slate-800">
                      <tr>
                        <th className="py-2 px-2.5">ID</th>
                        <th className="py-2 px-2.5">Food</th>
                        <th className="py-2 px-2.5">True</th>
                        <th className="py-2 px-2.5">AI Pred</th>
                        <th className="py-2 px-2.5">Conf</th>
                        <th className="py-2 px-2.5">&Delta;Gas</th>
                        <th className="py-2 px-2.5">&Delta;Eth</th>
                        <th className="py-2 px-2.5">FSR</th>
                        <th className="py-2 px-2.5">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/50 text-slate-300">
                      {recentLogs.map((log) => {
                        const gasDelta = log.readings.mq135_mean - log.readings.mq135_baseline;
                        const fermDelta = log.readings.mq3_mean - log.readings.mq3_baseline;
                        return (
                          <tr key={log.id} className="hover:bg-slate-800/40">
                            <td className="py-2 px-2.5 font-bold text-white">{log.foodId}</td>
                            <td className="py-2 px-2.5">{log.food}</td>
                            <td className="py-2 px-2.5 font-semibold text-emerald-400">{log.trueStage}</td>
                            <td className="py-2 px-2.5 text-slate-300">{log.predictedStage}</td>
                            <td className="py-2 px-2.5">{log.confidence}%</td>
                            <td className="py-2 px-2.5 text-amber-400">+{Math.round(gasDelta)}</td>
                            <td className="py-2 px-2.5 text-cyan-400">+{Math.round(fermDelta)}</td>
                            <td className="py-2 px-2.5 text-purple-400">{log.readings.fsr_median}</td>
                            <td className="py-2 px-2.5 text-slate-500">
                              {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </section>
  );
};
