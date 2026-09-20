import React, { useState } from 'react';
import { Driver } from '../types';
import { Trophy, Star, Zap, Activity, ChevronRight, Gauge, Flag } from 'lucide-react';
import { DriverAvatar } from './DriverAvatar';
import { TeamBadge } from './TeamBadge';
import { DRIVER_PORTRAITS } from '../data/driverMedia';

interface GridLeadersProps {
  drivers: Driver[];
  isDarkMode: boolean;
  favoriteDriverIds: string[];
  onToggleFavorite: (id: string) => void;
  onSelectDriverForTelemetry: (id: string) => void;
  loading?: boolean;
}

// Sub-component for individual driver card with image error handling
interface DriverCardItemProps {
  driver: Driver;
  rank: number;
  leaderPoints: number;
  isFavorite: boolean;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onSelect: () => void;
  onToggleFav: () => void;
  isDarkMode: boolean;
}

const DriverCardItem: React.FC<DriverCardItemProps> = ({
  driver,
  rank,
  leaderPoints,
  isFavorite,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  onSelect,
  onToggleFav,
  isDarkMode,
}) => {
  const [imageError, setImageError] = useState(false);
  const pointsShare = ((driver.points / Math.max(1, leaderPoints)) * 100).toFixed(0);
  const initialPortrait = driver.headshotUrl || DRIVER_PORTRAITS[driver.id.toLowerCase()];

  return (
    <div
      id={`driver-card-${driver.id}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onSelect}
      className={`group relative rounded-3xl overflow-hidden border transition-all duration-300 cursor-pointer shadow-xl cyber-card ${
        isHovered
          ? 'scale-[1.02] -translate-y-1 z-20 shadow-2xl'
          : 'hover:border-slate-700'
      } ${
        isDarkMode
          ? 'bg-slate-950/90 border-slate-800'
          : 'bg-white border-slate-200'
      }`}
      style={{
        borderColor: isHovered ? driver.teamColor : undefined,
      }}
    >
      {/* Team Color Vertical Accent Bar with Neon Glow */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-2 transition-all duration-300 group-hover:w-2.5"
        style={{ 
          backgroundColor: driver.teamColor,
          boxShadow: isHovered 
            ? `0 0 20px ${driver.teamColor}` 
            : `0 0 10px ${driver.teamColor}`,
        }}
      />

      {/* Ambient Background Gradient based on Team Color */}
      <div 
        className="absolute inset-0 opacity-20 group-hover:opacity-35 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 80% 35%, ${driver.teamColor} 0%, transparent 65%)`
        }}
      />

      <div className="p-6 pl-7 flex flex-col justify-between h-full relative z-10">
        {/* Top Row: Standings Position Badge & Outlined Driver Number */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span 
              className={`cyber-cut-badge px-3 py-1.5 text-xs sm:text-sm font-racing font-black tracking-wider flex items-center gap-1.5 shadow-md ${
                rank === 1 ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-bold' :
                rank === 2 ? 'bg-gradient-to-r from-slate-200 to-slate-400 text-slate-950 font-bold' :
                rank === 3 ? 'bg-gradient-to-r from-amber-700 to-amber-900 text-white font-bold' :
                'bg-slate-800/95 text-slate-200 border border-slate-700 font-semibold'
              }`}
            >
              POSITION {rank}
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFav();
              }}
              className="p-1.5 rounded-lg hover:bg-slate-800 transition"
              aria-label={`Favorite ${driver.lastName}`}
            >
              <Star className={`w-4 h-4 sm:w-5 sm:h-5 transition ${
                isFavorite ? 'fill-amber-400 text-amber-400' : 'text-slate-600 hover:text-slate-400'
              }`} />
            </button>
          </div>

          {/* Driver Number in Outline Text (#1, #4, #12, etc.) */}
          <div className="outline-driver-number text-4xl sm:text-5xl tracking-tighter">
            #{driver.number}
          </div>
        </div>

        {/* Large High-Resolution Transparent Cutout Portrait with Fallback */}
        <div className="relative h-72 sm:h-80 w-full flex items-end justify-center overflow-hidden my-3">
          {/* Giant Semi-Transparent Driver Number in Background for Monumental Depth */}
          <div 
            className="absolute left-1 bottom-2 font-motorsport italic font-black text-7xl sm:text-8xl lg:text-9xl text-white/[0.06] select-none pointer-events-none tracking-tighter"
            aria-hidden="true"
          >
            #{driver.number}
          </div>

          {/* Team-colored intense ambient halo */}
          <div 
            className="absolute right-4 bottom-6 w-48 h-48 rounded-full blur-[45px] opacity-30 group-hover:opacity-60 transition-opacity pointer-events-none"
            style={{ backgroundColor: driver.teamColor }}
          />

          {/* High-Resolution Driver Cutout PNG Image with Fallback Image on Error */}
          {initialPortrait && !imageError ? (
            <img
              src={initialPortrait}
              alt={`${driver.firstName} ${driver.lastName}`}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="relative z-10 max-h-72 sm:max-h-80 object-contain object-bottom drop-shadow-[0_20px_35px_rgba(0,0,0,0.95)] transform group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          ) : (
            /* Fallback Card Portrait: Stylized Driver Avatar & Silhouette */
            <div className="relative z-10 mb-6 flex flex-col items-center justify-center p-6 text-center">
              <div 
                className="w-32 h-32 rounded-full border-2 flex items-center justify-center shadow-2xl relative mb-3"
                style={{ borderColor: driver.teamColor, backgroundColor: `${driver.teamColor}20` }}
              >
                <div 
                  className="font-motorsport italic font-black text-3xl text-white drop-shadow-md"
                >
                  {driver.code}
                </div>
                <div 
                  className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full text-xs font-mono font-bold text-slate-950 shadow-md"
                  style={{ backgroundColor: driver.teamColor }}
                >
                  #{driver.number}
                </div>
              </div>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                {driver.team}
              </span>
            </div>
          )}
        </div>

        {/* Driver Identity: First name light gray, Last name large uppercase italic white */}
        <div className="mt-2 mb-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-mono text-slate-400 uppercase tracking-wider">
            <span>{driver.firstName}</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-800/90 text-[10px] sm:text-[11px] font-mono font-bold text-slate-300 border border-slate-700/60">
              {driver.code}
            </span>
            <span className="text-xs">{driver.country}</span>
          </div>

          <h3 className="text-3xl sm:text-4xl font-motorsport italic font-black text-white tracking-tight leading-tight uppercase group-hover:text-red-400 transition-colors">
            {driver.lastName}
          </h3>

          <div className="flex items-center gap-2 mt-1">
            <span 
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: driver.teamColor }}
            />
            <span className="text-xs sm:text-sm font-mono text-slate-300 font-semibold tracking-wide">
              {driver.team}
            </span>
          </div>
        </div>

        {/* Driver Championship Points Bar */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400">CHAMPIONSHIP POINTS</span>
            <span className="text-sm font-racing font-black text-red-400">
              {driver.points} <span className="text-[10px] text-slate-400">PTS</span>
            </span>
          </div>

          {/* Progress bar towards leader */}
          <div className="w-full bg-slate-800/90 h-2 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${Math.max(5, Number(pointsShare))}%`,
                backgroundColor: driver.teamColor 
              }}
            />
          </div>

          <div className="flex justify-between text-[11px] font-mono text-slate-400 pt-0.5">
            <span>WINS: <strong className="text-white">{driver.wins}</strong></span>
            <span>PODIUMS: <strong className="text-white">{driver.podiums}</strong></span>
            <span>GRID: <strong className="text-cyan-400">P{driver.gridPosition || rank}</strong></span>
          </div>
        </div>
      </div>

      {/* Hover Telemetry Overlay */}
      <div 
        className={`absolute inset-0 bg-slate-950/95 backdrop-blur-md p-6 flex flex-col justify-between transition-opacity duration-200 z-30 pointer-events-none ${
          isHovered ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs font-mono text-red-400 uppercase tracking-widest block">
              LIVE CAR TELEMETRY
            </span>
            <div className="text-xl font-motorsport font-black text-white uppercase">
              {driver.firstName} {driver.lastName}
            </div>
            <span className="text-xs font-mono text-slate-400">{driver.team}</span>
          </div>
          <span className="px-2.5 py-1 rounded-lg text-xs font-racing font-black bg-red-600 text-white">
            P{rank}
          </span>
        </div>

        {/* Telemetry Metrics */}
        <div className="space-y-3.5 my-auto">
          <div>
            <div className="flex justify-between text-xs font-mono text-slate-300 mb-1.5">
              <span>TOP SPEED (BAKU CITY CIRCUIT)</span>
              <span className="font-bold text-cyan-300">{driver.speedTrapKmH || 348.6} KM/H</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                style={{ width: `${Math.min(100, ((driver.speedTrapKmH || 345) / 360) * 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono text-slate-300 mb-1.5">
              <span>THROTTLE TRACE</span>
              <span className="font-bold text-emerald-400">98.5% FULL THROTTLE</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full w-[98%]" />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono text-slate-300 mb-1.5">
              <span>TYRE COMPOUND / LAPS</span>
              <span className="font-bold text-yellow-400">{driver.currentTyre} • {driver.tyreLaps} LAPS</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-400 rounded-full w-[65%]" />
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-cyan-400">
          <span>Click card to inspect telemetry dynamics</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

export const GridLeaders: React.FC<GridLeadersProps> = ({
  drivers,
  isDarkMode,
  favoriteDriverIds,
  onToggleFavorite,
  onSelectDriverForTelemetry,
  loading = false,
}) => {
  const [hoveredDriverId, setHoveredDriverId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'top10' | 'favorites'>('all');

  // Sort drivers by championship points
  const sortedDrivers = [...drivers].sort((a, b) => b.points - a.points);
  const leaderPoints = sortedDrivers[0]?.points || 1;

  const filteredDrivers = sortedDrivers.filter((driver, idx) => {
    if (filter === 'top10') return idx < 10;
    if (filter === 'favorites') return favoriteDriverIds.includes(driver.id);
    return true;
  });

  return (
    <section id="grid-leaders-section" className="space-y-6">
      {/* Section Header: 2026 DRIVERS GRID */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-800 carbon-pattern shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-red-600/20 text-red-400 border border-red-500/30 uppercase tracking-widest">
              FIA F1 2026 SEASON
            </span>
            <span className="text-xs font-mono text-slate-400">WORLD DRIVERS CHAMPIONSHIP</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-motorsport italic font-black tracking-wide text-white uppercase flex items-center gap-3">
            <span>2026 DRIVERS GRID</span>
            <span className="text-red-500 text-xs font-mono not-italic font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
              {filteredDrivers.length} PILOTS
            </span>
          </h2>
        </div>

        {/* Filter Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition font-bold uppercase text-[11px] ${
              filter === 'all' ? 'bg-red-600 text-white shadow-md shadow-red-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            All 20 Grid
          </button>
          <button
            onClick={() => setFilter('top10')}
            className={`px-3 py-1.5 rounded-lg transition font-bold uppercase text-[11px] ${
              filter === 'top10' ? 'bg-red-600 text-white shadow-md shadow-red-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Top 10 Leaders
          </button>
          <button
            onClick={() => setFilter('favorites')}
            className={`px-3 py-1.5 rounded-lg transition font-bold uppercase text-[11px] flex items-center gap-1.5 ${
              filter === 'favorites' ? 'bg-red-600 text-white shadow-md shadow-red-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>Favorites</span>
          </button>
        </div>
      </div>

      {/* Grid of Driver Cards with Fallbacks & Loading Skeletons */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div 
              key={idx}
              className="rounded-3xl p-6 bg-slate-900/60 border border-slate-800 animate-pulse flex flex-col justify-between h-[520px]"
            >
              <div className="flex justify-between items-center">
                <div className="w-28 h-6 bg-slate-800 rounded-lg" />
                <div className="w-12 h-10 bg-slate-800 rounded-lg" />
              </div>
              <div className="w-48 h-64 mx-auto bg-slate-800/80 rounded-2xl my-4" />
              <div className="space-y-2">
                <div className="w-20 h-4 bg-slate-800 rounded" />
                <div className="w-40 h-8 bg-slate-800 rounded" />
              </div>
              <div className="w-full h-16 bg-slate-800/60 rounded-xl mt-4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredDrivers.map((driver) => {
            const rank = sortedDrivers.findIndex(d => d.id === driver.id) + 1;
            const isFavorite = favoriteDriverIds.includes(driver.id);
            const isHovered = hoveredDriverId === driver.id;

            return (
              <DriverCardItem
                key={driver.id}
                driver={driver}
                rank={rank}
                leaderPoints={leaderPoints}
                isFavorite={isFavorite}
                isHovered={isHovered}
                onMouseEnter={() => setHoveredDriverId(driver.id)}
                onMouseLeave={() => setHoveredDriverId(null)}
                onSelect={() => onSelectDriverForTelemetry(driver.id)}
                onToggleFav={() => onToggleFavorite(driver.id)}
                isDarkMode={isDarkMode}
              />
            );
          })}
        </div>
      )}
    </section>
  );
};
