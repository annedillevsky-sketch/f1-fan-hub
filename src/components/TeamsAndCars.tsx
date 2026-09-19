import React, { useState } from 'react';
import { CONSTRUCTORS } from '../data/f1Data';
import { Driver, Constructor } from '../types';
import { Car3DViewer } from './Car3DViewer';
import { DriverAvatar } from './DriverAvatar';
import { TeamBadge } from './TeamBadge';
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
}

export const TeamsAndCars: React.FC<TeamsAndCarsProps> = ({
  drivers,
  isDarkMode,
  favoriteDriverIds,
  onToggleFavorite,
  onSelectDriverForTelemetry,
}) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string>('mclaren');
  const [activeDriverCode, setActiveDriverCode] = useState<string>('NOR');

  const selectedTeam: Constructor = CONSTRUCTORS.find(c => c.id === selectedTeamId) || CONSTRUCTORS[0];

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

  const extras = TEAM_EXTRAS[selectedTeam.id] || {
    chassis: 'Chassis Gen-2026',
    techDirector: 'Technical Department',
    championships: 0,
    firstEntry: 'FIA World Championship',
    fastFact: 'Competing in the 2026 FIA Formula One World Championship.',
  };

  return (
    <div className="space-y-6">
      {/* Category Header */}
      <div className={`p-6 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
        isDarkMode ? 'bg-gradient-to-r from-slate-900 via-[#0D121D] to-slate-900 border-slate-800' : 'bg-gradient-to-r from-white via-slate-50 to-white border-slate-200'
      }`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-red-600/20 text-red-400 border border-red-500/30">
              2026 Paddock Garage
            </span>
            <span className="text-xs text-slate-400 font-mono">10 Official Constructors</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-racing font-extrabold tracking-wide">
            TEAMS, DRIVERS & 3D CAR CAD
          </h2>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            Inspect all 10 competing Formula 1 teams, their official race drivers, and interact with the full 3D ground-effect chassis model with authentic team liveries and aerodynamic telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-xl border text-right font-mono ${
            isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <span className="text-[10px] text-slate-400 block uppercase">Selected Team</span>
            <span className="text-sm font-bold text-red-500 font-racing">{selectedTeam.name.split(' ')[0]}</span>
          </div>
        </div>
      </div>

      {/* Horizontal Team Selector Badges */}
      <div className="overflow-x-auto no-scrollbar pb-1">
        <div className="flex items-center gap-2 min-w-max">
          {CONSTRUCTORS.map((team) => {
            const isSelected = team.id === selectedTeamId;
            return (
              <button
                key={team.id}
                id={`team-select-${team.id}`}
                onClick={() => {
                  setSelectedTeamId(team.id);
                  const firstDrv = team.drivers[0];
                  if (firstDrv) setActiveDriverCode(firstDrv);
                }}
                className={`px-3.5 py-2 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                  isSelected
                    ? isDarkMode
                      ? 'bg-slate-900 border-red-500 text-white shadow-lg shadow-red-600/10 scale-105'
                      : 'bg-white border-red-500 text-slate-950 shadow-md scale-105'
                    : isDarkMode
                    ? 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    : 'bg-slate-100/80 border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900'
                }`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm border border-white/30"
                  style={{ backgroundColor: team.color }}
                />
                <div>
                  <span className="text-xs font-bold font-racing block leading-tight">
                    {team.name.replace(' Formula 1 Team', '').replace(' Team', '').replace(' HP', '').replace(' PETRONAS', '')}
                  </span>
                  <span className="text-[10px] font-mono opacity-60">
                    P{team.championshipRank} • {team.points} PTS
                  </span>
                </div>
              </button>
            );
          })}
        </div>
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
