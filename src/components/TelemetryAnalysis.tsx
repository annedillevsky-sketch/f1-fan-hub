import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend, 
  ReferenceLine 
} from 'recharts';
import { LAP_TELEMETRY_DATA } from '../data/f1Data';
import { Driver, TelemetrySample } from '../types';
import { 
  Gauge, 
  Zap, 
  Flame, 
  Award, 
  Sliders, 
  ArrowLeftRight, 
  Compass, 
  Shield, 
  Volume2, 
  Sparkles,
  Check
} from 'lucide-react';
import { playTeamRadioChirp, playEngineRevSound } from '../utils/audioAlerts';

interface TelemetryAnalysisProps {
  drivers: Driver[];
  isDarkMode: boolean;
}

interface RivalryPreset {
  name: string;
  badge: string;
  driver1Id: string;
  driver2Id: string;
}

const RIVALRY_PRESETS: RivalryPreset[] = [
  { name: 'Norris vs Verstappen', badge: 'Title Fight 2026', driver1Id: 'nor', driver2Id: 'ver' },
  { name: 'Leclerc vs Hamilton', badge: 'Ferrari Duel', driver1Id: 'lec', driver2Id: 'ham' },
  { name: 'Norris vs Piastri', badge: 'McLaren Teammates', driver1Id: 'nor', driver2Id: 'pia' },
  { name: 'Russell vs Antonelli', badge: 'Mercedes Future', driver1Id: 'rus', driver2Id: 'ant' },
  { name: 'Alonso vs Stroll', badge: 'Aston Martin', driver1Id: 'alo', driver2Id: 'str' },
];

