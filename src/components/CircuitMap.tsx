import React, { useState, useEffect } from 'react';
import { CIRCUITS } from '../data/f1Data';
import { CircuitInfo, CircuitCorner, Driver } from '../types';
import { MapPin, Zap, Gauge, Flame, RotateCcw, Info, Compass, Maximize2 } from 'lucide-react';

interface CircuitMapProps {
  drivers: Driver[];
  isDarkMode: boolean;
  selectedDriverId?: string;
  onSelectDriver?: (id: string) => void;
}

export const CircuitMap: React.FC<CircuitMapProps> = ({
  drivers,
  isDarkMode,
  selectedDriverId,
  onSelectDriver,
}) => {
  const [selectedCircuitId, setSelectedCircuitId] = useState<string>('baku');
  const [selectedCorner, setSelectedCorner] = useState<CircuitCorner | null>(null);

  const [showCorners, setShowCorners] = useState(true);
  const [showDrsZones, setShowDrsZones] = useState(true);
  const [showSectors, setShowSectors] = useState(true);
  const [animatedCars, setAnimatedCars] = useState<{ id: string; code: string; color: string; x: number; y: number }[]>([]);

  const circuit: CircuitInfo = CIRCUITS.find(c => c.id === selectedCircuitId) || CIRCUITS[0];

  // Set default corner when circuit changes
  useEffect(() => {
    if (circuit.corners.length > 0) {
      setSelectedCorner(circuit.corners[0]);
    }
  }, [selectedCircuitId]);

  // Compute car positions along the SVG path using SVG path interpolation
  useEffect(() => {
    // Generate simulated dynamic position dots for top 10 cars around the path
    const pathElem = document.getElementById(`circuit-svg-path-${circuit.id}`) as unknown as SVGPathElement;
    if (!pathElem) return;

    try {
      const totalLen = pathElem.getTotalLength();
      const topCars = drivers.slice(0, 10).map((d) => {
        // Offset each car by their trackProgress
        const dist = (d.trackProgress % 1.0) * totalLen;
        const pt = pathElem.getPointAtLength(dist);
        return {
          id: d.id,
          code: d.code,
          color: d.teamColor,
          x: pt.x,
          y: pt.y,
        };
      });
      setAnimatedCars(topCars);
    } catch {
      // Fallback if SVG not yet in DOM
    }
  }, [circuit, drivers]);

  return (
    <div className="space-y-6">
      {/* Top Header & Circuit Switcher */}
      <div className={`p-4 sm:p-5 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-600/20 text-red-400 border border-red-500/30 uppercase">
              Interactive Track Inspector
            </span>
            <span className="text-xs text-slate-400">Sector Analysis & DRS Mapping</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-racing font-bold tracking-wide mt-1 text-slate-100 flex items-center gap-2">
            <span>{circuit.name}</span>
            <span className="text-sm font-normal text-slate-400">({circuit.country})</span>
          </h2>
        </div>

        {/* Circuit Pill Selector */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-lg border border-slate-800 bg-slate-950/60">
          {CIRCUITS.map((c) => (
            <button
              key={c.id}
              id={`select-circuit-${c.id}`}
              onClick={() => setSelectedCircuitId(c.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold tracking-wider uppercase transition ${
                selectedCircuitId === c.id
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {c.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SVG Track Display (8 cols) */}
        <div className={`lg:col-span-8 p-4 sm:p-6 rounded-xl border flex flex-col justify-between relative overflow-hidden ${
          isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          {/* Map Layer Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono text-slate-400">OVERLAYS:</span>
              <button
                onClick={() => setShowCorners(!showCorners)}
                className={`px-2 py-1 rounded text-[11px] font-mono font-semibold border transition ${
                  showCorners 
                    ? 'bg-red-600/20 text-red-400 border-red-500/40' 
                    : 'text-slate-500 border-slate-800'
                }`}
              >
                Turn Numbers
              </button>
              <button
                onClick={() => setShowDrsZones(!showDrsZones)}
                className={`px-2 py-1 rounded text-[11px] font-mono font-semibold border transition ${
                  showDrsZones 
                    ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40' 
                    : 'text-slate-500 border-slate-800'
                }`}
              >
                DRS Zones ({circuit.drsZonesCount})
              </button>
              <button
                onClick={() => setShowSectors(!showSectors)}
                className={`px-2 py-1 rounded text-[11px] font-mono font-semibold border transition ${
                  showSectors 
                    ? 'bg-blue-600/20 text-blue-400 border-blue-500/40' 
                    : 'text-slate-500 border-slate-800'
                }`}
              >
                Sectors
              </button>
            </div>

            <div className="text-[11px] font-mono text-slate-400 flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block shadow-sm" />
                DRS Active
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block shadow-sm" />
                Heavy Braking
              </span>
            </div>
          </div>

          {/* SVG Canvas */}
          <div className="relative w-full aspect-[4/3] flex items-center justify-center my-4">
            {/* Grid backdrop */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:16px_16px]" />

            <svg
              viewBox={circuit.viewBox}
              className="w-full h-full max-h-[460px] drop-shadow-xl select-none"
            >
              <defs>
                <linearGradient id={`trackGradient-${circuit.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#E8002D" />
                  <stop offset="50%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>

                <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Underlying wide track surface */}
              <path
                d={circuit.svgPath}
                fill="none"
                stroke={isDarkMode ? '#1E293B' : '#E2E8F0'}
                strokeWidth="28"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Racing line asphalt */}
              <path
                id={`circuit-svg-path-${circuit.id}`}
                d={circuit.svgPath}
                fill="none"
                stroke={isDarkMode ? '#0F172A' : '#CBD5E1'}
                strokeWidth="20"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Coloured racing trajectory line */}
              <path
                d={circuit.svgPath}
                fill="none"
                stroke={showSectors ? `url(#trackGradient-${circuit.id})` : '#E8002D'}
                strokeWidth="4"
                strokeDasharray="4 2"
                strokeOpacity="0.85"
              />

              {/* Corners & Waypoints */}
              {showCorners && circuit.corners.map((corner) => {
                const isSelected = selectedCorner?.number === corner.number;
                return (
                  <g
                    key={corner.number}
                    onClick={() => setSelectedCorner(corner)}
                    className="cursor-pointer group"
                  >
                    {/* Pulsing ring on selection */}
                    {isSelected && (
                      <circle
                        cx={corner.x}
                        cy={corner.y}
                        r="18"
                        fill="none"
                        stroke="#EF4444"
                        strokeWidth="2"
                        className="animate-ping opacity-75"
                      />
                    )}

                    <circle
                      cx={corner.x}
                      cy={corner.y}
                      r={isSelected ? "11" : "8"}
                      fill={corner.drsZone && showDrsZones ? '#10B981' : isSelected ? '#EF4444' : '#1E293B'}
                      stroke={isSelected ? '#FFFFFF' : '#475569'}
                      strokeWidth="2"
                      className="transition-all duration-200 group-hover:r-10"
                    />

                    <text
                      x={corner.x}
                      y={corner.y + 4}
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                      className="pointer-events-none select-none"
                    >
                      {corner.number}
                    </text>
                  </g>
                );
              })}

              {/* Live animated cars along track */}
              {animatedCars.map((car, idx) => (
                <g key={car.id} className="transition-all duration-700">
                  <circle
                    cx={car.x}
                    cy={car.y}
                    r="9"
                    fill={car.color}
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    filter="url(#neon-glow)"
                  />
                  <text
                    x={car.x}
                    y={car.y + 3}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="7"
                    fontWeight="900"
                    fontFamily="monospace"
                  >
                    {car.code}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Sector Legend */}
          <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800/80 font-mono">
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-1.5 rounded bg-red-500" />
                Sector 1 (Turns 1 - 7)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-1.5 rounded bg-blue-500" />
                Sector 2 (Turns 8 - 14)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-1.5 rounded bg-emerald-500" />
                Sector 3 (Turns 15 - 18)
              </span>
            </div>
            <span className="text-slate-400 hidden sm:inline">Click any corner number to view telemetry data</span>
          </div>
        </div>

        {/* Right Corner Telemetry & Circuit Specs (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Selected Corner Telemetry Inspector Card */}
          {selectedCorner ? (
            <div className={`p-5 rounded-xl border relative overflow-hidden ${
              isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-red-600 text-white font-mono font-bold text-xs flex items-center justify-center">
                    T{selectedCorner.number}
                  </span>
                  <div>
                    <h3 className="text-base font-racing font-bold text-slate-100 uppercase tracking-wide">
                      {selectedCorner.name || `Turn ${selectedCorner.number}`}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">Telemetry Apex Diagnostics</p>
                  </div>
                </div>

                {selectedCorner.drsZone && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    DRS ACTIVATION
                  </span>
                )}
              </div>

              {/* Telemetry Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className={`p-3 rounded-lg border ${
                  isDarkMode ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>APEX SPEED</span>
                    <Gauge className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div className="text-xl font-mono font-bold text-slate-100 mt-1">
                    {selectedCorner.speedKmH} <span className="text-xs font-normal text-slate-400">km/h</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-blue-500 h-full rounded-full" 
                      style={{ width: `${Math.min(100, (selectedCorner.speedKmH / 340) * 100)}%` }} 
                    />
                  </div>
                </div>

                <div className={`p-3 rounded-lg border ${
                  isDarkMode ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>GEAR AT APEX</span>
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="text-xl font-mono font-bold text-amber-400 mt-1">
                    GEAR {selectedCorner.gear}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-2">
                    RPM: ~11,400 revs
                  </div>
                </div>

                <div className={`p-3 rounded-lg border ${
                  isDarkMode ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>BRAKING DECEL</span>
                    <Zap className="w-3.5 h-3.5 text-red-400" />
                  </div>
                  <div className="text-xl font-mono font-bold text-red-400 mt-1">
                    {selectedCorner.brakingG > 0 ? `-${selectedCorner.brakingG} G` : 'FLAT OUT'}
                  </div>
                  <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-red-500 h-full rounded-full" 
                      style={{ width: `${Math.min(100, (selectedCorner.brakingG / 5.5) * 100)}%` }} 
                    />
                  </div>
                </div>

                <div className={`p-3 rounded-lg border ${
                  isDarkMode ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>LINE PROFILE</span>
                    <Compass className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-sm font-mono font-bold text-slate-200 mt-1.5">
                    {selectedCorner.brakingG >= 4 ? 'HEAVY TRAIL-BRAKE' : selectedCorner.brakingG >= 2 ? 'LIFT & SQUEEZE' : 'HIGH DOWNFORCE'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-1">
                    Ideal Kerb Hook
                  </div>
                </div>
              </div>

              <div className="mt-4 p-2.5 rounded-lg bg-red-950/20 border border-red-900/30 text-xs text-slate-300">
                <span className="font-bold text-red-400 font-mono">RACE ENGINEER NOTE:</span> Watch kerb compliance on exit. Car #4 (Norris) gains +0.07s here through later apex placement and aggressive throttle ramp.
              </div>
            </div>
          ) : null}

          {/* Track Technical Profile Card */}
          <div className={`p-5 rounded-xl border space-y-4 ${
            isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <h3 className="text-sm font-racing font-bold text-slate-200 tracking-wider uppercase flex items-center justify-between">
              <span>Circuit Specifications</span>
              <Info className="w-3.5 h-3.5 text-slate-500" />
            </h3>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex items-center justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">TRACK LENGTH</span>
                <span className="font-bold text-slate-100">{circuit.lengthKm} km</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">RACE DISTANCE</span>
                <span className="font-bold text-slate-100">{circuit.laps} Laps ({(circuit.lengthKm * circuit.laps).toFixed(1)} km)</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">TURNS / CORNERS</span>
                <span className="font-bold text-slate-100">{circuit.turns} ({circuit.corners.length} Key Monitored)</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">DRS DETECTION ZONES</span>
                <span className="font-bold text-emerald-400">{circuit.drsZonesCount} Zones</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">OFFICIAL LAP RECORD</span>
                <div className="text-right">
                  <span className="font-bold text-purple-400">{circuit.lapRecord.time}</span>
                  <div className="text-[10px] text-slate-400">{circuit.lapRecord.driver} ({circuit.lapRecord.year})</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
