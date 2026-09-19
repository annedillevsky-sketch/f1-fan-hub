import React, { useState } from 'react';
import { Driver, Constructor } from '../types';
import { CONSTRUCTORS } from '../data/f1Data';
import { Trophy, Award, Shield, Users, Star, ArrowUpRight, TrendingUp } from 'lucide-react';
import { DriverAvatar } from './DriverAvatar';
import { TeamBadge } from './TeamBadge';

interface DriverStandingsProps {
  drivers: Driver[];
  isDarkMode: boolean;
  favoriteDriverIds: string[];
  onToggleFavorite: (id: string) => void;
  onSelectDriverForTelemetry: (id: string) => void;
}

export const DriverStandings: React.FC<DriverStandingsProps> = ({
  drivers,
  isDarkMode,
  favoriteDriverIds,
  onToggleFavorite,
  onSelectDriverForTelemetry,
}) => {
  const [standingsTab, setStandingsTab] = useState<'drivers' | 'constructors' | 'headtohead'>('drivers');

  // Sort drivers by championship points
  const sortedDrivers = [...drivers].sort((a, b) => b.points - a.points);
  const leaderPoints = sortedDrivers[0]?.points || 1;

  // Sort constructors by points
  const sortedConstructors = [...CONSTRUCTORS].sort((a, b) => b.points - a.points);
  const constructorLeaderPoints = sortedConstructors[0]?.points || 1;

  return (
    <div className="space-y-6">
      {/* Header & Sub-tabs */}
      <div className={`p-4 sm:p-6 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase">
              FIA World Championship
            </span>
            <span className="text-xs text-slate-400">2026 Season Official Standings</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-racing font-bold tracking-wide mt-1 text-slate-100">
            Formula 1 Championship Tables
          </h2>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg border border-slate-800 bg-slate-950 text-xs font-mono">
          <button
            onClick={() => setStandingsTab('drivers')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition ${
              standingsTab === 'drivers' ? 'bg-red-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Drivers</span>
          </button>
          <button
            onClick={() => setStandingsTab('constructors')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition ${
              standingsTab === 'constructors' ? 'bg-red-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Constructors</span>
          </button>
          <button
            onClick={() => setStandingsTab('headtohead')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition ${
              standingsTab === 'headtohead' ? 'bg-red-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Teammate H2H</span>
          </button>
        </div>
      </div>

      {/* View 1: Drivers Championship */}
      {standingsTab === 'drivers' && (
        <div className={`rounded-xl border overflow-hidden shadow-xl ${
          isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono text-left">
              <thead>
                <tr className={`border-b text-[11px] uppercase tracking-wider ${
                  isDarkMode ? 'bg-slate-950/80 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}>
                  <th className="py-3 px-3 text-center w-12">RANK</th>
                  <th className="py-3 px-3 w-10">FAV</th>
                  <th className="py-3 px-3">DRIVER</th>
                  <th className="py-3 px-3">TEAM / ENGINE</th>
                  <th className="py-3 px-3 text-center">WINS</th>
                  <th className="py-3 px-3 text-center">PODIUMS</th>
                  <th className="py-3 px-3">PTS SHARE</th>
                  <th className="py-3 px-3 text-right">POINTS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {sortedDrivers.map((driver, idx) => {
                  const rank = idx + 1;
                  const isFavorite = favoriteDriverIds.includes(driver.id);
                  const ptsGapToLeader = idx === 0 ? '-' : `-${leaderPoints - driver.points} PTS`;
                  const percentage = ((driver.points / leaderPoints) * 100).toFixed(0);

                  return (
                    <tr 
                      key={driver.id}
                      onClick={() => onSelectDriverForTelemetry(driver.id)}
                      className={`hover:bg-slate-800/50 transition cursor-pointer ${
                        isFavorite ? (isDarkMode ? 'bg-red-950/20' : 'bg-red-50/60') : ''
                      }`}
                    >
                      {/* Rank */}
                      <td className="py-4 px-4 text-center">
                        <span className={`w-8 h-8 rounded-xl inline-flex items-center justify-center font-racing font-black text-base shadow-sm ${
                          rank === 1 ? 'bg-gradient-to-br from-amber-300 to-amber-500 text-slate-950 shadow-md shadow-amber-500/30' :
                          rank === 2 ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-950 shadow-md' :
                          rank === 3 ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white shadow-md' :
                          'bg-slate-800/80 text-slate-300'
                        }`}>
                          {rank}
                        </span>
                      </td>

                      {/* Favorite Star */}
                      <td className="py-4 px-3 text-center" onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(driver.id);
                      }}>
                        <button className="p-1.5 rounded-lg hover:bg-slate-800/70 transition">
                          <Star className={`w-4 h-4 ${
                            isFavorite ? 'fill-amber-400 text-amber-400' : 'text-slate-500 hover:text-slate-300'
                          }`} />
                        </button>
                      </td>

                      {/* Driver Name, Avatar & Number */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3.5">
                          <DriverAvatar
                            driverId={driver.id}
                            driverCode={driver.code}
                            firstName={driver.firstName}
                            lastName={driver.lastName}
                            number={driver.number}
                            teamColor={driver.teamColor}
                            size="md"
                          />
                          <div className="w-1.5 h-8 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: driver.teamColor }} />
                          <div>
                            <div className="flex items-center gap-2 font-racing font-extrabold text-base text-slate-100">
                              <span>{driver.firstName} <span className="uppercase">{driver.lastName}</span></span>
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                                #{driver.number}
                              </span>
                              <span className="text-[11px] text-slate-500 font-mono">({driver.countryCode})</span>
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                              Gap to leader: {ptsGapToLeader}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Team with Badge */}
                      <td className="py-4 px-4 text-slate-300 font-sans">
                        <div className="flex items-center gap-2">
                          <TeamBadge teamName={driver.team} size="sm" />
                          <span className="text-xs sm:text-sm font-medium text-slate-200">{driver.team}</span>
                        </div>
                      </td>

                      {/* Wins */}
                      <td className="py-4 px-3 text-center font-black font-racing text-base text-amber-400">
                        {driver.wins > 0 ? driver.wins : '-'}
                      </td>

                      {/* Podiums */}
                      <td className="py-4 px-3 text-center font-black font-racing text-base text-slate-200">
                        {driver.podiums}
                      </td>

                      {/* Progress bar vs Leader */}
                      <td className="py-3 px-3 min-w-[120px]">
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500" 
                            style={{ width: `${percentage}%`, backgroundColor: driver.teamColor }} 
                          />
                        </div>
                      </td>

                      {/* Points */}
                      <td className="py-3 px-3 text-right">
                        <span className="text-base font-bold font-racing text-slate-100">
                          {driver.points}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1 font-mono">PTS</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View 2: Constructors Championship */}
      {standingsTab === 'constructors' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedConstructors.map((c, idx) => {
              const rank = idx + 1;
              const percentage = ((c.points / constructorLeaderPoints) * 100).toFixed(0);

              return (
                <div 
                  key={c.id} 
                  className={`p-5 rounded-xl border relative overflow-hidden transition hover:border-slate-700 ${
                    isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div 
                    className="absolute top-0 left-0 bottom-0 w-2" 
                    style={{ backgroundColor: c.color }} 
                  />

                  <div className="pl-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded flex items-center justify-center font-racing font-bold text-xs ${
                          rank === 1 ? 'bg-amber-400 text-slate-950 font-black' :
                          rank === 2 ? 'bg-slate-300 text-slate-950 font-black' :
                          rank === 3 ? 'bg-amber-700 text-white font-black' :
                          'bg-slate-800 text-slate-300'
                        }`}>
                          P{rank}
                        </span>
                        <h3 className="font-racing font-bold text-lg text-slate-100 tracking-wide">
                          {c.name}
                        </h3>
                      </div>

                      <div className="text-right">
                        <span className="text-xl font-racing font-bold text-slate-100">{c.points}</span>
                        <span className="text-xs text-slate-400 ml-1 font-mono">PTS</span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 mb-3 overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{ width: `${percentage}%`, backgroundColor: c.color }} 
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/60">
                      <div>
                        <div className="text-[10px] text-slate-500">BASE</div>
                        <div className="text-slate-200 truncate">{c.base.split(',')[0]}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">POWER UNIT</div>
                        <div className="text-slate-200 truncate">{c.powerUnit.split(' ')[0]}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">DRIVERS</div>
                        <div className="text-slate-200 font-bold">{c.drivers.join(' • ')}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* View 3: Teammate Head-to-Head Battle */}
      {standingsTab === 'headtohead' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedConstructors.map((c) => {
              const driverA = drivers.find(d => d.code === c.drivers[0]) || drivers[0];
              const driverB = drivers.find(d => d.code === c.drivers[1]) || drivers[1];
              const totalPts = driverA.points + driverB.points || 1;
              const aPct = ((driverA.points / totalPts) * 100).toFixed(0);
              const bPct = ((driverB.points / totalPts) * 100).toFixed(0);

              return (
                <div 
                  key={c.id} 
                  className={`p-5 rounded-xl border ${
                    isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="font-racing font-bold text-sm text-slate-200 tracking-wide">
                      {c.name}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      Teammate Duel
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="text-left">
                      <div className="font-racing font-bold text-lg text-slate-100">{driverA.code}</div>
                      <div className="text-xs text-slate-400 font-mono">{driverA.points} PTS</div>
                    </div>

                    <div className="text-center">
                      <div className="text-[10px] font-mono text-slate-500">PTS SPLIT</div>
                      <div className="text-xs font-mono font-bold text-slate-300">
                        {aPct}% - {bPct}%
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-racing font-bold text-lg text-slate-100">{driverB.code}</div>
                      <div className="text-xs text-slate-400 font-mono">{driverB.points} PTS</div>
                    </div>
                  </div>

                  <div className="w-full bg-slate-800 h-2.5 rounded-full mt-3 overflow-hidden flex">
                    <div style={{ width: `${aPct}%`, backgroundColor: c.color }} className="h-full" />
                    <div style={{ width: `${bPct}%`, backgroundColor: '#475569' }} className="h-full" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