export const TelemetryAnalysis: React.FC<TelemetryAnalysisProps> = ({ drivers, isDarkMode }) => {
  const [driver1Id, setDriver1Id] = useState<string>('nor'); // Norris
  const [driver2Id, setDriver2Id] = useState<string>('ver'); // Verstappen
  const [activeTelemetryTab, setActiveTelemetryTab] = useState<'all' | 'speed' | 'throttle_brake' | 'delta'>('all');

  const driver1 = drivers.find(d => d.id === driver1Id) || drivers[0];
  const driver2 = drivers.find(d => d.id === driver2Id) || drivers[1] || drivers[0];

  // Swap Driver 1 and Driver 2
  const handleSwapDrivers = () => {
    const temp = driver1Id;
    setDriver1Id(driver2Id);
    setDriver2Id(temp);
    playTeamRadioChirp();
  };

  // Select rivalry preset
  const handleSelectPreset = (preset: RivalryPreset) => {
    setDriver1Id(preset.driver1Id);
    setDriver2Id(preset.driver2Id);
    playTeamRadioChirp();
  };

  // Adjust telemetry data if another driver is picked
  // Based on current qualifying pace / race position
  const paceFactor1 = driver1.currentPosition <= 2 ? 1.0 : 0.988 - (driver1.currentPosition * 0.0018);
  const paceFactor2 = driver2.currentPosition <= 2 ? 1.0 : 0.988 - (driver2.currentPosition * 0.0018);

  const chartData = LAP_TELEMETRY_DATA.map((pt) => {
    const s1 = Math.round(pt.speed1 * paceFactor1);
    const s2 = Math.round(pt.speed2 * paceFactor2);

    // Dynamic throttle / brake responsiveness difference between drivers
    const throttle2Adjusted = Math.min(100, Math.round(pt.throttle2 * (paceFactor2 / paceFactor1)));
    const brake2Adjusted = Math.min(100, Math.round(pt.brake2 * (paceFactor1 / paceFactor2)));

    return {
      distanceM: pt.distanceM,
      distanceKm: (pt.distanceM / 1000).toFixed(2),
      speed1: s1,
      speed2: s2,
      throttle1: pt.throttle1,
      throttle2: throttle2Adjusted,
      brake1: pt.brake1,
      brake2: brake2Adjusted,
      gear1: pt.gear1,
      gear2: pt.gear2,
      deltaSeconds: Number((pt.deltaSeconds * (paceFactor2 / paceFactor1)).toFixed(3)),
      corner: pt.corner || '',
    };
  });

  // Calculate telemetry summary statistics
  const topSpeed1 = Math.max(...chartData.map(d => d.speed1));
  const topSpeed2 = Math.max(...chartData.map(d => d.speed2));
  const minSpeed1 = Math.min(...chartData.map(d => d.speed1));
  const minSpeed2 = Math.min(...chartData.map(d => d.speed2));
  const endDelta = chartData[chartData.length - 1].deltaSeconds;

  const keyCorners = chartData.filter(d => d.corner && d.corner !== 'Start/Finish' && d.corner !== 'Finish Line');

  return (
    <div className="space-y-6">
      {/* Top Header & Dynamic Driver Comparison Selector */}
      <div className={`p-4 sm:p-6 rounded-xl border ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-600/20 text-purple-400 border border-purple-500/30 uppercase">
                Post-Race Telemetry Studio
              </span>
              <span className="text-xs text-slate-400 font-mono">Head-to-Head 2026 Grid Comparison</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-racing font-bold tracking-wide mt-1 text-slate-100">
              Lap 42 Telemetry: {driver1.firstName} {driver1.lastName} vs {driver2.firstName} {driver2.lastName}
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              High-frequency GPS speed traps, pedal traces & delta progression across 5,891 meters
            </p>
          </div>

          {/* Quick Tab Filter */}
          <div className="flex items-center gap-1 p-1 rounded-lg border border-slate-800 bg-slate-950">
            <button
              onClick={() => setActiveTelemetryTab('all')}
              className={`px-3 py-1 rounded text-xs font-mono font-semibold transition ${
                activeTelemetryTab === 'all' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Traces
            </button>
            <button
              onClick={() => setActiveTelemetryTab('speed')}
              className={`px-3 py-1 rounded text-xs font-mono font-semibold transition ${
                activeTelemetryTab === 'speed' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Speed
            </button>
            <button
              onClick={() => setActiveTelemetryTab('throttle_brake')}
              className={`px-3 py-1 rounded text-xs font-mono font-semibold transition ${
                activeTelemetryTab === 'throttle_brake' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Pedals
            </button>
            <button
              onClick={() => setActiveTelemetryTab('delta')}
              className={`px-3 py-1 rounded text-xs font-mono font-semibold transition ${
                activeTelemetryTab === 'delta' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Delta Time
            </button>
          </div>
        </div>

        {/* Rivalry Quick-Select Presets */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-800/80">
          <span className="text-[11px] font-mono text-slate-400 uppercase font-bold flex items-center gap-1 mr-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Rivalry Presets:
          </span>
          {RIVALRY_PRESETS.map((preset, idx) => {
            const isMatch = (driver1Id === preset.driver1Id && driver2Id === preset.driver2Id) ||
                            (driver1Id === preset.driver2Id && driver2Id === preset.driver1Id);
            return (
              <button
                key={idx}
                onClick={() => handleSelectPreset(preset)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 border transition ${
                  isMatch
                    ? 'bg-purple-600/30 text-purple-300 border-purple-500 font-bold'
                    : 'text-slate-400 border-slate-800 bg-slate-950/60 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span>{preset.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 hidden sm:inline">
                  {preset.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Side-by-Side Dynamic Driver Selectors & Swap Button */}
        <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center mt-4 pt-3 border-t border-slate-800/80">
          {/* Driver 1 Card / Select */}
          <div className="md:col-span-5 p-3 rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-3.5 h-3.5 rounded-full shrink-0 shadow" style={{ backgroundColor: driver1.teamColor }} />
              <div className="min-w-0">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">DRIVER 1 (SOLID LINE)</span>
                <select
                  value={driver1Id}
                  onChange={(e) => {
                    setDriver1Id(e.target.value);
                    playTeamRadioChirp();
                  }}
                  className="bg-transparent text-sm font-bold font-mono text-slate-100 outline-none cursor-pointer w-full"
                >
                  {drivers.map(d => (
                    <option key={d.id} value={d.id} className="bg-slate-900 text-slate-100">
                      #{d.number} {d.firstName} {d.lastName} ({d.team})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <span className="px-2 py-1 rounded font-racing font-bold text-xs shrink-0" style={{ backgroundColor: `${driver1.teamColor}22`, color: driver1.teamColor }}>
              P{driver1.currentPosition}
            </span>
          </div>

          {/* Swap Button (1 column) */}
          <div className="md:col-span-1 flex justify-center">
            <button
              onClick={handleSwapDrivers}
              title="Swap Driver 1 & Driver 2"
              className="p-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-purple-600 hover:border-purple-500 text-slate-200 transition shadow active:scale-95 flex items-center justify-center"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* Driver 2 Card / Select */}
          <div className="md:col-span-5 p-3 rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-3.5 h-3.5 rounded-full shrink-0 shadow" style={{ backgroundColor: driver2.teamColor }} />
              <div className="min-w-0">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">DRIVER 2 (DASHED LINE)</span>
                <select
                  value={driver2Id}
                  onChange={(e) => {
                    setDriver2Id(e.target.value);
                    playTeamRadioChirp();
                  }}
                  className="bg-transparent text-sm font-bold font-mono text-slate-100 outline-none cursor-pointer w-full"
                >
                  {drivers.map(d => (
                    <option key={d.id} value={d.id} className="bg-slate-900 text-slate-100">
                      #{d.number} {d.firstName} {d.lastName} ({d.team})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <span className="px-2 py-1 rounded font-racing font-bold text-xs shrink-0" style={{ backgroundColor: `${driver2.teamColor}22`, color: driver2.teamColor }}>
              P{driver2.currentPosition}
            </span>
          </div>
        </div>

        {/* Telemetry Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className={`p-3 rounded-lg border ${
            isDarkMode ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="text-[11px] font-mono text-slate-400">TOP SPEED TRAP</div>
            <div className="flex items-baseline justify-between mt-1">
              <div>
                <span className="text-lg font-mono font-bold" style={{ color: driver1.teamColor }}>
                  {topSpeed1}
                </span>
                <span className="text-[10px] text-slate-400 ml-1">km/h</span>
              </div>
              <span className="text-xs text-slate-500 font-mono">vs</span>
              <div>
                <span className="text-lg font-mono font-bold" style={{ color: driver2.teamColor }}>
                  {topSpeed2}
                </span>
                <span className="text-[10px] text-slate-400 ml-1">km/h</span>
              </div>
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-1">
              Delta: {topSpeed1 >= topSpeed2 ? `${driver1.code} (+${topSpeed1 - topSpeed2} km/h)` : `${driver2.code} (+${topSpeed2 - topSpeed1} km/h)`}
            </div>
          </div>

          <div className={`p-3 rounded-lg border ${
            isDarkMode ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="text-[11px] font-mono text-slate-400">MIN APEX SPEED</div>
            <div className="flex items-baseline justify-between mt-1">
              <div>
                <span className="text-lg font-mono font-bold" style={{ color: driver1.teamColor }}>
                  {minSpeed1}
                </span>
                <span className="text-[10px] text-slate-400 ml-1">km/h</span>
              </div>
              <span className="text-xs text-slate-500 font-mono">vs</span>
              <div>
                <span className="text-lg font-mono font-bold" style={{ color: driver2.teamColor }}>
                  {minSpeed2}
                </span>
                <span className="text-[10px] text-slate-400 ml-1">km/h</span>
              </div>
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-1">
              Slowest corner hairpin apex
            </div>
          </div>

          <div className={`p-3 rounded-lg border ${
            isDarkMode ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="text-[11px] font-mono text-slate-400">FULL THROTTLE %</div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-lg font-mono font-bold" style={{ color: driver1.teamColor }}>
                69.2%
              </span>
              <span className="text-xs text-slate-500 font-mono">vs</span>
              <span className="text-lg font-mono font-bold" style={{ color: driver2.teamColor }}>
                68.8%
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-1">
              Aggressive throttle exit profile
            </div>
          </div>

          <div className={`p-3 rounded-lg border ${
            isDarkMode ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="text-[11px] font-mono text-slate-400">LAP TIME DELTA</div>
            <div className="text-lg font-mono font-bold mt-1 text-emerald-400">
              {endDelta <= 0 ? `${driver1.code} ${endDelta}s` : `${driver2.code} -${endDelta}s`}
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-1">
              Over 5.891 km complete lap
            </div>
          </div>
        </div>
      </div>

      {/* Chart 1: Speed Trace (km/h) */}
      {(activeTelemetryTab === 'all' || activeTelemetryTab === 'speed') && (
        <div className={`p-4 sm:p-6 rounded-xl border ${
          isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-racing font-bold text-slate-200 uppercase tracking-wider">
                GPS Speed Trace (km/h) vs Lap Distance (Meters)
              </h3>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 rounded" style={{ backgroundColor: driver1.teamColor }} />
                {driver1.code} (#{driver1.number}) - Solid
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 rounded border-b border-dashed" style={{ borderColor: driver2.teamColor }} />
                {driver2.code} (#{driver2.number}) - Dashed
              </span>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#1E293B' : '#E2E8F0'} />
                <XAxis 
                  dataKey="distanceM" 
                  stroke={isDarkMode ? '#64748B' : '#94A3B8'} 
                  tickFormatter={(v) => `${v}m`}
                  tick={{ fontSize: 10 }}
                />
                <YAxis 
                  domain={[60, 355]} 
                  stroke={isDarkMode ? '#64748B' : '#94A3B8'} 
                  tick={{ fontSize: 10 }}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as TelemetrySample & { speed1: number; speed2: number; deltaSeconds: number };
                      return (
                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 shadow-xl text-xs font-mono">
                          <div className="text-slate-400 font-bold border-b border-slate-800 pb-1 mb-1">
                            Distance: {label}m {data.corner ? `• ${data.corner}` : ''}
                          </div>
                          <div className="flex items-center justify-between gap-4" style={{ color: driver1.teamColor }}>
                            <span>{driver1.code}:</span>
                            <span className="font-bold">{data.speed1} km/h (Gear {data.gear1})</span>
                          </div>
                          <div className="flex items-center justify-between gap-4" style={{ color: driver2.teamColor }}>
                            <span>{driver2.code}:</span>
                            <span className="font-bold">{data.speed2} km/h (Gear {data.gear2})</span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 pt-1 border-t border-slate-800">
                            Delta: {data.deltaSeconds > 0 ? `+${data.deltaSeconds}s` : `${data.deltaSeconds}s`}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="speed1" 
                  stroke={driver1.teamColor} 
                  strokeWidth={2.5} 
                  dot={false}
                  name={`${driver1.code} Speed`} 
                />
                <Line 
                  type="monotone" 
                  dataKey="speed2" 
                  stroke={driver2.teamColor} 
                  strokeWidth={2} 
                  strokeDasharray="4 3"
                  dot={false}
                  name={`${driver2.code} Speed`} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Chart 2: Throttle (%) & Brake (%) */}
      {(activeTelemetryTab === 'all' || activeTelemetryTab === 'throttle_brake') && (
        <div className={`p-4 sm:p-6 rounded-xl border ${
          isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-racing font-bold text-slate-200 uppercase tracking-wider">
                Throttle Application (0-100%) & Brake Pressure Overlay
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <span className="w-2.5 h-0.5 bg-emerald-400" /> {driver1.code} Throttle
              </span>
              <span className="flex items-center gap-1.5 text-emerald-300 font-bold">
                <span className="w-2.5 h-0.5 bg-emerald-400 border-b border-dashed" /> {driver2.code} Throttle
              </span>
              <span className="flex items-center gap-1.5 text-red-400 font-bold">
                <span className="w-2.5 h-0.5 bg-red-400" /> {driver1.code} Brake
              </span>
              <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                <span className="w-2.5 h-0.5 bg-amber-400 border-b border-dashed" /> {driver2.code} Brake
              </span>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#1E293B' : '#E2E8F0'} />
                <XAxis 
                  dataKey="distanceM" 
                  stroke={isDarkMode ? '#64748B' : '#94A3B8'} 
                  tickFormatter={(v) => `${v}m`}
                  tick={{ fontSize: 10 }}
                />
                <YAxis 
                  domain={[0, 100]} 
                  stroke={isDarkMode ? '#64748B' : '#94A3B8'} 
                  tick={{ fontSize: 10 }}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-2 rounded bg-slate-950 border border-slate-800 text-xs font-mono">
                          <div className="text-slate-400 font-bold mb-1">{label}m {data.corner ? `(${data.corner})` : ''}</div>
                          <div className="text-emerald-400">{driver1.code} Throttle: {data.throttle1}% | Brake: {data.brake1}%</div>
                          <div className="text-emerald-300">{driver2.code} Throttle: {data.throttle2}% | Brake: {data.brake2}%</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {/* Driver 1 Throttle & Brake */}
                <Line type="stepAfter" dataKey="throttle1" stroke="#10B981" strokeWidth={2} dot={false} name={`${driver1.code} Throttle`} />
                <Line type="stepAfter" dataKey="brake1" stroke="#EF4444" strokeWidth={2} dot={false} name={`${driver1.code} Brake`} />
                {/* Driver 2 Throttle & Brake (Dashed) */}
                <Line type="stepAfter" dataKey="throttle2" stroke="#34D399" strokeWidth={1.8} strokeDasharray="4 3" dot={false} name={`${driver2.code} Throttle`} />
                <Line type="stepAfter" dataKey="brake2" stroke="#F59E0B" strokeWidth={1.8} strokeDasharray="4 3" dot={false} name={`${driver2.code} Brake`} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Chart 3: Time Delta Trace (+/- Seconds) */}
      {(activeTelemetryTab === 'all' || activeTelemetryTab === 'delta') && (
        <div className={`p-4 sm:p-6 rounded-xl border ${
          isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-racing font-bold text-slate-200 uppercase tracking-wider">
                Time Delta Progression (+/- Seconds)
              </h3>
            </div>
            <div className="text-xs font-mono text-slate-400">
              Negative = <span style={{ color: driver1.teamColor }}>{driver1.code} Ahead</span> • Positive = <span style={{ color: driver2.teamColor }}>{driver2.code} Ahead</span>
            </div>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#1E293B' : '#E2E8F0'} />
                <ReferenceLine y={0} stroke="#EF4444" strokeDasharray="3 3" />
                <XAxis 
                  dataKey="distanceM" 
                  stroke={isDarkMode ? '#64748B' : '#94A3B8'} 
                  tickFormatter={(v) => `${v}m`}
                  tick={{ fontSize: 10 }}
                />
                <YAxis 
                  stroke={isDarkMode ? '#64748B' : '#94A3B8'} 
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => `${v}s`}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-2 rounded bg-slate-950 border border-slate-800 text-xs font-mono">
                          <div className="text-slate-400 font-bold mb-1">{label}m {data.corner ? `(${data.corner})` : ''}</div>
                          <div className="text-slate-200 font-bold">Delta: {data.deltaSeconds}s</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="deltaSeconds" 
                  stroke="#A855F7" 
                  strokeWidth={2.5} 
                  dot={false} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Corner-by-Corner Breakdown Table */}
      <div className={`p-4 sm:p-6 rounded-xl border ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <h3 className="text-sm font-racing font-bold text-slate-200 uppercase tracking-wider mb-3">
          Corner-by-Corner Apex Speed & Braking Comparison
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5 px-3">CORNER</th>
                <th className="py-2.5 px-3">DISTANCE</th>
                <th className="py-2.5 px-3" style={{ color: driver1.teamColor }}>{driver1.code} APEX</th>
                <th className="py-2.5 px-3" style={{ color: driver2.teamColor }}>{driver2.code} APEX</th>
                <th className="py-2.5 px-3">DELTA SPEED</th>
                <th className="py-2.5 px-3">GEAR</th>
                <th className="py-2.5 px-3">TIME DELTA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {keyCorners.map((pt, idx) => {
                const diff = pt.speed1 - pt.speed2;
                return (
                  <tr key={idx} className="hover:bg-slate-800/30 transition">
                    <td className="py-2.5 px-3 font-bold text-slate-200">{pt.corner}</td>
                    <td className="py-2.5 px-3 text-slate-400">{pt.distanceM}m</td>
                    <td className="py-2.5 px-3 font-bold" style={{ color: driver1.teamColor }}>{pt.speed1} km/h</td>
                    <td className="py-2.5 px-3 font-bold" style={{ color: driver2.teamColor }}>{pt.speed2} km/h</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        diff > 0 
                          ? 'bg-blue-600/20 text-blue-400' 
                          : diff < 0 
                          ? 'bg-orange-600/20 text-orange-400' 
                          : 'text-slate-400'
                      }`}>
                        {diff > 0 ? `+${diff} km/h` : `${diff} km/h`}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">G{pt.gear1} / G{pt.gear2}</td>
                    <td className="py-2.5 px-3 font-bold text-purple-400">{pt.deltaSeconds}s</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
