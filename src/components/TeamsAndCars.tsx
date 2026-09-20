import React, { useState } from 'react';
import { CONSTRUCTORS } from '../data/f1Data';
import { Driver, Constructor } from '../types';
import { Car3DViewer } from './Car3DViewer';
import { DriverAvatar } from './DriverAvatar';
import { TeamBadge } from './TeamBadge';
import { TEAM_CAR_LIVERIES } from '../data/driverMedia';
import { 
  Trophy, 
  MapPin, 
  User, 
  Cpu, 
  Flag, 
  Star, 
  LineChart, 
  ShieldCheck, 
  ChevronRight, 
  Car, 
  Gauge, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface TeamsAndCarsProps {
  drivers: Driver[];
  isDarkMode: boolean;
  favoriteDriverIds: string[];
  onToggleFavorite: (driverId: string) => void;
  onSelectDriverForTelemetry: (driverId: string) => void;
  constructors?: Constructor[];
  loading?: boolean;
}

export const TeamsAndCars: React.FC<TeamsAndCarsProps> = ({
  drivers,
  isDarkMode,
  favoriteDriverIds,
  onToggleFavorite,
  onSelectDriverForTelemetry,
  constructors,
  loading = false,
}) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string>('mclaren');
  const [activeDriverCode, setActiveDriverCode] = useState<string>('NOR');

  const availableConstructors = (constructors && constructors.length > 0) ? constructors : CONSTRUCTORS;
  const selectedTeam: Constructor = availableConstructors.find(c => c.id === selectedTeamId) || availableConstructors[0];

  // Drivers for the selected team
  const teamDrivers = drivers.filter(d => 
    selectedTeam.drivers.includes(d.code) || 
    d.team.toLowerCase().includes(selectedTeam.name.toLowerCase().split(' ')[0].toLowerCase())
  );

  const activeDriver = teamDrivers.find(d => d.code === activeDriverCode) || teamDrivers[0] || drivers[0];

  // Detailed Team Chassis & Heritage metadata
  const TEAM_EXTRAS: Record<string, {
    chassis: string;
    techDirector: string;
    championships: number;
    firstEntry: string;
    fastFact: string;
  }> = {
    mclaren: {
      chassis: 'MCL39',
      techDirector: 'Rob Marshall / Peter Prodromou',
      championships: 8,
      firstEntry: '1966 Monaco GP',
      fastFact: 'Known for revolutionary high-downforce aerodynamic floor geometry and extreme tyre management.',
    },
    ferrari: {
      chassis: 'SF-26',
      techDirector: 'Loïc Serra',
      championships: 16,
      firstEntry: '1950 Monaco GP',
      fastFact: 'The most historic and successful constructor in Formula 1 history with over 240 Grand Prix victories.',
    },
    redbull: {
      chassis: 'RB22',
      techDirector: 'Pierre Waché',
      championships: 6,
      firstEntry: '2005 Australian GP',
      fastFact: 'Dominant aerodynamic efficiency and straightline top-end DRS performance powered by Honda RBPT.',
    },
    mercedes: {
      chassis: 'W17',
      techDirector: 'James Allison',
      championships: 8,
      firstEntry: '1954 French GP',
      fastFact: 'Pioneered consecutive V6 turbo-hybrid constructors world championships from 2014 to 2021.',
    },
    williams: {
      chassis: 'FW48',
      techDirector: 'Pat Fry',
      championships: 9,
      firstEntry: '1977 Spanish GP',
      fastFact: 'Historic British engineering powerhouse undergoing technical modernization under James Vowles.',
    },
    astonmartin: {
      chassis: 'AMR26',
      techDirector: 'Dan Fallows / Enrico Cardile',
      championships: 0,
      firstEntry: '1959 Dutch GP',
      fastFact: 'Operating from a brand-new state-of-the-art wind tunnel facility at Silverstone Technology Campus.',
    },
    sauber: {
      chassis: 'C46',
      techDirector: 'James Key',
      championships: 0,
      firstEntry: '1993 South African GP',
      fastFact: 'Transitioning into the official Audi Formula 1 Factory Works project ahead of new powertrain regulations.',
    },
    racingbulls: {
      chassis: 'VCARB 03',
      techDirector: 'Jody Egginton',
      championships: 0,
      firstEntry: '2006 Bahrain GP',
      fastFact: 'Sister squad to Red Bull Racing, utilizing synergistic suspension hardware and wind-tunnel aero testing.',
    },
    alpine: {
      chassis: 'A526',
      techDirector: 'David Sanchez',
      championships: 2,
      firstEntry: '1977 British GP',
      fastFact: 'Enstone engineering heritage with championship victories as Benetton, Renault, and now Alpine.',
    },
    haas: {
      chassis: 'VF-26',
      techDirector: 'Andrea De Zordo',
      championships: 0,
      firstEntry: '2016 Australian GP',
      fastFact: 'Americas F1 squad, working in close technical collaboration with Ferrari in Maranello and Kannapolis.',
    },
  };

  const [viewLayout, setViewLayout] = useState<'carousel' | 'grid'>('grid');

  // Team Origin Flags mapping
  const TEAM_FLAGS: Record<string, { flag: string; country: string }> = {
    mclaren: { flag: '🇬🇧', country: 'United Kingdom' },
    ferrari: { flag: '🇮🇹', country: 'Italy' },
    mercedes: { flag: '🇩🇪', country: 'Germany / UK' },
    redbull: { flag: '🇦🇹', country: 'Austria / UK' },
    williams: { flag: '🇬🇧', country: 'United Kingdom' },
    astonmartin: { flag: '🇬🇧', country: 'United Kingdom' },
    alpine: { flag: '🇫🇷', country: 'France' },
    haas: { flag: '🇺🇸', country: 'United States' },
    racingbulls: { flag: '🇮🇹', country: 'Italy' },
    sauber: { flag: '🇨🇭', country: 'Switzerland' },
  };

  const extras = TEAM_EXTRAS[selectedTeam.id] || {
    chassis: 'Chassis Gen-2026',
    techDirector: 'Technical Department',
    championships: 0,
    firstEntry: 'FIA World Championship',
    fastFact: 'Competing in the 2026 FIA Formula One World Championship.',
  };

  return (
    <div id="constructors-section" className="space-y-8">
      {/* Category Header */}
      <div className={`p-6 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 carbon-pattern ${
        isDarkMode ? 'border-slate-800' : 'bg-slate-900 border-slate-700 text-white'
      }`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-red-600/20 text-red-400 border border-red-500/30">
              CONSTRUCTORS CHAMPIONSHIP
            </span>
            <span className="text-xs text-slate-400 font-mono">10 Official World Teams</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-racing italic font-black tracking-wide text-white uppercase">
            CONSTRUCTORS &amp; TECHNICAL PADDOCK
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Explore all 10 Formula 1 constructors with official power units, origin nations, and interactive 3D ground-effect chassis CAD with authentic livery aerodynamic analysis.
          </p>
        </div>

        {/* View Layout Switcher (Carousel vs Asymmetric 2-Column Grid) */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/90 border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setViewLayout('grid')}
            className={`px-3 py-1.5 rounded-lg transition font-bold uppercase text-[11px] ${
              viewLayout === 'grid' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Asymmetric Grid
          </button>
          <button
            onClick={() => setViewLayout('carousel')}
            className={`px-3 py-1.5 rounded-lg transition font-bold uppercase text-[11px] ${
              viewLayout === 'carousel' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Horizontal Carousel
          </button>
        </div>
      </div>

      {/* Interactive Teams Section ("CONSTRUCTORS") */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span className="font-racing font-bold text-lg text-white uppercase tracking-wider">
              CONSTRUCTORS GRID
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Click any team to inspect 3D Car &amp; Telemetry
          </span>
        </div>

        {/* Layout: Horizontal scrolling carousel OR Asymmetric 2-column grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse h-48" />
            ))}
          </div>
        ) : (
          <div className={
            viewLayout === 'carousel'
              ? 'flex gap-4 overflow-x-auto pb-4 pt-1 snap-x scrollbar-thin'
              : 'grid grid-cols-1 md:grid-cols-2 gap-4'
          }>
            {availableConstructors.map((team, idx) => {
              const isSelected = team.id === selectedTeamId;
              const flagInfo = TEAM_FLAGS[team.id] || { flag: '🏁', country: 'FIA' };
              const teamDriversList = drivers.filter(d => team.drivers.includes(d.code));

              return (
                <div
                  key={team.id}
                  id={`constructor-card-${team.id}`}
                  onClick={() => {
                    setSelectedTeamId(team.id);
                    const firstDrv = team.drivers[0];
                    if (firstDrv) setActiveDriverCode(firstDrv);
                  }}
                  className={`group relative rounded-2xl cyber-cut-card border transition-all duration-300 cursor-pointer overflow-hidden p-5 flex flex-col justify-between ${
                    viewLayout === 'carousel' ? 'min-w-[340px] sm:min-w-[380px] snap-start shrink-0' : ''
                  } ${
                    isSelected 
                      ? 'bg-[#0E131F] border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.25)]' 
                      : 'bg-[#090D15] border-slate-800 hover:border-slate-700 hover:bg-[#0C101B]'
                  }`}
                >
                {/* Team-Colored Ambient Lighting Behind Car Livery Image */}
                <div 
                  className="absolute -right-8 -top-8 w-64 h-64 rounded-full blur-[80px] opacity-25 group-hover:opacity-45 transition-opacity pointer-events-none"
                  style={{ backgroundColor: team.color }}
                />

                {/* Top Neon Border Line */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1 transition-all duration-300"
                  style={{
                    backgroundColor: team.color,
                    boxShadow: isSelected ? `0 0 16px ${team.color}` : 'none'
                  }}
                />

                {/* Header: Team Rank, Origin Flag, Team Name */}
                <div className="flex items-start justify-between gap-3 relative z-10">
                  <div className="flex items-center gap-3">
                    <span 
                      className="w-8 h-8 rounded-xl flex items-center justify-center font-racing font-black text-sm text-slate-950 shadow-md"
                      style={{ backgroundColor: team.color }}
                    >
                      P{team.championshipRank}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        {/* Displaying team origin flag */}
                        <span className="text-base" title={flagInfo.country}>{flagInfo.flag}</span>
                        <span className="text-[11px] font-mono text-slate-400 uppercase">
                          {flagInfo.country}
                        </span>
                      </div>
                      <h3 className="font-racing font-black text-lg sm:text-xl text-white tracking-wide uppercase leading-tight mt-0.5">
                        {team.name}
                      </h3>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-racing font-black text-xl text-amber-400 block leading-none">
                      {team.points}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">POINTS</span>
                  </div>
                </div>

                {/* Car Livery Graphic with Team-Colored Ambient Glow */}
                <div className="relative my-4 py-3 px-2 flex items-center justify-center overflow-hidden rounded-xl bg-black/40 border border-slate-800/80 min-h-[105px]">
                  {/* Ambient Glow Center */}
                  <div 
                    className="absolute w-44 h-24 rounded-full blur-[40px] opacity-35 group-hover:opacity-65 transition-opacity"
                    style={{ backgroundColor: team.color }}
                  />

                  {/* High-Resolution F1 Car Livery Transparent Cutout */}
                  {TEAM_CAR_LIVERIES[team.id] ? (
                    <img
                      src={TEAM_CAR_LIVERIES[team.id]}
                      alt={`${team.name} F1 Car Livery`}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="relative z-10 w-full max-h-24 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)] transform group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    /* Stylized Formula 1 Ground-Effect Car Silhouette Fallback */
                    <svg 
                      className="w-full h-16 max-w-[280px] drop-shadow-[0_10px_15px_rgba(0,0,0,0.8)] transform group-hover:scale-105 transition-transform" 
                      viewBox="0 0 320 80" 
                      fill="none"
                    >
                      {/* Floor and diffuser */}
                      <path d="M 20 65 L 300 65 L 290 55 L 40 55 Z" fill="#151922" />
                      {/* Rear Wing */}
                      <path d="M 20 20 L 45 20 L 40 55 L 25 55 Z" fill={team.secondaryColor || '#1f2937'} />
                      <rect x="15" y="15" width="35" height="6" rx="2" fill={team.color} />
                      {/* Main Chassis Body */}
                      <path d="M 40 45 Q 80 40 120 30 Q 160 22 200 42 L 280 50 L 295 56 L 275 58 L 195 54 L 90 56 Z" fill={team.color} />
                      {/* Cockpit & Halo */}
                      <path d="M 125 30 Q 145 15 165 30 Z" fill="#111827" stroke="#374151" strokeWidth="2" />
                      {/* Sidepod Aero Undercut */}
                      <path d="M 90 44 Q 140 40 180 52 L 85 54 Z" fill="#0b0f19" opacity="0.8" />
                      {/* Front Nose Cone and Front Wing */}
                      <path d="M 240 46 L 305 56 L 310 60 L 250 56 Z" fill={team.color} />
                      <path d="M 270 57 L 315 57 L 312 63 L 265 63 Z" fill={team.secondaryColor || '#222'} />
                      {/* Wheels */}
                      <circle cx="70" cy="55" r="16" fill="#12151c" stroke="#334155" strokeWidth="3" />
                      <circle cx="70" cy="55" r="7" fill={team.color} />
                      <circle cx="250" cy="55" r="16" fill="#12151c" stroke="#334155" strokeWidth="3" />
                      <circle cx="250" cy="55" r="7" fill={team.color} />
                    </svg>
                  )}

                  {/* Team Badge Watermark */}
                  <div className="absolute top-2 right-3 opacity-60">
                    <TeamBadge teamName={team.name} size="sm" />
                  </div>
                </div>

                {/* Technical Specs: Power Unit Supplier & Drivers Lineup */}
                <div className="pt-2 space-y-2 border-t border-slate-800/80 relative z-10">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-red-500" />
                      {/* Displaying power unit supplier */}
                      <span>POWER UNIT:</span>
                    </span>
                    <span className="font-bold text-slate-200 uppercase tracking-tight">
                      {team.powerUnit}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-cyan-400" />
                      <span>PILOTS:</span>
                    </span>
                    <div className="flex items-center gap-2">
                      {teamDriversList.map(d => (
                        <span 
                          key={d.id} 
                          className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] font-bold text-white"
                        >
                          #{d.number} {d.lastName}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Inspect in 3D Button */}
                <div className="mt-3 pt-2 flex items-center justify-between text-[11px] font-mono text-cyan-400">
                  <span>{isSelected ? 'Currently Loaded in 3D Viewer' : 'Click to Load 3D CAD'}</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>

      {/* Main Grid: 3D Car Model Viewer & Team Metadata */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Center 3D Car CAD Model Viewer (8 Columns) */}
        <div className="lg:col-span-8 space-y-6">
          <Car3DViewer
            primaryColor={selectedTeam.color}
            secondaryColor={selectedTeam.secondaryColor}
            teamName={selectedTeam.name}
            driverName={`${activeDriver?.firstName || ''} ${activeDriver?.lastName || ''}`}
            driverNumber={activeDriver?.number || 1}
            isDarkMode={isDarkMode}
          />
        </div>

        {/* Right Constructor Profile Card (4 Columns) */}
        <div className="lg:col-span-4 space-y-4">
          <div className={`p-5 rounded-2xl border space-y-4 ${
            isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            {/* Team Banner */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
              <div className="flex items-center gap-2.5">
                <span 
                  className="w-4 h-4 rounded-full border border-white/50" 
                  style={{ backgroundColor: selectedTeam.color }}
                />
                <div>
                  <h3 className="font-racing font-bold text-base leading-tight">
                    {selectedTeam.name}
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">
                    Chassis: {extras.chassis}
                  </span>
                </div>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-red-600/15 border border-red-500/30 text-red-400 text-xs font-mono font-black">
                RANK #{selectedTeam.championshipRank}
              </div>
            </div>

            {/* Quick Spec Metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className="text-[10px] text-slate-400 block uppercase">2026 Points</span>
                <span className="text-base font-racing font-bold text-red-500">{selectedTeam.points}</span>
              </div>
              <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className="text-[10px] text-slate-400 block uppercase">World Titles</span>
                <span className="text-base font-racing font-bold text-amber-400">{extras.championships}</span>
              </div>
            </div>

            {/* Technical Specifications */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-800/30">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  Headquarters
                </span>
                <span className="font-medium truncate text-right">{selectedTeam.base}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/30">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  Team Principal
                </span>
                <span className="font-medium text-right">{selectedTeam.teamPrincipal}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/30">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-slate-500" />
                  Technical Lead
                </span>
                <span className="font-medium text-right text-xs truncate max-w-[170px]">{extras.techDirector}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/30">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-slate-500" />
                  Power Unit
                </span>
                <span className="font-medium text-right text-red-400 font-mono text-[11px]">{selectedTeam.powerUnit}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/30">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Flag className="w-3.5 h-3.5 text-slate-500" />
                  F1 Debut
                </span>
                <span className="font-medium text-right text-slate-300 font-mono">{extras.firstEntry}</span>
              </div>
            </div>

            {/* Fast Fact Note */}
            <div className={`p-3 rounded-xl border text-[11px] leading-relaxed text-slate-400 ${
              isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <span className="font-bold text-slate-200 block mb-0.5">Engineering Insight:</span>
              {extras.fastFact}
            </div>
          </div>
        </div>
      </div>

      {/* Current Official Drivers for This Team */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-red-500" />
            <h3 className="font-racing font-bold text-base sm:text-lg">
              CURRENT OFFICIAL DRIVERS ({selectedTeam.name})
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">2026 Active Driver Lineup</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teamDrivers.map((driver) => {
            const isFav = favoriteDriverIds.includes(driver.id);
            const isCarDriver = activeDriverCode === driver.code;

            return (
              <div
                key={driver.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isCarDriver
                    ? isDarkMode
                      ? 'bg-slate-900/90 border-red-500/60 shadow-lg shadow-red-600/10'
                      : 'bg-red-50/50 border-red-300 shadow-md'
                    : isDarkMode
                    ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Driver Number & Identity */}
                  <div className="flex items-center gap-3.5">
                    <DriverAvatar
                      driverId={driver.id}
                      driverCode={driver.code}
                      firstName={driver.firstName}
                      lastName={driver.lastName}
                      number={driver.number}
                      teamColor={driver.teamColor}
                      size="lg"
                      className="ring-2 ring-slate-800"
                    />
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-racing font-black text-lg text-white shadow-md shrink-0"
                      style={{ backgroundColor: driver.teamColor }}
                    >
                      #{driver.number}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-400 uppercase font-semibold">
                          {driver.countryCode} • {driver.code}
                        </span>
                        {isCarDriver && (
                          <span className="px-2 py-0.2 rounded text-[9px] font-mono font-bold bg-red-600 text-white uppercase">
                            Car 3D Model
                          </span>
                        )}
                      </div>
                      <h4 className="text-lg font-racing font-bold tracking-tight">
                        {driver.firstName} <span className="uppercase">{driver.lastName}</span>
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                        <TeamBadge teamName={driver.team} size="xs" />
                        <span>{driver.team}</span>
                      </div>
                    </div>
                  </div>

                  {/* Favorite Toggle Button */}
                  <button
                    onClick={() => onToggleFavorite(driver.id)}
                    className={`p-2 rounded-xl border transition ${
                      isFav 
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' 
                        : isDarkMode
                        ? 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
                        : 'bg-slate-100 text-slate-500 border-slate-200 hover:text-slate-900'
                    }`}
                    title={isFav ? 'Remove from favorites' : 'Add to favorite drivers'}
                  >
                    <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400' : ''}`} />
                  </button>
                </div>

                {/* Driver Performance Metrics */}
                <div className="mt-4 pt-3 border-t border-slate-800/60 grid grid-cols-4 gap-2 text-center font-mono">
                  <div className={`p-2 rounded-xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800/60' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="text-[10px] text-slate-400 block uppercase">Rank</span>
                    <span className="text-sm font-bold text-red-500">P{driver.currentPosition}</span>
                  </div>
                  <div className={`p-2 rounded-xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800/60' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="text-[10px] text-slate-400 block uppercase">Points</span>
                    <span className="text-sm font-bold">{driver.points}</span>
                  </div>
                  <div className={`p-2 rounded-xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800/60' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="text-[10px] text-slate-400 block uppercase">Wins</span>
                    <span className="text-sm font-bold text-amber-400">{driver.wins}</span>
                  </div>
                  <div className={`p-2 rounded-xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800/60' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="text-[10px] text-slate-400 block uppercase">Podiums</span>
                    <span className="text-sm font-bold text-slate-300">{driver.podiums}</span>
                  </div>
                </div>

                {/* Driver Action Buttons */}
                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => setActiveDriverCode(driver.code)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                      isCarDriver
                        ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                        : isDarkMode
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    <Car className="w-3.5 h-3.5" />
                    <span>{isCarDriver ? 'Car Loaded in 3D' : 'Apply to 3D Car Model'}</span>
                  </button>

                  <button
                    onClick={() => onSelectDriverForTelemetry(driver.id)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                      isDarkMode 
                        ? 'border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white' 
                        : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                    title="View Telemetry Analysis in Studio"
                  >
                    <LineChart className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Telemetry</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
