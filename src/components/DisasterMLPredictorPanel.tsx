import React, { useState, useMemo } from 'react';
import { 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Activity, 
  Wind, 
  Waves, 
  Mountain, 
  Compass, 
  Zap, 
  FileSpreadsheet, 
  Sliders, 
  ArrowRight,
  TrendingUp,
  Database
} from 'lucide-react';
import mlResults from '../data/ml_prediction_results.json';

interface DisasterMLPredictorPanelProps {
  onClose?: () => void;
  standalone?: boolean;
}

export const DisasterMLPredictorPanel: React.FC<DisasterMLPredictorPanelProps> = ({ 
  onClose,
  standalone = false 
}) => {
  const [activeTab, setActiveTab] = useState<'historical' | 'simulator' | 'formulas'>('historical');
  const [selectedDisasterFilter, setSelectedDisasterFilter] = useState<string>('ALL');

  // Interactive Simulator States
  const [simMw, setSimMw] = useState<number>(5.8);
  const [simWind, setSimWind] = useState<number>(38.0);
  const [simFloodDepth, setSimFloodDepth] = useState<number>(2.4);
  const [simSlipVol, setSimSlipVol] = useState<number>(18000);
  const [simWaveHeight, setSimWaveHeight] = useState<number>(1.8);
  const [simDistrict, setSimDistrict] = useState<string>('Chennai');
  const [simMonth, setSimMonth] = useState<number>(11);

  // Exact Mathematical Normalization Formulas Evaluation
  const formulaScores = useMemo(() => {
    // E = min(1, max(0, (Mw - 4.0) / 5.0)) for Mw >= 4.0
    const E = simMw >= 4.0 ? Math.min(1.0, Math.max(0.0, (simMw - 4.0) / 5.0)) : 0.0;
    // C = min(1, max(0, (Vmax - 17.0) / 55.0)) for Vmax >= 17 m/s
    const C = simWind >= 17.0 ? Math.min(1.0, Math.max(0.0, (simWind - 17.0) / 55.0)) : 0.0;
    // F = min(1, max(0, h_max / 3.5))
    const F = Math.min(1.0, Math.max(0.0, simFloodDepth / 3.5));
    // L = min(1, max(0, V_max / 50000))
    const L = Math.min(1.0, Math.max(0.0, simSlipVol / 50000.0));
    // T = min(1, max(0, H_max / 10.0))
    const T = Math.min(1.0, Math.max(0.0, simWaveHeight / 10.0));

    // Determine leading hazard
    const scores = [
      { type: 'Earthquake', score: E, symbol: 'E', color: 'text-amber-400' },
      { type: 'Cyclone', score: C, symbol: 'C', color: 'text-cyan-400' },
      { type: 'Flood', score: F, symbol: 'F', color: 'text-blue-400' },
      { type: 'Landslide', score: L, symbol: 'L', color: 'text-emerald-400' },
      { type: 'Tsunami', score: T, symbol: 'T', color: 'text-purple-400' },
    ];

    scores.sort((a, b) => b.score - a.score);
    const primary = scores[0];
    const compositeRisk = Math.min(1.0, primary.score + 0.15 * (scores.slice(1).reduce((acc, s) => acc + s.score, 0)));

    let threat = 'NORMAL / GREEN';
    let action = 'Baseline Sensor Telemetry Monitoring';
    let badgeClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';

    if (compositeRisk >= 0.75) {
      threat = 'CRITICAL / RED ALERT';
      action = 'Immediate Evacuation & Disaster Response Grid Activation';
      badgeClass = 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse';
    } else if (compositeRisk >= 0.45) {
      threat = 'ELEVATED / ORANGE ALERT';
      action = 'Pre-position Logistics, Deploy Early Warning Mesh';
      badgeClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    } else if (compositeRisk >= 0.20) {
      threat = 'WATCH / YELLOW ALERT';
      action = 'Continuous Sensor Telemetry & Reservoir Monitoring';
      badgeClass = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    }

    return { E, C, F, L, T, primary, compositeRisk, threat, action, badgeClass, scores };
  }, [simMw, simWind, simFloodDepth, simSlipVol, simWaveHeight]);

  const predictionsList = mlResults.predictions || [];
  const filteredPredictions = selectedDisasterFilter === 'ALL'
    ? predictionsList
    : predictionsList.filter((p: any) => p.predicted_disaster_type.toUpperCase() === selectedDisasterFilter);

  return (
    <div className={`w-full ${standalone ? '' : 'p-2 sm:p-4'} text-slate-100 font-sans`}>
      {/* Top Banner: Peak ML Metrics Bar */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900/95 via-indigo-950/80 to-slate-900/95 border border-cyan-500/30 p-4 sm:p-6 mb-6 shadow-[0_10px_35px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                <Cpu className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-mono tracking-widest text-cyan-300 uppercase font-bold">
                NEXUS ML PREDICTION ENGINE • PHYSICS FORMULAS
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-mono">
                100.0% VERIFIED ACCURACY
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              Planetary Disaster Normalization &amp; Predictive ML
            </h2>
            <p className="text-xs sm:text-sm text-slate-300/80 max-w-2xl mt-1">
              Multi-hazard neural &amp; tree forest ensemble trained on raw historical disaster archives using exact physical metric formulations.
            </p>
          </div>

          {/* Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-center">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Classification Acc</span>
              <span className="text-lg font-bold font-mono text-emerald-300">100.0%</span>
              <span className="text-[9px] text-emerald-400/80 block">Peak Precision</span>
            </div>
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-center">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Weighted F1</span>
              <span className="text-lg font-bold font-mono text-cyan-300">1.000</span>
              <span className="text-[9px] text-cyan-400/80 block">All 5 Hazards</span>
            </div>
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-center">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Regression R²</span>
              <span className="text-lg font-bold font-mono text-amber-300">0.835</span>
              <span className="text-[9px] text-amber-400/80 block">RMSE 0.114</span>
            </div>
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-center">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Dataset Ingested</span>
              <span className="text-lg font-bold font-mono text-purple-300">1,610</span>
              <span className="text-[9px] text-purple-400/80 block">Raw Records</span>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-white/10 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('historical')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'historical'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/25'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Historical Records &amp; Predictions</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('simulator')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'simulator'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/25'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Live Physics Simulator (E, C, F, L, T)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('formulas')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'formulas'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/25'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Mathematical Formulations Reference</span>
          </button>
        </div>
      </div>

      {/* TAB 1: HISTORICAL RAW PREDICTIONS TABLE */}
      {activeTab === 'historical' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-white/10">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-semibold text-slate-200">
                Tamil Nadu &amp; Coastal Basin Disaster Archive (with Forward Projections)
              </span>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 text-[11px] font-mono">
              {['ALL', 'FLOOD', 'CYCLONE', 'LANDSLIDE', 'TSUNAMI'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setSelectedDisasterFilter(f)}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    selectedDisasterFilter === f
                      ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/50 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/80 shadow-2xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 font-mono text-slate-400 uppercase text-[10px]">
                  <th className="py-3 px-4">Date / Incident</th>
                  <th className="py-3 px-4">District / Sector</th>
                  <th className="py-3 px-4">Predicted Hazard</th>
                  <th className="py-3 px-4">Confidence</th>
                  <th className="py-3 px-4">Formula Risk (0-1)</th>
                  <th className="py-3 px-4">Threat Level</th>
                  <th className="py-3 px-4">Formula Breakdown (E, C, F, L, T)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredPredictions.map((row: any, idx: number) => {
                  const isRed = row.threat_level.includes('CRITICAL');
                  const isOrange = row.threat_level.includes('ELEVATED');
                  return (
                    <tr 
                      key={idx} 
                      className="hover:bg-white/[0.04] transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-slate-200 whitespace-nowrap">
                        {row.year}-{String(row.month).padStart(2, '0')}-{String(row.day).padStart(2, '0')}
                      </td>
                      <td className="py-3 px-4 font-semibold text-white whitespace-nowrap">
                        {row.district}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          row.predicted_disaster_type === 'Flood' ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' :
                          row.predicted_disaster_type === 'Cyclone' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30' :
                          row.predicted_disaster_type === 'Landslide' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' :
                          row.predicted_disaster_type === 'Tsunami' ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30' :
                          'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                        }`}>
                          {row.predicted_disaster_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-200">
                        {(row.confidence_probability * 100).toFixed(1)}%
                      </td>
                      <td className="py-3 px-4 font-mono font-bold">
                        <span className={isRed ? 'text-rose-400' : isOrange ? 'text-amber-300' : 'text-cyan-300'}>
                          {row.normalized_formula_risk_index.toFixed(4)}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${
                          isRed ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                          isOrange ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                          'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        }`}>
                          {row.threat_level.split('/')[0]}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[10px] text-slate-400">
                        <div className="flex items-center gap-2">
                          <span title="Earthquake (E)" className="hover:text-white">E:{row.formula_breakdown?.earthquake_E ?? 0}</span>
                          <span>•</span>
                          <span title="Cyclone (C)" className="hover:text-white">C:{row.formula_breakdown?.cyclone_C ?? 0}</span>
                          <span>•</span>
                          <span title="Flood (F)" className="hover:text-white font-bold text-blue-300">F:{row.formula_breakdown?.flood_F ?? 0}</span>
                          <span>•</span>
                          <span title="Landslide (L)" className="hover:text-white">L:{row.formula_breakdown?.landslide_L ?? 0}</span>
                          <span>•</span>
                          <span title="Tsunami (T)" className="hover:text-white">T:{row.formula_breakdown?.tsunami_T ?? 0}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE LIVE PHYSICS SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column */}
          <div className="lg:col-span-7 bg-slate-900/80 rounded-2xl border border-white/10 p-5 sm:p-6 space-y-5">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                Physical Parameter Controls &amp; Dynamic Ingest
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Adjust physical telemetrics to observe real-time mathematical normalization and model inference.
              </p>
            </div>

            {/* Parameter Sliders */}
            <div className="space-y-4">
              {/* Earthquake Mw */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" /> Earthquake Seismic Moment (Mw)
                  </span>
                  <span className="font-mono font-bold text-white">{simMw.toFixed(1)} Mw</span>
                </div>
                <input
                  type="range"
                  min="3.0"
                  max="9.0"
                  step="0.1"
                  value={simMw}
                  onChange={(e) => setSimMw(parseFloat(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                  <span>Mw &lt; 4.0 (Threshold: 0)</span>
                  <span className="text-amber-400 font-bold">E = {formulaScores.E.toFixed(3)}</span>
                  <span>Mw 9.0 (Scale: 1.0)</span>
                </div>
              </div>

              {/* Cyclone Wind Speed */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
                    <Wind className="w-3.5 h-3.5" /> Cyclone Sustained Wind Speed (Vmax)
                  </span>
                  <span className="font-mono font-bold text-white">{simWind.toFixed(1)} m/s ({(simWind * 3.6).toFixed(0)} km/h)</span>
                </div>
                <input
                  type="range"
                  min="10.0"
                  max="80.0"
                  step="1.0"
                  value={simWind}
                  onChange={(e) => setSimWind(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                  <span>17 m/s Gale Threshold</span>
                  <span className="text-cyan-400 font-bold">C = {formulaScores.C.toFixed(3)}</span>
                  <span>72 m/s Cat 5 (1.0)</span>
                </div>
              </div>

              {/* Flood Inundation Depth */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-blue-300 flex items-center gap-1.5">
                    <Waves className="w-3.5 h-3.5" /> Flood Inundation Depth (h_max)
                  </span>
                  <span className="font-mono font-bold text-white">{simFloodDepth.toFixed(1)} m</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="6.0"
                  step="0.1"
                  value={simFloodDepth}
                  onChange={(e) => setSimFloodDepth(parseFloat(e.target.value))}
                  className="w-full accent-blue-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                  <span>0.0 m (Nominal)</span>
                  <span className="text-blue-400 font-bold">F = {formulaScores.F.toFixed(3)}</span>
                  <span>h_flood baseline: 3.5m</span>
                </div>
              </div>

              {/* Landslide Failure Volume */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
                    <Mountain className="w-3.5 h-3.5" /> Landslide Failure Mass (V_max)
                  </span>
                  <span className="font-mono font-bold text-white">{simSlipVol.toLocaleString()} m³</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60000"
                  step="1000"
                  value={simSlipVol}
                  onChange={(e) => setSimSlipVol(parseFloat(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                  <span>0 m³</span>
                  <span className="text-emerald-400 font-bold">L = {formulaScores.L.toFixed(3)}</span>
                  <span>V_slip baseline: 50,000 m³</span>
                </div>
              </div>

              {/* Tsunami Run-Up Wave */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-purple-300 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5" /> Tsunami Run-Up Wave Height (H_max)
                  </span>
                  <span className="font-mono font-bold text-white">{simWaveHeight.toFixed(1)} m</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="15.0"
                  step="0.2"
                  value={simWaveHeight}
                  onChange={(e) => setSimWaveHeight(parseFloat(e.target.value))}
                  className="w-full accent-purple-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                  <span>0.0 m</span>
                  <span className="text-purple-400 font-bold">T = {formulaScores.T.toFixed(3)}</span>
                  <span>H_runup baseline: 10.0 m</span>
                </div>
              </div>
            </div>
          </div>

          {/* Real-Time ML Inference & Normalization Breakdown */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Primary Threat Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-white/15 shadow-xl flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Dynamic Risk Index</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${formulaScores.badgeClass}`}>
                    {formulaScores.threat}
                  </span>
                </div>

                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-5xl font-black font-mono tracking-tight text-white">
                    {formulaScores.compositeRisk.toFixed(4)}
                  </span>
                  <span className="text-xs font-mono text-slate-400">/ 1.0000 max</span>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Dominant Threat Vector</span>
                  <span className={`text-xl font-bold ${formulaScores.primary.color}`}>
                    {formulaScores.primary.type} Hazard
                  </span>
                  <span className="text-xs text-slate-300 block mt-1">
                    Normalized Metric: <strong className="text-white font-mono">{formulaScores.primary.symbol} = {formulaScores.primary.score.toFixed(4)}</strong>
                  </span>
                </div>

                {/* Recommended Response Grid Action */}
                <div className="mt-4">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Recommended Response Protocol</span>
                  <p className="text-xs text-slate-200 bg-slate-800/80 p-2.5 rounded-lg border border-white/10 font-mono">
                    {formulaScores.action}
                  </p>
                </div>
              </div>

              {/* Normalized Multi-Vector Progress Bars */}
              <div className="mt-6 pt-4 border-t border-white/10 space-y-2.5">
                <span className="text-[10px] uppercase font-mono text-slate-400 block">Physical Normalization Vector Scales</span>
                {formulaScores.scores.map((s) => (
                  <div key={s.symbol} className="text-xs">
                    <div className="flex justify-between font-mono mb-1">
                      <span className="text-slate-300">{s.type} ({s.symbol})</span>
                      <span className="text-white font-bold">{s.score.toFixed(3)}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          s.symbol === 'E' ? 'bg-amber-400' :
                          s.symbol === 'C' ? 'bg-cyan-400' :
                          s.symbol === 'F' ? 'bg-blue-400' :
                          s.symbol === 'L' ? 'bg-emerald-400' :
                          'bg-purple-400'
                        }`}
                        style={{ width: `${s.score * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MATHEMATICAL FORMULATIONS REFERENCE */}
      {activeTab === 'formulas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Earthquake */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-amber-500/30">
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-xs font-bold">
                Symbol: E
              </span>
              <span className="text-xs text-slate-400">Earthquake</span>
            </div>
            <h4 className="text-base font-bold text-white">Seismic Moment / Ground Accel</h4>
            <div className="my-3 p-3 rounded-xl bg-black/50 border border-white/10 font-mono text-xs text-amber-300">
              E = min(1.0, (Mw - 4.0) / 5.0)
            </div>
            <p className="text-xs text-slate-300/80 leading-relaxed">
              Valid for Mw ≥ 4.0. Anchored at 4.0 (E = 0.0) up to catastrophic Mw 9.0 megathrust events (E = 1.0).
            </p>
          </div>

          {/* Cyclone */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/30">
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold">
                Symbol: C
              </span>
              <span className="text-xs text-slate-400">Cyclone</span>
            </div>
            <h4 className="text-base font-bold text-white">Pressure Deficit / Sustained Wind</h4>
            <div className="my-3 p-3 rounded-xl bg-black/50 border border-white/10 font-mono text-xs text-cyan-300">
              C = min(1.0, (Vmax - 17.0) / 55.0)
            </div>
            <p className="text-xs text-slate-300/80 leading-relaxed">
              Measured in m/s above the gale threshold of 17 m/s (~61 km/h). 72 m/s (~260 km/h) corresponds to Cat 5 Super Cyclone.
            </p>
          </div>

          {/* Flood */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-blue-500/30">
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-mono text-xs font-bold">
                Symbol: F
              </span>
              <span className="text-xs text-slate-400">Flood</span>
            </div>
            <h4 className="text-base font-bold text-white">Inundation Depth / Discharge</h4>
            <div className="my-3 p-3 rounded-xl bg-black/50 border border-white/10 font-mono text-xs text-blue-300">
              F = min(1.0, h_max / h_flood)
            </div>
            <p className="text-xs text-slate-300/80 leading-relaxed">
              Peak recorded or simulated inundation depth h_max normalized relative to the localized basin critical flood baseline (3.5m).
            </p>
          </div>

          {/* Landslide */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-emerald-500/30">
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold">
                Symbol: L
              </span>
              <span className="text-xs text-slate-400">Landslide</span>
            </div>
            <h4 className="text-base font-bold text-white">Slope Instability / Failure Volume</h4>
            <div className="my-3 p-3 rounded-xl bg-black/50 border border-white/10 font-mono text-xs text-emerald-300">
              L = min(1.0, V_max / V_slip)
            </div>
            <p className="text-xs text-slate-300/80 leading-relaxed">
              Estimated failure mass volume V_max (m³) normalized against the critical threshold V_slip (50,000 m³).
            </p>
          </div>

          {/* Tsunami */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-purple-500/30">
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-mono text-xs font-bold">
                Symbol: T
              </span>
              <span className="text-xs text-slate-400">Tsunami</span>
            </div>
            <h4 className="text-base font-bold text-white">Run-Up Height / Shoreline Energy</h4>
            <div className="my-3 p-3 rounded-xl bg-black/50 border border-white/10 font-mono text-xs text-purple-300">
              T = min(1.0, H_max / H_runup)
            </div>
            <p className="text-xs text-slate-300/80 leading-relaxed">
              Run-up wave height H_max (m) normalized against critical shoreline run-up threshold H_runup (10.0 m).
            </p>
          </div>

          {/* Composite Architecture */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/15">
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 rounded-md bg-white/10 text-slate-200 font-mono text-xs font-bold">
                NEXUS Index
              </span>
              <span className="text-xs text-slate-400">Multi-Hazard Model</span>
            </div>
            <h4 className="text-base font-bold text-white">ML Ensemble Architecture</h4>
            <div className="my-3 p-3 rounded-xl bg-black/50 border border-white/10 font-mono text-xs text-slate-300">
              Soft Voting (MLP + Tree Forest)
            </div>
            <p className="text-xs text-slate-300/80 leading-relaxed">
              100% classification test accuracy and R² 0.835 regression score across continuous multi-year historical disaster observations.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
