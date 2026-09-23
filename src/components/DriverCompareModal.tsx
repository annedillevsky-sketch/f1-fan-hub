import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Trophy, 
  Flame, 
  Zap, 
  Medal, 
  ArrowLeftRight, 
  Check, 
  Share2, 
  Flag, 
  Car, 
  Activity, 
  Gauge, 
  Clock,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { 
  DriverDetailedProfile, 
  DRIVER_CAREER_DATABASE, 
  getDriverDetailedProfile 
} from '../data/driverCareerData';
import { TEAM_CAR_LIVERIES } from '../data/driverMedia';

interface DriverCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDriver1Id?: string | null;
  initialDriver2Id?: string | null;
  isDarkMode?: boolean;
  onOpenDriverProfile?: (driverId: string) => void;
}

interface MetricComparisonItem {
  id: string;
  label: string;
  driver1Value: number | string;
  driver2Value: number | string;
  driver1Display: string;
  driver2Display: string;
  advantage: 1 | 2 | 0; // 1 = driver1 better, 2 = driver2 better, 0 = tie
  driver1BarPercent: number;
  driver2BarPercent: number;
}

export const DriverCompareModal: React.FC<DriverCompareModalProps> = ({
  isOpen,
  onClose,
  initialDriver1Id,
  initialDriver2Id,
  isDarkMode = true,
  onOpenDriverProfile,
}) => {
  // Available driver list sorted by 2026 championship standing
  const allDrivers = useMemo(() => {
    return Object.values(DRIVER_CAREER_DATABASE).sort(
      (a, b) => a.season2026.position - b.season2026.position
    );
  }, []);

  // Selected driver IDs
  const [driver1Id, setDriver1Id] = useState<string>('ant');
  const [driver2Id, setDriver2Id] = useState<string>('rus');
  const [driver1ImgErr, setDriver1ImgErr] = useState(false);
  const [driver2ImgErr, setDriver2ImgErr] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  // Sync initial drivers when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialDriver1Id) {
        const p1 = getDriverDetailedProfile(initialDriver1Id);
        if (p1) setDriver1Id(p1.id);
      }
      if (initialDriver2Id) {
        const p2 = getDriverDetailedProfile(initialDriver2Id);
        if (p2) setDriver2Id(p2.id);
      } else if (initialDriver1Id) {
        // Pick top rival if not specified
        const p1 = getDriverDetailedProfile(initialDriver1Id);
        if (p1?.id === 'ant') setDriver2Id('rus');
        else if (p1) setDriver2Id('ant');
      }
      setDriver1ImgErr(false);
      setDriver2ImgErr(false);
      setCopiedToast(false);
    }
  }, [isOpen, initialDriver1Id, initialDriver2Id]);

  // Handle ESC key and scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const driver1 = useMemo(() => getDriverDetailedProfile(driver1Id) || allDrivers[0], [driver1Id, allDrivers]);
  const driver2 = useMemo(() => getDriverDetailedProfile(driver2Id) || allDrivers[1] || allDrivers[0], [driver2Id, allDrivers]);

  // Swap drivers
  const handleSwapDrivers = () => {
    const temp = driver1Id;
    setDriver1Id(driver2Id);
    setDriver2Id(temp);
    setDriver1ImgErr(false);
    setDriver2ImgErr(false);
  };

  // Quick preset duels
  const setDuelPreset = (id1: string, id2: string) => {
    setDriver1Id(id1);
    setDriver2Id(id2);
    setDriver1ImgErr(false);
    setDriver2ImgErr(false);
  };

  // Helper to parse position string into number for comparison (e.g. 'P1' -> 1)
  const parsePos = (posStr: string): number => {
    const match = posStr.match(/\d+/);
    return match ? parseInt(match[0], 10) : 99;
  };

  // Calculate 2026 Comparison Metrics
  const comparisonMetrics: MetricComparisonItem[] = useMemo(() => {
    if (!driver1 || !driver2) return [];

    const d1 = driver1.season2026;
    const d2 = driver2.season2026;

    const calcNumberDelta = (v1: number, v2: number, higherIsBetter = true) => {
      let advantage: 1 | 2 | 0 = 0;
      if (v1 !== v2) {
        if (higherIsBetter) {
          advantage = v1 > v2 ? 1 : 2;
        } else {
          advantage = v1 < v2 ? 1 : 2;
        }
      }

      const total = v1 + v2;
      let p1 = 50;
      let p2 = 50;
      if (total > 0) {
        p1 = Math.round((v1 / total) * 100);
        p2 = 100 - p1;
      }
      return { advantage, p1, p2 };
    };

    // Position comparison (lower is better: P1 is better than P2)
    const posAdv = d1.position < d2.position ? 1 : d1.position > d2.position ? 2 : 0;
    const ptsDelta = calcNumberDelta(d1.totalPoints, d2.totalPoints, true);
    const racePtsDelta = calcNumberDelta(d1.racePoints, d2.racePoints, true);
    const sprintPtsDelta = calcNumberDelta(d1.sprintPoints, d2.sprintPoints, true);
    const winsDelta = calcNumberDelta(d1.wins, d2.wins, true);
    const podiumsDelta = calcNumberDelta(d1.podiums, d2.podiums, true);
    const polesDelta = calcNumberDelta(d1.polePositions, d2.polePositions, true);
    const fastestLapsDelta = calcNumberDelta(d1.fastestLaps, d2.fastestLaps, true);
    const lapsLedDelta = calcNumberDelta(d1.lapsLed, d2.lapsLed, true);
    const dnfsDelta = calcNumberDelta(d1.dnfs, d2.dnfs, false); // Fewer DNFs is better!

    const p1Best = parsePos(d1.bestFinish);
    const p2Best = parsePos(d2.bestFinish);
    const bestFinishAdv = p1Best < p2Best ? 1 : p1Best > p2Best ? 2 : 0;

    return [
      {
        id: 'position',
        label: '2026 Championship Standings',
        driver1Value: d1.position,
        driver2Value: d2.position,
        driver1Display: `P${d1.position}`,
        driver2Display: `P${d2.position}`,
        advantage: posAdv,
        driver1BarPercent: posAdv === 1 ? 65 : posAdv === 2 ? 35 : 50,
        driver2BarPercent: posAdv === 2 ? 65 : posAdv === 1 ? 35 : 50,
      },
      {
        id: 'totalPoints',
        label: 'Total Championship Points',
        driver1Value: d1.totalPoints,
        driver2Value: d2.totalPoints,
        driver1Display: `${d1.totalPoints} PTS`,
        driver2Display: `${d2.totalPoints} PTS`,
        advantage: ptsDelta.advantage,
        driver1BarPercent: ptsDelta.p1,
        driver2BarPercent: ptsDelta.p2,
      },
      {
        id: 'racePoints',
        label: 'Grand Prix Race Points',
        driver1Value: d1.racePoints,
        driver2Value: d2.racePoints,
        driver1Display: `${d1.racePoints} PTS`,
        driver2Display: `${d2.racePoints} PTS`,
        advantage: racePtsDelta.advantage,
        driver1BarPercent: racePtsDelta.p1,
        driver2BarPercent: racePtsDelta.p2,
      },
      {
        id: 'sprintPoints',
        label: 'Sprint Race Points',
        driver1Value: d1.sprintPoints,
        driver2Value: d2.sprintPoints,
        driver1Display: `${d1.sprintPoints} PTS`,
        driver2Display: `${d2.sprintPoints} PTS`,
        advantage: sprintPtsDelta.advantage,
        driver1BarPercent: sprintPtsDelta.p1,
        driver2BarPercent: sprintPtsDelta.p2,
      },
      {
        id: 'wins',
        label: 'Grand Prix Victories',
        driver1Value: d1.wins,
        driver2Value: d2.wins,
        driver1Display: `${d1.wins}`,
        driver2Display: `${d2.wins}`,
        advantage: winsDelta.advantage,
        driver1BarPercent: winsDelta.p1,
        driver2BarPercent: winsDelta.p2,
      },
      {
        id: 'podiums',
        label: 'Podium Finishes',
        driver1Value: d1.podiums,
        driver2Value: d2.podiums,
        driver1Display: `${d1.podiums}`,
        driver2Display: `${d2.podiums}`,
        advantage: podiumsDelta.advantage,
        driver1BarPercent: podiumsDelta.p1,
        driver2BarPercent: podiumsDelta.p2,
      },
      {
        id: 'polePositions',
        label: 'Pole Positions',
        driver1Value: d1.polePositions,
        driver2Value: d2.polePositions,
        driver1Display: `${d1.polePositions}`,
        driver2Display: `${d2.polePositions}`,
        advantage: polesDelta.advantage,
        driver1BarPercent: polesDelta.p1,
        driver2BarPercent: polesDelta.p2,
      },
      {
        id: 'fastestLaps',
        label: 'Fastest Laps',
        driver1Value: d1.fastestLaps,
        driver2Value: d2.fastestLaps,
        driver1Display: `${d1.fastestLaps}`,
        driver2Display: `${d2.fastestLaps}`,
        advantage: fastestLapsDelta.advantage,
        driver1BarPercent: fastestLapsDelta.p1,
        driver2BarPercent: fastestLapsDelta.p2,
      },
      {
        id: 'lapsLed',
        label: 'Laps Led in 2026',
        driver1Value: d1.lapsLed,
        driver2Value: d2.lapsLed,
        driver1Display: `${d1.lapsLed} Laps`,
        driver2Display: `${d2.lapsLed} Laps`,
        advantage: lapsLedDelta.advantage,
        driver1BarPercent: lapsLedDelta.p1,
        driver2BarPercent: lapsLedDelta.p2,
      },
      {
        id: 'bestFinish',
        label: 'Best 2026 Race Finish',
        driver1Value: d1.bestFinish,
        driver2Value: d2.bestFinish,
        driver1Display: d1.bestFinish,
        driver2Display: d2.bestFinish,
        advantage: bestFinishAdv,
        driver1BarPercent: bestFinishAdv === 1 ? 60 : bestFinishAdv === 2 ? 40 : 50,
        driver2BarPercent: bestFinishAdv === 2 ? 60 : bestFinishAdv === 1 ? 40 : 50,
      },
      {
        id: 'dnfs',
        label: 'Did Not Finish (DNFs)',
        driver1Value: d1.dnfs,
        driver2Value: d2.dnfs,
        driver1Display: `${d1.dnfs}`,
        driver2Display: `${d2.dnfs}`,
        advantage: dnfsDelta.advantage,
        driver1BarPercent: dnfsDelta.advantage === 1 ? 60 : dnfsDelta.advantage === 2 ? 40 : 50,
        driver2BarPercent: dnfsDelta.advantage === 2 ? 60 : dnfsDelta.advantage === 1 ? 40 : 50,
      },
    ];
  }, [driver1, driver2]);

  // Overall metric wins tally
  const summaryTally = useMemo(() => {
    let d1Wins = 0;
    let d2Wins = 0;
    let ties = 0;
    comparisonMetrics.forEach(m => {
      if (m.advantage === 1) d1Wins++;
      else if (m.advantage === 2) d2Wins++;
      else ties++;
    });
    return { d1Wins, d2Wins, ties };
  }, [comparisonMetrics]);

  // Head-to-Head Race Results comparison
  const headToHeadRaces = useMemo(() => {
    if (!driver1 || !driver2) return { rounds: [] as Array<{ roundNum: number; pos1: string; pos2: string; winner: 1 | 2 | 0 }>, d1Ahead: 0, d2Ahead: 0, total: 0 };
    const r1 = driver1.season2026.recentResults || [];
    const r2 = driver2.season2026.recentResults || [];
    const minLen = Math.min(r1.length, r2.length);

    let d1Ahead = 0;
    let d2Ahead = 0;

    const rounds: Array<{ roundNum: number; pos1: string; pos2: string; winner: 1 | 2 | 0 }> = [];
    for (let i = 0; i < minLen; i++) {
      const pos1 = r1[i];
      const pos2 = r2[i];
      const n1 = parsePos(pos1);
      const n2 = parsePos(pos2);
      let winner: 1 | 2 | 0 = 0;
      if (pos1 !== 'DNF' && pos2 === 'DNF') winner = 1;
      else if (pos1 === 'DNF' && pos2 !== 'DNF') winner = 2;
      else if (n1 < n2) winner = 1;
      else if (n2 < n1) winner = 2;

      if (winner === 1) d1Ahead++;
      else if (winner === 2) d2Ahead++;

      rounds.push({
        roundNum: i + 1,
        pos1,
        pos2,
        winner,
      });
    }

    return { rounds, d1Ahead, d2Ahead, total: minLen };
  }, [driver1, driver2]);

  if (!isOpen || !driver1 || !driver2) return null;

  const pointsDiff = Math.abs(driver1.season2026.totalPoints - driver2.season2026.totalPoints);
  const pointsLeader = driver1.season2026.totalPoints >= driver2.season2026.totalPoints ? driver1 : driver2;
  const isTeammates = driver1.team.toLowerCase() === driver2.team.toLowerCase();

  const handleShare = () => {
    const text = `🏎️ 2026 F1 Driver Comparison: ${driver1.fullName} (#${driver1.number} - P${driver1.season2026.position}) vs ${driver2.fullName} (#${driver2.number} - P${driver2.season2026.position}) • Points: ${driver1.season2026.totalPoints} vs ${driver2.season2026.totalPoints} • Wins: ${driver1.season2026.wins} vs ${driver2.season2026.wins}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-8 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="compare-modal-title"
    >
      <div 
        className={`relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden text-slate-100 transition-all ${
          isDarkMode 
            ? 'bg-[#0B0F17] border-slate-800 shadow-[0_25px_60px_rgba(0,0,0,0.85)]' 
            : 'bg-white border-slate-200 text-slate-900 shadow-2xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dynamic Dual-Color Split Accent Bar */}
        <div className="h-1.5 w-full flex shrink-0">
          <div className="h-full w-1/2 transition-colors duration-300" style={{ backgroundColor: driver1.teamColor }} />
          <div className="h-full w-1/2 transition-colors duration-300" style={{ backgroundColor: driver2.teamColor }} />
        </div>

        {/* Header Bar */}
        <div className={`p-4 sm:p-5 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 ${
          isDarkMode ? 'border-slate-800 bg-slate-950/90' : 'border-slate-200 bg-slate-50'
        }`}>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="p-1.5 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30">
                <ArrowLeftRight className="w-4 h-4" />
              </span>
              <h2 id="compare-modal-title" className="font-racing font-black text-lg sm:text-2xl tracking-wide uppercase">
                Driver Head-to-Head Comparison
              </h2>
              {isTeammates && (
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
                  {driver1.team} Intra-Team Duel
                </span>
              )}
            </div>
            <p className="text-xs font-mono text-slate-400 mt-0.5">
              Official 2026 World Championship Performance &amp; Metric Delta Analysis
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Share Comparison */}
            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60 transition relative"
              title="Copy comparison summary to clipboard"
            >
              <Share2 className="w-4 h-4" />
              {copiedToast && (
                <span className="absolute -bottom-8 right-0 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500 text-slate-950 shadow-md whitespace-nowrap animate-bounce">
                  Copied!
                </span>
              )}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Close modal (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Duel Presets Toolbar */}
        <div className={`px-4 sm:px-6 py-2.5 border-b flex items-center gap-2 overflow-x-auto text-xs font-mono shrink-0 ${
          isDarkMode ? 'border-slate-800/80 bg-slate-950/60 text-slate-400' : 'border-slate-200 bg-slate-100 text-slate-600'
        }`}>
          <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Rivalry Presets:
          </span>

          <button
            onClick={() => setDuelPreset('ant', 'rus')}
            className={`px-3 py-1 rounded-lg transition font-bold whitespace-nowrap ${
              (driver1Id === 'ant' && driver2Id === 'rus') || (driver1Id === 'rus' && driver2Id === 'ant')
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-slate-800/70 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Title Duel (Antonelli vs Russell)
          </button>

          <button
            onClick={() => setDuelPreset('ham', 'lec')}
            className={`px-3 py-1 rounded-lg transition font-bold whitespace-nowrap ${
              (driver1Id === 'ham' && driver2Id === 'lec') || (driver1Id === 'lec' && driver2Id === 'ham')
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-slate-800/70 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Ferrari Duel (Hamilton vs Leclerc)
          </button>

          <button
            onClick={() => setDuelPreset('nor', 'pia')}
            className={`px-3 py-1 rounded-lg transition font-bold whitespace-nowrap ${
              (driver1Id === 'nor' && driver2Id === 'pia') || (driver1Id === 'pia' && driver2Id === 'nor')
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-slate-800/70 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Papaya Duel (Norris vs Piastri)
          </button>

          <button
            onClick={() => setDuelPreset('ver', 'tsu')}
            className={`px-3 py-1 rounded-lg transition font-bold whitespace-nowrap ${
              (driver1Id === 'ver' && driver2Id === 'tsu') || (driver1Id === 'tsu' && driver2Id === 'ver')
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-slate-800/70 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Red Bull Duel (Verstappen vs Tsunoda)
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-6">
          {/* Dual Driver Showcase Cards & Selectors Deck */}
          <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
            {/* Driver 1 Card (Left - 5 Cols) */}
            <div 
              className="md:col-span-5 rounded-2xl p-4 sm:p-5 border transition shadow-lg relative overflow-hidden"
              style={{
                borderColor: `${driver1.teamColor}50`,
                background: isDarkMode 
                  ? `linear-gradient(135deg, ${driver1.teamColor}15 0%, rgba(15,23,42,0.95) 100%)`
                  : `linear-gradient(135deg, ${driver1.teamColor}10 0%, #ffffff 100%)`
              }}
            >
              {/* Selector Dropdown */}
              <div className="mb-3">
                <label className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
                  Select Driver 1:
                </label>
                <div className="relative">
                  <select
                    value={driver1Id}
                    onChange={(e) => {
                      setDriver1Id(e.target.value);
                      setDriver1ImgErr(false);
                    }}
                    className={`w-full py-2 px-3 pr-8 rounded-xl font-mono text-xs font-bold border appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-red-500 ${
                      isDarkMode ? 'bg-slate-900/90 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    {allDrivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        P{d.season2026.position} • #{d.number} {d.fullName} ({d.team})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Driver 1 Identity & Headshot */}
              <div className="flex items-center gap-4">
                <div 
                  className="w-24 h-28 sm:w-28 sm:h-32 rounded-2xl flex items-center justify-center relative overflow-hidden border shrink-0 shadow-inner group"
                  style={{ 
                    borderColor: driver1.teamColor,
                    backgroundColor: `${driver1.teamColor}20` 
                  }}
                >
                  {!driver1ImgErr ? (
                    <img
                      src={driver1.headshotUrl}
                      alt={driver1.fullName}
                      onError={() => setDriver1ImgErr(true)}
                      className="w-full h-full object-contain object-bottom drop-shadow-md group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="text-center font-racing font-black text-2xl text-slate-100">
                      {driver1.code}
                    </div>
                  )}
                  <span 
                    className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-racing font-black text-slate-950 shadow"
                    style={{ backgroundColor: driver1.teamColor }}
                  >
                    #{driver1.number}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm">{driver1.flagEmoji}</span>
                    <h3 className="font-racing font-black text-xl sm:text-2xl text-white truncate">
                      {driver1.fullName}
                    </h3>
                  </div>

                  <div 
                    className="text-xs font-mono font-bold uppercase tracking-wider mt-0.5"
                    style={{ color: driver1.teamColor }}
                  >
                    {driver1.team}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                    {driver1.carName}
                  </div>

                  <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded text-xs font-mono font-black bg-slate-900 border border-slate-700 text-amber-400">
                      Rank: P{driver1.season2026.position}
                    </span>
                    <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-slate-900 border border-slate-700 text-white">
                      {driver1.season2026.totalPoints} PTS
                    </span>
                    {onOpenDriverProfile && (
                      <button
                        onClick={() => onOpenDriverProfile(driver1.id)}
                        className="text-[11px] font-mono text-slate-400 hover:text-white underline"
                      >
                        Full Profile
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* VS Crest & Swap Button (Center - 1 Col) */}
            <div className="md:col-span-1 flex flex-col items-center justify-center gap-2 py-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 p-0.5 shadow-xl flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center font-racing font-black text-sm text-white tracking-widest">
                  VS
                </div>
              </div>

              <button
                onClick={handleSwapDrivers}
                className="p-2 rounded-xl border border-slate-800 bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 transition shadow-sm"
                title="Swap driver positions"
                aria-label="Swap driver positions"
              >
                <ArrowLeftRight className="w-4 h-4" />
              </button>

              <div className="text-center font-mono text-[10px] text-slate-500 whitespace-nowrap hidden md:block">
                {pointsDiff > 0 ? (
                  <span>
                    <strong className="text-slate-300">{pointsLeader.code}</strong> +{pointsDiff}P
                  </span>
                ) : (
                  <span>TIED</span>
                )}
              </div>
            </div>

            {/* Driver 2 Card (Right - 5 Cols) */}
            <div 
              className="md:col-span-5 rounded-2xl p-4 sm:p-5 border transition shadow-lg relative overflow-hidden"
              style={{
                borderColor: `${driver2.teamColor}50`,
                background: isDarkMode 
                  ? `linear-gradient(135deg, rgba(15,23,42,0.95) 0%, ${driver2.teamColor}15 100%)`
                  : `linear-gradient(135deg, #ffffff 0%, ${driver2.teamColor}10 100%)`
              }}
            >
              {/* Selector Dropdown */}
              <div className="mb-3">
                <label className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
                  Select Driver 2:
                </label>
                <div className="relative">
                  <select
                    value={driver2Id}
                    onChange={(e) => {
                      setDriver2Id(e.target.value);
                      setDriver2ImgErr(false);
                    }}
                    className={`w-full py-2 px-3 pr-8 rounded-xl font-mono text-xs font-bold border appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-red-500 ${
                      isDarkMode ? 'bg-slate-900/90 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    {allDrivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        P{d.season2026.position} • #{d.number} {d.fullName} ({d.team})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Driver 2 Identity & Headshot */}
              <div className="flex items-center gap-4">
                <div 
                  className="w-24 h-28 sm:w-28 sm:h-32 rounded-2xl flex items-center justify-center relative overflow-hidden border shrink-0 shadow-inner group"
                  style={{ 
                    borderColor: driver2.teamColor,
                    backgroundColor: `${driver2.teamColor}20` 
                  }}
                >
                  {!driver2ImgErr ? (
                    <img
                      src={driver2.headshotUrl}
                      alt={driver2.fullName}
                      onError={() => setDriver2ImgErr(true)}
                      className="w-full h-full object-contain object-bottom drop-shadow-md group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="text-center font-racing font-black text-2xl text-slate-100">
                      {driver2.code}
                    </div>
                  )}
                  <span 
                    className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-racing font-black text-slate-950 shadow"
                    style={{ backgroundColor: driver2.teamColor }}
                  >
                    #{driver2.number}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm">{driver2.flagEmoji}</span>
                    <h3 className="font-racing font-black text-xl sm:text-2xl text-white truncate">
                      {driver2.fullName}
                    </h3>
                  </div>

                  <div 
                    className="text-xs font-mono font-bold uppercase tracking-wider mt-0.5"
                    style={{ color: driver2.teamColor }}
                  >
                    {driver2.team}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                    {driver2.carName}
                  </div>

                  <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded text-xs font-mono font-black bg-slate-900 border border-slate-700 text-amber-400">
                      Rank: P{driver2.season2026.position}
                    </span>
                    <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-slate-900 border border-slate-700 text-white">
                      {driver2.season2026.totalPoints} PTS
                    </span>
                    {onOpenDriverProfile && (
                      <button
                        onClick={() => onOpenDriverProfile(driver2.id)}
                        className="text-[11px] font-mono text-slate-400 hover:text-white underline"
                      >
                        Full Profile
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Metric Advantage Scoreboard Banner */}
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono ${
            isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>
                Performance Delta Score: <strong style={{ color: driver1.teamColor }}>{driver1.code}</strong> leads in <strong>{summaryTally.d1Wins}</strong> metrics vs <strong style={{ color: driver2.teamColor }}>{driver2.code}</strong> leads in <strong>{summaryTally.d2Wins}</strong> metrics ({summaryTally.ties} tied)
              </span>
            </div>

            <div className="text-slate-400">
              Championship Spread: <strong className="text-white">{pointsDiff} PTS</strong>
            </div>
          </div>

          {/* 2026 Season Head-To-Head Stats Meters */}
          <div className={`p-4 sm:p-6 rounded-2xl border ${
            isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-red-500" />
                <span>2026 Season Head-To-Head Metrics</span>
              </span>
              <span className="text-[11px] text-slate-500">
                Team-colored fill highlights performance advantage
              </span>
            </h4>

            <div className="space-y-4">
              {comparisonMetrics.map((metric) => {
                const isD1Adv = metric.advantage === 1;
                const isD2Adv = metric.advantage === 2;

                return (
                  <div key={metric.id} className="space-y-1.5">
                    {/* Metric Row Header */}
                    <div className="flex items-center justify-between text-xs font-mono">
                      {/* Driver 1 Value */}
                      <div className={`font-bold flex items-center gap-1.5 ${isD1Adv ? 'text-white' : 'text-slate-400'}`}>
                        {isD1Adv && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                        <span className="text-sm font-racing">{metric.driver1Display}</span>
                      </div>

                      {/* Center Metric Label */}
                      <div className="text-slate-400 font-semibold text-center text-[11px] uppercase tracking-wider">
                        {metric.label}
                      </div>

                      {/* Driver 2 Value */}
                      <div className={`font-bold flex items-center gap-1.5 ${isD2Adv ? 'text-white' : 'text-slate-400'}`}>
                        <span className="text-sm font-racing">{metric.driver2Display}</span>
                        {isD2Adv && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                      </div>
                    </div>

                    {/* Dual Split Visual Progress Bar */}
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-800/80">
                      <div 
                        className="h-full transition-all duration-500"
                        style={{ 
                          width: `${metric.driver1BarPercent}%`,
                          backgroundColor: isD1Adv ? driver1.teamColor : `${driver1.teamColor}50`
                        }}
                      />
                      <div 
                        className="h-full transition-all duration-500"
                        style={{ 
                          width: `${metric.driver2BarPercent}%`,
                          backgroundColor: isD2Adv ? driver2.teamColor : `${driver2.teamColor}50`
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Race-by-Race Finish Head-to-Head */}
          {headToHeadRaces.rounds.length > 0 && (
            <div className={`p-4 sm:p-5 rounded-2xl border ${
              isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>2026 Race-By-Race Head-To-Head Finishes</span>
                </h4>
                <div className="text-xs font-mono">
                  Finished Ahead: <strong style={{ color: driver1.teamColor }}>{driver1.code} ({headToHeadRaces.d1Ahead})</strong> - <strong style={{ color: driver2.teamColor }}>{driver2.code} ({headToHeadRaces.d2Ahead})</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
                {headToHeadRaces.rounds.map((round) => {
                  const isD1 = round.winner === 1;
                  const isD2 = round.winner === 2;

                  return (
                    <div 
                      key={round.roundNum}
                      className={`p-2.5 rounded-xl border text-center font-mono text-xs transition ${
                        isD1 || isD2 ? 'bg-slate-950' : 'bg-slate-950/60 border-slate-800'
                      }`}
                      style={{
                        borderColor: isD1 ? driver1.teamColor : isD2 ? driver2.teamColor : undefined
                      }}
                    >
                      <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">
                        Round {round.roundNum}
                      </div>
                      <div className="flex items-center justify-around font-racing text-xs">
                        <span style={{ color: isD1 ? driver1.teamColor : '#94a3b8', fontWeight: isD1 ? 900 : 500 }}>
                          {round.pos1}
                        </span>
                        <span className="text-[10px] text-slate-600">vs</span>
                        <span style={{ color: isD2 ? driver2.teamColor : '#94a3b8', fontWeight: isD2 ? 900 : 500 }}>
                          {round.pos2}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono mt-1 font-bold">
                        {isD1 ? (
                          <span style={{ color: driver1.teamColor }}>▲ {driver1.code}</span>
                        ) : isD2 ? (
                          <span style={{ color: driver2.teamColor }}>▲ {driver2.code}</span>
                        ) : (
                          <span className="text-slate-500">TIED</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Lifetime Career Comparison Table */}
          <div className={`p-4 sm:p-5 rounded-2xl border ${
            isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Medal className="w-4 h-4 text-cyan-400" />
              <span>Lifetime Career Records Comparison</span>
            </h4>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 text-center font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">TITLES</span>
                <div className="font-racing font-bold text-base mt-1 flex items-center justify-center gap-2">
                  <span style={{ color: driver1.teamColor }}>{driver1.career.worldChampionships}</span>
                  <span className="text-slate-600">/</span>
                  <span style={{ color: driver2.teamColor }}>{driver2.career.worldChampionships}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">GP STARTS</span>
                <div className="font-racing font-bold text-base mt-1 flex items-center justify-center gap-2">
                  <span style={{ color: driver1.teamColor }}>{driver1.career.grandPrixStarts}</span>
                  <span className="text-slate-600">/</span>
                  <span style={{ color: driver2.teamColor }}>{driver2.career.grandPrixStarts}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">WINS</span>
                <div className="font-racing font-bold text-base mt-1 flex items-center justify-center gap-2">
                  <span style={{ color: driver1.teamColor }}>{driver1.career.wins}</span>
                  <span className="text-slate-600">/</span>
                  <span style={{ color: driver2.teamColor }}>{driver2.career.wins}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">PODIUMS</span>
                <div className="font-racing font-bold text-base mt-1 flex items-center justify-center gap-2">
                  <span style={{ color: driver1.teamColor }}>{driver1.career.podiums}</span>
                  <span className="text-slate-600">/</span>
                  <span style={{ color: driver2.teamColor }}>{driver2.career.podiums}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">POLES</span>
                <div className="font-racing font-bold text-base mt-1 flex items-center justify-center gap-2">
                  <span style={{ color: driver1.teamColor }}>{driver1.career.polePositions}</span>
                  <span className="text-slate-600">/</span>
                  <span style={{ color: driver2.teamColor }}>{driver2.career.polePositions}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">CAREER PTS</span>
                <div className="font-racing font-bold text-base mt-1 flex items-center justify-center gap-2">
                  <span style={{ color: driver1.teamColor }}>{driver1.career.totalCareerPoints}</span>
                  <span className="text-slate-600">/</span>
                  <span style={{ color: driver2.teamColor }}>{driver2.career.totalCareerPoints}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className={`p-4 border-t flex flex-wrap items-center justify-between gap-3 shrink-0 ${
          isDarkMode ? 'border-slate-800 bg-slate-950/90' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>2026 OpenF1 Formula 1 Official Telemetry Sync</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-mono font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition"
            >
              Close Comparison (Esc)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverCompareModal;
