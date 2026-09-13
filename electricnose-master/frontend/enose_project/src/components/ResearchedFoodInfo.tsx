import React from 'react';
import {
  BookOpen,
  CheckCircle2,
  Database,
  ExternalLink,
  FileText,
  HeartHandshake,
  Info,
  ShieldCheck,
  ThermometerSnowflake
} from 'lucide-react';
import { FoodInfo } from '../types';

interface ResearchedFoodInfoProps {
  foodInfo: FoodInfo;
}

export const ResearchedFoodInfo: React.FC<ResearchedFoodInfoProps> = ({ foodInfo }) => {
  return (
    <div className="space-y-4 pt-4">
      
      {/* Visual Divider with Distinct Section Indicator */}
      <div className="relative flex items-center justify-center my-6">
        <div className="w-full border-t border-slate-800" />
        <span className="absolute bg-[#e4e5e7] px-4 py-1 text-xs font-mono font-bold text-slate-400 uppercase tracking-widest border border-slate-800 rounded-full flex items-center gap-1.5 shadow-sm">
          <Database className="w-3.5 h-3.5 text-sky-400" />
          <span>Verified Reference Archive</span>
        </span>
      </div>

      {/* Main Distinct Container */}
      <section
        id="researched-database-section"
        aria-label="Food Information — Researched Database (Not Sensed)"
        className="rounded-2xl bg-[#e4e5e7] border border-slate-800 shadow-sm p-6 space-y-6 relative overflow-hidden"
      >
        
        {/* Ambient background watermark icon */}
        <BookOpen className="absolute -right-10 -bottom-10 w-64 h-64 text-sky-500/5 pointer-events-none select-none" />

        {/* Header with Unmistakable Scope-Honesty Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Food Information &mdash; Researched Database
              </h3>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/20">
                Not Sensed &bull; Static Knowledge Base
              </span>
            </div>
            <p className="text-xs text-sky-200/70 font-mono mt-0.5">
              Specimen: <strong className="text-white">{foodInfo.food}</strong> ({foodInfo.scientificName})
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono self-start sm:self-auto bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>USDA &amp; FAO Post-Harvest Source</span>
          </div>
        </div>

        {/* Scope Honesty Notice Banner */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
          <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 leading-relaxed">
            <strong className="font-semibold text-white">Reference Scope Distinction:</strong> The nutritional composition, commercial post-harvest treatment protocols, and culinary recommendations below are retrieved from verified agricultural literature. These parameters are <em>independent of the live gas and firmness sensor reading</em> above.
          </div>
        </div>

        {/* Two-Column Grid: Nutrition Table (Left) + Treatment Profile & Recommendation (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
          
          {/* Left Column: Nutrition Facts Table (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-sky-400" />
                Nutrition Facts (Per 100g Edible Portion)
              </h4>
              <span className="text-[10px] font-mono text-slate-500">
                Standard Baseline
              </span>
            </div>

            <div className="rounded-xl border border-sky-900/50 bg-slate-950/60 overflow-hidden shadow-inner">
              <table className="w-full text-xs text-left">
                <thead className="bg-sky-950/50 text-slate-400 border-b border-sky-900/40 font-mono text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Nutrient Component</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Per 100g</th>
                    <th className="py-2.5 px-3 font-semibold text-right">% Daily</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                  {foodInfo.nutritionPer100g.map((item, idx) => (
                    <tr
                      key={item.nutrient}
                      className={idx % 2 === 0 ? 'bg-transparent' : 'bg-slate-900/30'}
                    >
                      <td className="py-2 px-3 text-slate-200 font-sans font-medium text-xs">
                        {item.nutrient}
                      </td>
                      <td className="py-2 px-3 text-right text-sky-300 font-bold">
                        {item.amount}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-400">
                        {item.dailyValue || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Optimal Storage Reference */}
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 text-xs space-y-1">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <ThermometerSnowflake className="w-3.5 h-3.5 text-cyan-400" />
                Optimal Agronomic Storage Conditions:
              </span>
              <p className="text-slate-400 font-mono text-[11px]">
                {foodInfo.optimalStorage}
              </p>
            </div>
          </div>

          {/* Right Column: Treatment Profile + Recommendation (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Treatment Profile */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                Post-Harvest Physiology &amp; Chemical Treatment Profile
              </h4>
              <div className="p-4 rounded-xl bg-slate-950/70 border border-sky-900/40 text-xs text-slate-300 leading-relaxed space-y-2">
                <p>{foodInfo.treatmentProfile}</p>
                <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <strong className="text-slate-300">Primary Degradation Mechanism: </strong>
                  {foodInfo.spoilageMechanisms}
                </div>
              </div>
            </div>

            {/* Highlighted Green Recommendation Callout Box */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Storage &amp; Culinary Recommendation
                </h4>
              </div>

              <div
                id="food-recommendation-callout"
                className="p-4 rounded-xl bg-emerald-950/40 border-l-4 border-emerald-500 border-r border-t border-b border-emerald-500/20 text-emerald-200 text-xs leading-relaxed space-y-1 shadow-lg shadow-emerald-950/40 glow-emerald"
              >
                <div className="flex items-center gap-2 font-bold text-white text-xs mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Agronomic Expert Guidance for {foodInfo.food}</span>
                </div>
                <p className="text-emerald-200/90">{foodInfo.recommendation}</p>
              </div>
            </div>

          </div>

        </div>

      </section>
    </div>
  );
};
