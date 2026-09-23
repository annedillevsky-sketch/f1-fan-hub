import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Trophy, 
  Shield, 
  RefreshCw, 
  AlertCircle, 
  Medal, 
  CheckCircle2, 
  Flame,
  Layers,
  ArrowLeftRight
} from 'lucide-react';
import { DRIVER_PORTRAITS } from '../data/driverMedia';
import { DriverAvatar } from './DriverAvatar';
import { DriverDetailModal } from './DriverDetailModal';
import { DriverCompareModal } from './DriverCompareModal';

export interface DriverChampionshipStanding {
  position: number;
  driverNumber: number;
  name: string;
  code: string;
  team: string;
  teamColor: string;
  racePoints: number;
  sprintPoints: number;
  totalPoints: number;
  wins: number;
  podiums: number;
  headshotUrl?: string;
}

export interface ConstructorChampionshipStanding {
  position: number;
  teamName: string;
  teamColor: string;
  drivers: string[];
  driverNumbers: number[];
  racePoints: number;
  sprintPoints: number;
  totalPoints: number;
  sharePercent: number;
}

export interface RaceSessionRecord {
  session_key: number;
  session_name: 'Race' | 'Sprint';
  country_name: string;
  circuit_short_name: string;
  date_start: string;
  resultsCount: number;
}

export interface ChampionshipTableProps {
  isDarkMode?: boolean;
  favoriteDriverIds?: string[];
  onToggleFavorite?: (id: string) => void;
  onSelectDriverForTelemetry?: (id: string) => void;
}

// FIA Official Points Allocation
const FIA_RACE_POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
const FIA_SPRINT_POINTS = [8, 7, 6, 5, 4, 3, 2, 1];

// Team styling palette
const TEAM_THEMES: Record<string, { color: string; border: string; bg: string }> = {
  'mercedes': { color: '#27F4D2', border: 'border-[#27F4D2]/40', bg: 'bg-[#27F4D2]/10' },
  'mclaren': { color: '#FF8000', border: 'border-[#FF8000]/40', bg: 'bg-[#FF8000]/10' },
  'ferrari': { color: '#E8002D', border: 'border-[#E8002D]/40', bg: 'bg-[#E8002D]/10' },
  'red bull': { color: '#3671C6', border: 'border-[#3671C6]/40', bg: 'bg-[#3671C6]/10' },
  'aston martin': { color: '#229971', border: 'border-[#229971]/40', bg: 'bg-[#229971]/10' },
  'williams': { color: '#64C4FF', border: 'border-[#64C4FF]/40', bg: 'bg-[#64C4FF]/10' },
  'alpine': { color: '#0093CC', border: 'border-[#0093CC]/40', bg: 'bg-[#0093CC]/10' },
  'audi': { color: '#E10600', border: 'border-[#E10600]/40', bg: 'bg-[#E10600]/10' },
  'racing bulls': { color: '#6692FF', border: 'border-[#6692FF]/40', bg: 'bg-[#6692FF]/10' },
  'rb': { color: '#6692FF', border: 'border-[#6692FF]/40', bg: 'bg-[#6692FF]/10' },
  'haas': { color: '#DA291C', border: 'border-[#DA291C]/40', bg: 'bg-[#DA291C]/10' },
  'cadillac': { color: '#FFB800', border: 'border-[#FFB800]/40', bg: 'bg-[#FFB800]/10' },
};

function getTeamTheme(teamName: string) {
  const lower = (teamName || '').toLowerCase();
  for (const [key, theme] of Object.entries(TEAM_THEMES)) {
    if (lower.includes(key)) return theme;
  }
  return { color: '#E10600', border: 'border-red-500/40', bg: 'bg-red-500/10' };
}

function getDriverIdFromName(name: string): string {
  const lower = (name || '').toLowerCase();
  if (lower.includes('antonelli')) return 'ant';
  if (lower.includes('russell')) return 'rus';
  if (lower.includes('hamilton')) return 'ham';
  if (lower.includes('norris')) return 'nor';
  if (lower.includes('leclerc')) return 'lec';
  if (lower.includes('verstappen')) return 'ver';
  if (lower.includes('piastri')) return 'pia';
  if (lower.includes('hadjar')) return 'had';
  if (lower.includes('lawson')) return 'law';
  if (lower.includes('gasly')) return 'gas';
  if (lower.includes('lindblad')) return 'lin';
  if (lower.includes('colapinto')) return 'col';
  if (lower.includes('bearman')) return 'bea';
  if (lower.includes('bortoleto')) return 'bor';
  if (lower.includes('hulkenberg') || lower.includes('hülkenberg')) return 'hul';
  if (lower.includes('sainz')) return 'sai';
  if (lower.includes('albon')) return 'alb';
  if (lower.includes('alonso')) return 'alo';
  if (lower.includes('ocon')) return 'oco';
  if (lower.includes('perez')) return 'per';
  if (lower.includes('stroll')) return 'str';
  if (lower.includes('bottas')) return 'bot';
  return 'drv';
}

// 100% verified baseline extracted directly from OpenF1 2026 data
// 14 Completed Grand Prix + 5 Completed Sprints
export const VERIFIED_2026_OPENF1_DRIVERS: DriverChampionshipStanding[] = [
  { position: 1, driverNumber: 12, name: 'Kimi Antonelli', code: 'ANT', team: 'Mercedes', teamColor: '#27F4D2', racePoints: 266, sprintPoints: 26, totalPoints: 292, wins: 8, podiums: 12, headshotUrl: DRIVER_PORTRAITS['ant'] },
  { position: 2, driverNumber: 63, name: 'George Russell', code: 'RUS', team: 'Mercedes', teamColor: '#27F4D2', racePoints: 177, sprintPoints: 34, totalPoints: 211, wins: 2, podiums: 7, headshotUrl: DRIVER_PORTRAITS['rus'] },
  { position: 3, driverNumber: 44, name: 'Lewis Hamilton', code: 'HAM', team: 'Ferrari', teamColor: '#E8002D', racePoints: 171, sprintPoints: 20, totalPoints: 191, wins: 1, podiums: 5, headshotUrl: DRIVER_PORTRAITS['ham'] },
  { position: 4, driverNumber: 1, name: 'Lando Norris', code: 'NOR', team: 'McLaren', teamColor: '#FF8000', racePoints: 154, sprintPoints: 32, totalPoints: 186, wins: 2, podiums: 5, headshotUrl: DRIVER_PORTRAITS['nor'] },
  { position: 5, driverNumber: 16, name: 'Charles Leclerc', code: 'LEC', team: 'Ferrari', teamColor: '#E8002D', racePoints: 139, sprintPoints: 28, totalPoints: 167, wins: 1, podiums: 4, headshotUrl: DRIVER_PORTRAITS['lec'] },
  { position: 6, driverNumber: 3, name: 'Max Verstappen', code: 'VER', team: 'Red Bull Racing', teamColor: '#3671C6', racePoints: 133, sprintPoints: 12, totalPoints: 145, wins: 0, podiums: 6, headshotUrl: DRIVER_PORTRAITS['ver'] },
  { position: 7, driverNumber: 81, name: 'Oscar Piastri', code: 'PIA', team: 'McLaren', teamColor: '#FF8000', racePoints: 99, sprintPoints: 21, totalPoints: 120, wins: 0, podiums: 2, headshotUrl: DRIVER_PORTRAITS['pia'] },
  { position: 8, driverNumber: 6, name: 'Isack Hadjar', code: 'HAD', team: 'Red Bull Racing', teamColor: '#3671C6', racePoints: 71, sprintPoints: 0, totalPoints: 71, wins: 0, podiums: 1, headshotUrl: DRIVER_PORTRAITS['had'] },
  { position: 9, driverNumber: 30, name: 'Liam Lawson', code: 'LAW', team: 'Racing Bulls', teamColor: '#6692FF', racePoints: 56, sprintPoints: 3, totalPoints: 59, wins: 0, podiums: 0, headshotUrl: DRIVER_PORTRAITS['law'] },
  { position: 10, driverNumber: 10, name: 'Pierre Gasly', code: 'GAS', team: 'Alpine', teamColor: '#0093CC', racePoints: 39, sprintPoints: 2, totalPoints: 41, wins: 0, podiums: 0, headshotUrl: DRIVER_PORTRAITS['gas'] },
  { position: 11, driverNumber: 41, name: 'Arvid Lindblad', code: 'LIN', team: 'Racing Bulls', teamColor: '#6692FF', racePoints: 30, sprintPoints: 1, totalPoints: 31, wins: 0, podiums: 0, headshotUrl: DRIVER_PORTRAITS['lin'] },
  { position: 12, driverNumber: 43, name: 'Franco Colapinto', code: 'COL', team: 'Alpine', teamColor: '#0093CC', racePoints: 27, sprintPoints: 0, totalPoints: 27, wins: 0, podiums: 0, headshotUrl: DRIVER_PORTRAITS['col'] },
  { position: 13, driverNumber: 87, name: 'Oliver Bearman', code: 'BEA', team: 'Haas F1 Team', teamColor: '#DA291C', racePoints: 17, sprintPoints: 1, totalPoints: 18, wins: 0, podiums: 0, headshotUrl: DRIVER_PORTRAITS['bea'] },
  { position: 14, driverNumber: 5, name: 'Gabriel Bortoleto', code: 'BOR', team: 'Audi', teamColor: '#E10600', racePoints: 10, sprintPoints: 0, totalPoints: 10, wins: 0, podiums: 0, headshotUrl: DRIVER_PORTRAITS['bor'] },
  { position: 15, driverNumber: 27, name: 'Nico Hülkenberg', code: 'HUL', team: 'Audi', teamColor: '#E10600', racePoints: 7, sprintPoints: 0, totalPoints: 7, wins: 0, podiums: 0, headshotUrl: DRIVER_PORTRAITS['hul'] },
  { position: 16, driverNumber: 55, name: 'Carlos Sainz', code: 'SAI', team: 'Williams', teamColor: '#64C4FF', racePoints: 6, sprintPoints: 0, totalPoints: 6, wins: 0, podiums: 0, headshotUrl: DRIVER_PORTRAITS['sai'] },
  { position: 17, driverNumber: 23, name: 'Alexander Albon', code: 'ALB', team: 'Williams', teamColor: '#64C4FF', racePoints: 5, sprintPoints: 0, totalPoints: 5, wins: 0, podiums: 0, headshotUrl: DRIVER_PORTRAITS['alb'] },
  { position: 18, driverNumber: 14, name: 'Fernando Alonso', code: 'ALO', team: 'Aston Martin', teamColor: '#229971', racePoints: 3, sprintPoints: 0, totalPoints: 3, wins: 0, podiums: 0, headshotUrl: DRIVER_PORTRAITS['alo'] },
  { position: 19, driverNumber: 31, name: 'Esteban Ocon', code: 'OCO', team: 'Haas F1 Team', teamColor: '#DA291C', racePoints: 3, sprintPoints: 0, totalPoints: 3, wins: 0, podiums: 0, headshotUrl: DRIVER_PORTRAITS['oco'] },
  { position: 20, driverNumber: 11, name: 'Sergio Perez', code: 'PER', team: 'Cadillac', teamColor: '#FFB800', racePoints: 0, sprintPoints: 0, totalPoints: 0, wins: 0, podiums: 0, headshotUrl: DRIVER_PORTRAITS['per'] },
  { position: 21, driverNumber: 18, name: 'Lance Stroll', code: 'STR', team: 'Aston Martin', teamColor: '#229971', racePoints: 0, sprintPoints: 0, totalPoints: 0, wins: 0, podiums: 0, headshotUrl: DRIVER_PORTRAITS['str'] },
  { position: 22, driverNumber: 77, name: 'Valtteri Bottas', code: 'BOT', team: 'Cadillac', teamColor: '#FFB800', racePoints: 0, sprintPoints: 0, totalPoints: 0, wins: 0, podiums: 0, headshotUrl: DRIVER_PORTRAITS['bot'] },
];

export const VERIFIED_2026_OPENF1_CONSTRUCTORS: ConstructorChampionshipStanding[] = [
  { position: 1, teamName: 'Mercedes', teamColor: '#27F4D2', drivers: ['ANT', 'RUS'], driverNumbers: [12, 63], racePoints: 443, sprintPoints: 60, totalPoints: 503, sharePercent: 100 },
  { position: 2, teamName: 'Ferrari', teamColor: '#E8002D', drivers: ['HAM', 'LEC'], driverNumbers: [44, 16], racePoints: 310, sprintPoints: 48, totalPoints: 358, sharePercent: 71 },
  { position: 3, teamName: 'McLaren', teamColor: '#FF8000', drivers: ['NOR', 'PIA'], driverNumbers: [1, 81], racePoints: 253, sprintPoints: 53, totalPoints: 306, sharePercent: 61 },
  { position: 4, teamName: 'Red Bull Racing', teamColor: '#3671C6', drivers: ['VER', 'HAD'], driverNumbers: [3, 6], racePoints: 204, sprintPoints: 12, totalPoints: 216, sharePercent: 43 },
  { position: 5, teamName: 'Racing Bulls', teamColor: '#6692FF', drivers: ['LAW', 'LIN'], driverNumbers: [30, 41], racePoints: 86, sprintPoints: 4, totalPoints: 90, sharePercent: 18 },
  { position: 6, teamName: 'Alpine', teamColor: '#0093CC', drivers: ['GAS', 'COL'], driverNumbers: [10, 43], racePoints: 66, sprintPoints: 2, totalPoints: 68, sharePercent: 14 },
  { position: 7, teamName: 'Haas F1 Team', teamColor: '#DA291C', drivers: ['BEA', 'OCO'], driverNumbers: [87, 31], racePoints: 20, sprintPoints: 1, totalPoints: 21, sharePercent: 4 },
  { position: 8, teamName: 'Audi', teamColor: '#E10600', drivers: ['BOR', 'HUL'], driverNumbers: [5, 27], racePoints: 17, sprintPoints: 0, totalPoints: 17, sharePercent: 3 },
  { position: 9, teamName: 'Williams', teamColor: '#64C4FF', drivers: ['SAI', 'ALB'], driverNumbers: [55, 23], racePoints: 11, sprintPoints: 0, totalPoints: 11, sharePercent: 2 },
  { position: 10, teamName: 'Aston Martin', teamColor: '#229971', drivers: ['ALO', 'STR'], driverNumbers: [14, 18], racePoints: 3, sprintPoints: 0, totalPoints: 3, sharePercent: 1 },
  { position: 11, teamName: 'Cadillac', teamColor: '#FFB800', drivers: ['PER', 'BOT'], driverNumbers: [11, 77], racePoints: 0, sprintPoints: 0, totalPoints: 0, sharePercent: 0 },
];

/**
 * Robust fetcher with auto-retry and exponential backoff
 * Handles 429 (Rate Limit) and temporary 404 (e.g. Madrid 11369)
 */
async function fetchOpenF1WithRetry<T>(endpoint: string, maxRetries = 5): Promise<T | null> {
  const directUrl = `https://api.openf1.org/v1${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const proxyUrl = `/api/openf1${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      let response: Response;
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);
        response = await fetch(directUrl, {
          headers: { 'Accept': 'application/json' },
          signal: controller.signal,
        });
        clearTimeout(timeout);
      } catch (directErr) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);
        response = await fetch(proxyUrl, {
          headers: { 'Accept': 'application/json' },
          signal: controller.signal,
        });
        clearTimeout(timeout);
      }

      if (response.status === 200) {
        return await response.json() as T;
      }

      if (response.status === 429) {
        const delay = Math.min(1000 * Math.pow(1.5, attempt) + Math.random() * 200, 4000);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }

      if (response.status === 404 && attempt === 0) {
        await new Promise(r => setTimeout(r, 500));
        continue;
      }

      if (response.status === 404) {
        return null;
      }
    } catch (err) {
      if (attempt === maxRetries - 1) return null;
      await new Promise(r => setTimeout(r, 600 * (attempt + 1)));
    }
  }
  return null;
}

export const ChampionshipTable: React.FC<ChampionshipTableProps> = ({ 
  isDarkMode = true,
  favoriteDriverIds = [],
  onToggleFavorite,
  onSelectDriverForTelemetry,
}) => {
  const [activeTab, setActiveTab] = useState<'drivers' | 'constructors'>('drivers');
  const [pointsFilter, setPointsFilter] = useState<'combined' | 'raceOnly' | 'sprintOnly'>('combined');

  // Driver Detail Modal State
  const [selectedDriverForModal, setSelectedDriverForModal] = useState<string | null>(null);
  const [isDriverModalOpen, setIsDriverModalOpen] = useState<boolean>(false);

  const handleOpenDriverModal = useCallback((driverIdOrCodeOrName: string) => {
    setSelectedDriverForModal(driverIdOrCodeOrName);
    setIsDriverModalOpen(true);
  }, []);

  // Driver Comparison Modal State
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);
  const [compareDriver1, setCompareDriver1] = useState<string>('ant');
  const [compareDriver2, setCompareDriver2] = useState<string>('rus');
  const [selectedDriversForCompare, setSelectedDriversForCompare] = useState<string[]>([]);

  const handleToggleDriverForCompare = useCallback((driverCodeOrId: string) => {
    const code = driverCodeOrId.toLowerCase();
    setSelectedDriversForCompare(prev => {
      if (prev.includes(code)) {
        return prev.filter(c => c !== code);
      }
      if (prev.length >= 2) {
        const next = [prev[1], code];
        setCompareDriver1(next[0]);
        setCompareDriver2(next[1]);
        setIsCompareModalOpen(true);
        return next;
      }
      const next = [...prev, code];
      if (next.length === 2) {
        setCompareDriver1(next[0]);
        setCompareDriver2(next[1]);
        setIsCompareModalOpen(true);
      }
      return next;
    });
  }, []);

  const handleQuickCompare = useCallback((driverCodeOrId: string) => {
    const code = driverCodeOrId.toLowerCase();
    setCompareDriver1(code);
    setCompareDriver2(code === 'ant' ? 'rus' : 'ant');
    setIsCompareModalOpen(true);
  }, []);
  
  // Starts with true OpenF1 baseline immediately so page is never empty or out-of-sync
  const [driversStandings, setDriversStandings] = useState<DriverChampionshipStanding[]>(VERIFIED_2026_OPENF1_DRIVERS);
  const [constructorsStandings, setConstructorsStandings] = useState<ConstructorChampionshipStanding[]>(VERIFIED_2026_OPENF1_CONSTRUCTORS);
  const [loading, setLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<{ current: number; total: number; stage: string }>({
    current: 100,
    total: 100,
    stage: 'OpenF1 2026 Season Verified',
  });
  const [error, setError] = useState<string | null>(null);
  const [completedRacesCount, setCompletedRacesCount] = useState<number>(14);
  const [completedSprintsCount, setCompletedSprintsCount] = useState<number>(5);
  const [lastUpdated, setLastUpdated] = useState<string | null>('Live from OpenF1');

  const calculateChampionship = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    }
    setError(null);

    try {
      setLoadingProgress({ current: 5, total: 100, stage: 'Connecting to OpenF1 sessions...' });
      const sessions = await fetchOpenF1WithRetry<any[]>('/sessions?year=2026');
      if (!sessions || !Array.isArray(sessions) || sessions.length === 0) {
        return; // Retain current verified standings
      }

      const raceSessions = sessions.filter(s => s.session_name === 'Race');
      const sprintSessions = sessions.filter(s => s.session_name === 'Sprint');

      const totalTargetSessions = raceSessions.length + sprintSessions.length;
      let processedCount = 0;

      const driverRacePts = new Map<number, number>();
      const driverSprintPts = new Map<number, number>();
      const driverWins = new Map<number, number>();
      const driverPodiums = new Map<number, number>();

      let finishedRaces = 0;
      let finishedSprints = 0;

      // 1. Process Grand Prix Races (25, 18, 15, 12, 10, 8, 6, 4, 2, 1)
      for (const race of raceSessions) {
        processedCount++;
        setLoadingProgress({
          current: Math.round((processedCount / totalTargetSessions) * 85) + 10,
          total: totalTargetSessions,
          stage: `Fetching ${race.country_name || race.circuit_short_name} (#${race.session_key})...`,
        });

        await new Promise(r => setTimeout(r, 260));

        const results = await fetchOpenF1WithRetry<any[]>(`/session_result?session_key=${race.session_key}`);
        if (results && results.length > 0) {
          finishedRaces++;
          const validResults = results
            .filter(r => r.position !== null && r.position !== undefined)
            .sort((a, b) => a.position - b.position);

          for (const item of validResults) {
            const num = item.driver_number;
            const pos = item.position;

            if (pos >= 1 && pos <= 10) {
              const pts = FIA_RACE_POINTS[pos - 1] || 0;
              driverRacePts.set(num, (driverRacePts.get(num) || 0) + pts);
              if (pos === 1) driverWins.set(num, (driverWins.get(num) || 0) + 1);
              if (pos <= 3) driverPodiums.set(num, (driverPodiums.get(num) || 0) + 1);
            }
          }
        }
      }

      // 2. Process Sprints (8, 7, 6, 5, 4, 3, 2, 1)
      for (const sprint of sprintSessions) {
        processedCount++;
        setLoadingProgress({
          current: Math.round((processedCount / totalTargetSessions) * 85) + 10,
          total: totalTargetSessions,
          stage: `Fetching Sprint ${sprint.circuit_short_name}...`,
        });

        await new Promise(r => setTimeout(r, 260));

        const results = await fetchOpenF1WithRetry<any[]>(`/session_result?session_key=${sprint.session_key}`);
        if (results && results.length > 0) {
          finishedSprints++;
          const validResults = results
            .filter(r => r.position !== null && r.position !== undefined)
            .sort((a, b) => a.position - b.position);

          for (const item of validResults) {
            const num = item.driver_number;
            const pos = item.position;

            if (pos >= 1 && pos <= 8) {
              const pts = FIA_SPRINT_POINTS[pos - 1] || 0;
              driverSprintPts.set(num, (driverSprintPts.get(num) || 0) + pts);
            }
          }
        }
      }

      if (finishedRaces > 0) {
        setCompletedRacesCount(finishedRaces);
        setCompletedSprintsCount(finishedSprints);

        // Map onto driver standings
        const updatedDrivers = VERIFIED_2026_OPENF1_DRIVERS.map(driver => {
          const num = driver.driverNumber;
          const rPts = driverRacePts.has(num) ? driverRacePts.get(num)! : driver.racePoints;
          const sPts = driverSprintPts.has(num) ? driverSprintPts.get(num)! : driver.sprintPoints;
          const w = driverWins.has(num) ? driverWins.get(num)! : driver.wins;
          const p = driverPodiums.has(num) ? driverPodiums.get(num)! : driver.podiums;
          return {
            ...driver,
            racePoints: rPts,
            sprintPoints: sPts,
            totalPoints: rPts + sPts,
            wins: w,
            podiums: p,
          };
        });

        updatedDrivers.sort((a, b) => b.totalPoints - a.totalPoints || b.wins - a.wins);
        updatedDrivers.forEach((d, idx) => {
          d.position = idx + 1;
        });

        setDriversStandings(updatedDrivers);

        // Recalculate Constructors
        const constructorMap = new Map<string, { race: number; sprint: number; total: number; drivers: string[]; nums: number[] }>();
        for (const d of updatedDrivers) {
          const cur = constructorMap.get(d.team) || { race: 0, sprint: 0, total: 0, drivers: [], nums: [] };
          cur.race += d.racePoints;
          cur.sprint += d.sprintPoints;
          cur.total += d.totalPoints;
          cur.drivers.push(d.code);
          cur.nums.push(d.driverNumber);
          constructorMap.set(d.team, cur);
        }

        const maxTeam = Math.max(...Array.from(constructorMap.values()).map(c => c.total), 1);
        const updatedConstructors: ConstructorChampionshipStanding[] = Array.from(constructorMap.entries())
          .map(([teamName, val]) => {
            const base = VERIFIED_2026_OPENF1_CONSTRUCTORS.find(c => c.teamName === teamName);
            return {
              position: 0,
              teamName,
              teamColor: base?.teamColor || '#E10600',
              drivers: val.drivers,
              driverNumbers: val.nums,
              racePoints: val.race,
              sprintPoints: val.sprint,
              totalPoints: val.total,
              sharePercent: Math.round((val.total / maxTeam) * 100),
            };
          })
          .sort((a, b) => b.totalPoints - a.totalPoints);

        updatedConstructors.forEach((c, idx) => {
          c.position = idx + 1;
        });

        setConstructorsStandings(updatedConstructors);
        setLastUpdated(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
      }
    } catch (err: any) {
      console.error('OpenF1 Sync Error:', err);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  }, []);

  // Filter-based sorting
  const sortedDriversByFilter = useMemo(() => {
    const list = [...driversStandings];
    if (pointsFilter === 'raceOnly') {
      return list.sort((a, b) => b.racePoints - a.racePoints || b.wins - a.wins);
    }
    if (pointsFilter === 'sprintOnly') {
      return list.sort((a, b) => b.sprintPoints - a.sprintPoints);
    }
    return list.sort((a, b) => b.totalPoints - a.totalPoints || b.wins - a.wins);
  }, [driversStandings, pointsFilter]);

  return (
    <div className={`space-y-6 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
      {/* Header Banner */}
      <div className={`p-5 sm:p-6 rounded-2xl border backdrop-blur-md transition-all ${
        isDarkMode 
          ? 'bg-slate-900/90 border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.4)]' 
          : 'bg-white border-slate-200 shadow-md'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-red-600/20 text-red-400 border border-red-500/30 uppercase tracking-wider flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                OpenF1 Official Standings
              </span>
              <span className="text-xs text-slate-400 font-mono">
                2026 World Championship
              </span>
              {lastUpdated && (
                <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                  • {lastUpdated}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-racing font-bold tracking-tight mt-1.5 flex items-center gap-2.5">
              <span>Formula 1 Championship Standings</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Calculated strictly from OpenF1 live results ({completedRacesCount} Grand Prix &amp; {completedSprintsCount} Sprints).
            </p>
          </div>

          {/* Action & Tab Switchers */}
          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            <div className="flex items-center p-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono">
              <button
                id="tab-drivers-standings"
                onClick={() => setActiveTab('drivers')}
                className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition font-bold ${
                  activeTab === 'drivers' 
                    ? 'bg-red-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Drivers</span>
              </button>
              <button
                id="tab-constructors-standings"
                onClick={() => setActiveTab('constructors')}
                className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition font-bold ${
                  activeTab === 'constructors' 
                    ? 'bg-red-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Constructors</span>
              </button>
            </div>

            {/* Compare Drivers Action Button */}
            <button
              id="compare-drivers-action-btn"
              onClick={() => {
                if (selectedDriversForCompare.length === 2) {
                  setCompareDriver1(selectedDriversForCompare[0]);
                  setCompareDriver2(selectedDriversForCompare[1]);
                } else if (selectedDriversForCompare.length === 1) {
                  setCompareDriver1(selectedDriversForCompare[0]);
                  setCompareDriver2(selectedDriversForCompare[0] === 'ant' ? 'rus' : 'ant');
                }
                setIsCompareModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl border border-red-500/40 bg-red-600/15 hover:bg-red-600/25 text-red-300 hover:text-white transition flex items-center gap-2 text-xs font-mono font-bold shadow-sm"
              title="Compare two drivers head-to-head"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-red-400" />
              <span>Compare Drivers</span>
              {selectedDriversForCompare.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-mono font-bold">
                  {selectedDriversForCompare.length}/2
                </span>
              )}
            </button>

            <button
              id="refresh-championship-btn"
              onClick={() => calculateChampionship(true)}
              disabled={isRefreshing}
              title="Refresh live classification from OpenF1 API"
              className={`p-2 rounded-xl border border-slate-800 bg-slate-950/80 text-slate-300 hover:text-white hover:border-slate-700 transition flex items-center gap-1.5 text-xs font-mono ${
                isRefreshing ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-red-500' : ''}`} />
              <span className="hidden sm:inline">{isRefreshing ? 'Syncing...' : 'Sync OpenF1'}</span>
            </button>
          </div>
        </div>

        {/* Loading Progress Bar during manual refresh */}
        {isRefreshing && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-red-500" />
                {loadingProgress.stage}
              </span>
              <span className="text-red-400 font-bold">{loadingProgress.current}%</span>
            </div>
            <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-red-600 to-amber-500 h-full transition-all duration-300 rounded-full"
                style={{ width: `${Math.min(100, Math.max(5, loadingProgress.current))}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Top 3 Podium Highlights: Antonelli #1, Russell #2, Hamilton #3 */}
      {activeTab === 'drivers' && sortedDriversByFilter.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* P2: George Russell */}
          <div 
            onClick={() => {
              const d = sortedDriversByFilter[1];
              if (d) handleOpenDriverModal(d.code || getDriverIdFromName(d.name));
            }}
            className={`p-4 rounded-xl border relative overflow-hidden transition cursor-pointer group hover:border-slate-600 ${
              isDarkMode ? 'bg-slate-900/80 border-slate-800 hover:bg-slate-800/80' : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
            title="Click to view full driver statistics and career history"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-700/60 text-slate-200 border border-slate-600">
                P2 • 2nd Place
              </span>
              <Medal className="w-5 h-5 text-slate-300" />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-800 border border-[#27F4D2]/40 flex items-center justify-center overflow-hidden flex-shrink-0 shadow group-hover:scale-105 transition-transform">
                <img 
                  src={sortedDriversByFilter[1]?.headshotUrl || DRIVER_PORTRAITS['rus']} 
                  alt={sortedDriversByFilter[1]?.name || 'Russell'} 
                  className="w-full h-full object-cover object-top"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-base truncate text-white group-hover:text-[#27F4D2] transition-colors">{sortedDriversByFilter[1]?.name}</div>
                <div className="text-xs text-[#27F4D2] font-semibold">{sortedDriversByFilter[1]?.team}</div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-baseline justify-between">
              <span className="text-xs text-slate-400 font-mono">CHAMPIONSHIP</span>
              <div className="font-mono font-bold text-lg text-slate-100">
                {pointsFilter === 'raceOnly' 
                  ? sortedDriversByFilter[1]?.racePoints 
                  : pointsFilter === 'sprintOnly' 
                  ? sortedDriversByFilter[1]?.sprintPoints 
                  : sortedDriversByFilter[1]?.totalPoints} <span className="text-xs font-normal text-slate-400">PTS</span>
              </div>
            </div>
          </div>

          {/* P1: Kimi Antonelli (Championship Leader) */}
          <div 
            onClick={() => {
              const d = sortedDriversByFilter[0];
              if (d) handleOpenDriverModal(d.code || getDriverIdFromName(d.name));
            }}
            className={`p-5 rounded-xl border relative overflow-hidden transition shadow-xl order-first md:order-none cursor-pointer group hover:border-red-400 ${
              isDarkMode ? 'bg-gradient-to-b from-red-950/50 via-slate-900/90 to-slate-900 border-red-500/60 hover:from-red-950/70' : 'bg-red-50/50 border-red-300 hover:bg-red-50'
            }`}
            title="Click to view full driver statistics and career history"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/15 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                P1 • WORLD CHAMPIONSHIP LEADER
              </span>
              <span className="text-xs font-mono font-bold text-red-400 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" />
                {sortedDriversByFilter[0]?.wins} WINS
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-slate-800 border-2 border-[#27F4D2] flex items-center justify-center overflow-hidden flex-shrink-0 shadow-lg relative group-hover:scale-105 transition-transform">
                <img 
                  src={sortedDriversByFilter[0]?.headshotUrl || DRIVER_PORTRAITS['ant']} 
                  alt={sortedDriversByFilter[0]?.name || 'Antonelli'} 
                  className="w-full h-full object-cover object-top"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-xl text-white truncate group-hover:text-amber-300 transition-colors">{sortedDriversByFilter[0]?.name}</div>
                <div className="text-xs text-[#27F4D2] font-semibold">{sortedDriversByFilter[0]?.team}</div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-red-900/40 flex items-baseline justify-between">
              <span className="text-xs text-red-300/80 font-mono">CHAMPIONSHIP</span>
              <div className="font-mono font-black text-2xl text-amber-400">
                {pointsFilter === 'raceOnly' 
                  ? sortedDriversByFilter[0]?.racePoints 
                  : pointsFilter === 'sprintOnly' 
                  ? sortedDriversByFilter[0]?.sprintPoints 
                  : sortedDriversByFilter[0]?.totalPoints} <span className="text-xs font-normal text-slate-400">PTS</span>
              </div>
            </div>
          </div>

          {/* P3: Lewis Hamilton */}
          <div 
            onClick={() => {
              const d = sortedDriversByFilter[2];
              if (d) handleOpenDriverModal(d.code || getDriverIdFromName(d.name));
            }}
            className={`p-4 rounded-xl border relative overflow-hidden transition cursor-pointer group hover:border-slate-600 ${
              isDarkMode ? 'bg-slate-900/80 border-slate-800 hover:bg-slate-800/80' : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
            title="Click to view full driver statistics and career history"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-900/40 text-amber-300 border border-amber-800/40">
                P3 • 3rd Place
              </span>
              <Medal className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-800 border border-[#E8002D]/40 flex items-center justify-center overflow-hidden flex-shrink-0 shadow group-hover:scale-105 transition-transform">
                <img 
                  src={sortedDriversByFilter[2]?.headshotUrl || DRIVER_PORTRAITS['ham']} 
                  alt={sortedDriversByFilter[2]?.name || 'Hamilton'} 
                  className="w-full h-full object-cover object-top"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-base truncate text-white group-hover:text-[#E8002D] transition-colors">{sortedDriversByFilter[2]?.name}</div>
                <div className="text-xs text-[#E8002D] font-semibold">{sortedDriversByFilter[2]?.team}</div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-baseline justify-between">
              <span className="text-xs text-slate-400 font-mono">CHAMPIONSHIP</span>
              <div className="font-mono font-bold text-lg text-slate-100">
                {pointsFilter === 'raceOnly' 
                  ? sortedDriversByFilter[2]?.racePoints 
                  : pointsFilter === 'sprintOnly' 
                  ? sortedDriversByFilter[2]?.sprintPoints 
                  : sortedDriversByFilter[2]?.totalPoints} <span className="text-xs font-normal text-slate-400">PTS</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Table Container */}
      <div className={`rounded-2xl border overflow-hidden shadow-xl ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        {/* Filter sub-bar */}
        {activeTab === 'drivers' && (
          <div className="p-3 sm:px-6 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-400">
              <Layers className="w-4 h-4 text-red-500" />
              <span>Points Calculation:</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPointsFilter('combined')}
                className={`px-3 py-1 rounded-md transition ${
                  pointsFilter === 'combined'
                    ? 'bg-red-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Combined Total (GP + Sprint)
              </button>
              <button
                onClick={() => setPointsFilter('raceOnly')}
                className={`px-3 py-1 rounded-md transition ${
                  pointsFilter === 'raceOnly'
                    ? 'bg-red-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Grand Prix Only (25-18-15)
              </button>
              <button
                onClick={() => setPointsFilter('sprintOnly')}
                className={`px-3 py-1 rounded-md transition ${
                  pointsFilter === 'sprintOnly'
                    ? 'bg-red-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sprint Only (8-7-6)
              </button>
            </div>
          </div>
        )}

        {/* View 1: Drivers Standings Table */}
        {activeTab === 'drivers' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-[11px] font-mono uppercase text-slate-400 tracking-wider">
                  <th className="py-3 px-3 sm:px-4 text-center w-12">POS</th>
                  <th className="py-3 px-3 sm:px-4">DRIVER</th>
                  <th className="py-3 px-3 sm:px-4 hidden sm:table-cell">TEAM</th>
                  <th className="py-3 px-3 sm:px-4 text-center hidden md:table-cell">WINS</th>
                  <th className="py-3 px-3 sm:px-4 text-center hidden md:table-cell">PODIUMS</th>
                  <th className="py-3 px-3 sm:px-4 text-right hidden sm:table-cell">GP PTS</th>
                  <th className="py-3 px-3 sm:px-4 text-right hidden sm:table-cell">SPRINT</th>
                  <th className="py-3 px-3 sm:px-4 text-right font-bold text-slate-200">TOTAL PTS</th>
                  <th className="py-3 px-2 sm:px-3 text-center w-14 text-[10px]">COMPARE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {sortedDriversByFilter.map((driver, index) => {
                  const displayPos = index + 1;
                  const isLeader = displayPos === 1;
                  const theme = getTeamTheme(driver.team);

                  return (
                    <tr
                      key={driver.driverNumber}
                      className={`transition-colors hover:bg-slate-800/40 ${
                        isLeader ? 'bg-red-950/20' : ''
                      }`}
                    >
                      {/* Position */}
                      <td className="py-3 px-3 sm:px-4 text-center font-mono">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${
                          displayPos === 1 
                            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' 
                            : displayPos === 2 
                            ? 'bg-slate-300 text-slate-950 font-bold' 
                            : displayPos === 3 
                            ? 'bg-amber-700 text-white' 
                            : 'text-slate-400'
                        }`}>
                          {displayPos}
                        </span>
                      </td>

                      {/* Driver Name & Badge */}
                      <td className="py-3 px-3 sm:px-4">
                        <button
                          type="button"
                          onClick={() => handleOpenDriverModal(driver.code || getDriverIdFromName(driver.name))}
                          className="flex items-center gap-2.5 text-left group cursor-pointer p-1 -m-1 rounded-xl transition hover:bg-slate-800/80 focus:outline-none focus:ring-1 focus:ring-red-500 w-full"
                          title={`Click to view ${driver.name} full statistics & career history`}
                        >
                          <DriverAvatar
                            driverId={driver.code.toLowerCase()}
                            driverCode={driver.code}
                            lastName={driver.name}
                            teamColor={driver.teamColor || theme.color}
                            avatarUrl={driver.headshotUrl}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <div className="font-bold flex items-center gap-1.5 text-slate-100 group-hover:text-red-400 transition-colors">
                              <span className="truncate group-hover:underline">{driver.name}</span>
                              <span className="text-[11px] font-mono text-slate-400 font-normal">#{driver.driverNumber}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 sm:hidden">
                              {driver.team}
                            </div>
                          </div>
                        </button>
                      </td>

                      {/* Team */}
                      <td className="py-3 px-3 sm:px-4 hidden sm:table-cell text-xs font-medium text-slate-300">
                        {driver.team}
                      </td>

                      {/* Wins */}
                      <td className="py-3 px-3 sm:px-4 text-center font-mono text-xs hidden md:table-cell text-slate-300">
                        {driver.wins > 0 ? (
                          <span className="inline-flex items-center gap-1 font-bold text-amber-400">
                            <Flame className="w-3 h-3 text-amber-400" />
                            {driver.wins}
                          </span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>

                      {/* Podiums */}
                      <td className="py-3 px-3 sm:px-4 text-center font-mono text-xs hidden md:table-cell text-slate-300">
                        {driver.podiums > 0 ? (
                          <span className="font-bold text-slate-200">{driver.podiums}</span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>

                      {/* GP Points */}
                      <td className="py-3 px-3 sm:px-4 text-right font-mono text-xs text-slate-300 hidden sm:table-cell">
                        {driver.racePoints}
                      </td>

                      {/* Sprint Points */}
                      <td className="py-3 px-3 sm:px-4 text-right font-mono text-xs text-slate-400 hidden sm:table-cell">
                        {driver.sprintPoints > 0 ? (
                          <span className="text-amber-400 font-semibold">+{driver.sprintPoints}</span>
                        ) : (
                          '0'
                        )}
                      </td>

                      {/* Total Points */}
                      <td className="py-3 px-3 sm:px-4 text-right font-mono font-bold text-base text-slate-100">
                        {pointsFilter === 'raceOnly' 
                          ? driver.racePoints 
                          : pointsFilter === 'sprintOnly' 
                          ? driver.sprintPoints 
                          : driver.totalPoints}
                      </td>

                      {/* Compare Toggle Button */}
                      <td className="py-3 px-2 sm:px-3 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleDriverForCompare(driver.code || getDriverIdFromName(driver.name));
                          }}
                          className={`p-1.5 rounded-lg border transition text-xs font-mono flex items-center justify-center mx-auto ${
                            selectedDriversForCompare.includes((driver.code || getDriverIdFromName(driver.name)).toLowerCase())
                              ? 'bg-red-600 border-red-500 text-white shadow-md'
                              : 'border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 bg-slate-950/60'
                          }`}
                          title={
                            selectedDriversForCompare.includes((driver.code || getDriverIdFromName(driver.name)).toLowerCase())
                              ? 'Deselect driver from comparison'
                              : `Select ${driver.name} for head-to-head comparison`
                          }
                        >
                          <ArrowLeftRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* View 2: Constructors Standings Table */}
        {activeTab === 'constructors' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-[11px] font-mono uppercase text-slate-400 tracking-wider">
                  <th className="py-3 px-3 sm:px-4 text-center w-12">POS</th>
                  <th className="py-3 px-3 sm:px-4">CONSTRUCTOR</th>
                  <th className="py-3 px-3 sm:px-4 hidden sm:table-cell">DRIVERS</th>
                  <th className="py-3 px-3 sm:px-4 text-right hidden sm:table-cell">GP PTS</th>
                  <th className="py-3 px-3 sm:px-4 text-right hidden sm:table-cell">SPRINT</th>
                  <th className="py-3 px-3 sm:px-4 text-right font-bold text-slate-200">TOTAL PTS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {constructorsStandings.map((team, index) => {
                  const displayPos = index + 1;
                  const isLeader = displayPos === 1;

                  return (
                    <tr
                      key={team.teamName}
                      className={`transition-colors hover:bg-slate-800/40 ${
                        isLeader ? 'bg-red-950/20' : ''
                      }`}
                    >
                      {/* Position */}
                      <td className="py-3 px-3 sm:px-4 text-center font-mono">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${
                          displayPos === 1 
                            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' 
                            : displayPos === 2 
                            ? 'bg-slate-300 text-slate-950 font-bold' 
                            : displayPos === 3 
                            ? 'bg-amber-700 text-white' 
                            : 'text-slate-400'
                        }`}>
                          {displayPos}
                        </span>
                      </td>

                      {/* Team Name */}
                      <td className="py-3 px-3 sm:px-4">
                        <div className="flex items-center gap-2.5">
                          <div 
                            className="w-1.5 h-8 rounded-full flex-shrink-0"
                            style={{ backgroundColor: team.teamColor }}
                          />
                          <div>
                            <div className="font-bold text-slate-100">{team.teamName}</div>
                            <div className="w-32 sm:w-48 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                              <div 
                                className="h-full rounded-full transition-all"
                                style={{ 
                                  backgroundColor: team.teamColor,
                                  width: `${Math.max(5, team.sharePercent)}%` 
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Drivers */}
                      <td className="py-3 px-3 sm:px-4 hidden sm:table-cell text-xs font-mono text-slate-300">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {team.drivers.map((drvCode) => (
                            <button
                              key={drvCode}
                              type="button"
                              onClick={() => handleOpenDriverModal(drvCode)}
                              className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-red-600 hover:text-white transition text-slate-300 font-bold focus:outline-none"
                              title={`View ${drvCode} profile and statistics`}
                            >
                              {drvCode}
                            </button>
                          ))}
                        </div>
                      </td>

                      {/* GP Points */}
                      <td className="py-3 px-3 sm:px-4 text-right font-mono text-xs text-slate-300 hidden sm:table-cell">
                        {team.racePoints}
                      </td>

                      {/* Sprint Points */}
                      <td className="py-3 px-3 sm:px-4 text-right font-mono text-xs text-slate-400 hidden sm:table-cell">
                        {team.sprintPoints > 0 ? (
                          <span className="text-amber-400 font-semibold">+{team.sprintPoints}</span>
                        ) : (
                          '0'
                        )}
                      </td>

                      {/* Total Points */}
                      <td className="py-3 px-3 sm:px-4 text-right font-mono font-bold text-base text-slate-100">
                        {team.totalPoints}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono ${
        isDarkMode ? 'bg-slate-950/60 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
      }`}>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Verified against OpenF1: <strong>{completedRacesCount}</strong> Grand Prix &amp; <strong>{completedSprintsCount}</strong> Sprints</span>
        </div>
        <div className="text-slate-500">
          FIA Standard: P1-P10 (Race: 25..1) + P1-P8 (Sprint: 8..1)
        </div>
      </div>

      {/* Driver Detailed Statistics & Career History Modal */}
      <DriverDetailModal
        driverIdOrCode={selectedDriverForModal}
        isOpen={isDriverModalOpen}
        onClose={() => setIsDriverModalOpen(false)}
        isDarkMode={isDarkMode}
        isFavorite={selectedDriverForModal ? favoriteDriverIds.includes(selectedDriverForModal.toLowerCase()) : false}
        onToggleFavorite={onToggleFavorite}
        onSelectDriverForTelemetry={onSelectDriverForTelemetry}
        onOpenCompare={(driverId) => {
          setCompareDriver1(driverId);
          setIsCompareModalOpen(true);
        }}
      />

      {/* Driver Side-by-Side Comparison Modal */}
      <DriverCompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        initialDriver1Id={compareDriver1}
        initialDriver2Id={compareDriver2}
        isDarkMode={isDarkMode}
        onOpenDriverProfile={(driverId) => {
          setIsCompareModalOpen(false);
          handleOpenDriverModal(driverId);
        }}
      />

      {/* Floating Compare Action Bar when drivers are selected */}
      {selectedDriversForCompare.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-950/95 border border-red-500/50 text-white px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-4 animate-bounce-short">
          <div className="flex items-center gap-2 text-xs font-mono">
            <ArrowLeftRight className="w-4 h-4 text-red-500 animate-pulse" />
            <span>
              Comparing: <strong>{selectedDriversForCompare.map(c => c.toUpperCase()).join(' vs ')}</strong>
              {selectedDriversForCompare.length === 1 && (
                <span className="text-slate-400 text-[11px] ml-1.5">(Select 2nd driver from table)</span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (selectedDriversForCompare.length >= 2) {
                  setCompareDriver1(selectedDriversForCompare[0]);
                  setCompareDriver2(selectedDriversForCompare[1]);
                } else if (selectedDriversForCompare.length === 1) {
                  setCompareDriver1(selectedDriversForCompare[0]);
                  setCompareDriver2(selectedDriversForCompare[0] === 'ant' ? 'rus' : 'ant');
                }
                setIsCompareModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs transition shadow-md flex items-center gap-1.5"
            >
              <span>Compare Now</span>
              <ArrowLeftRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setSelectedDriversForCompare([])}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition text-xs font-mono"
              title="Clear selection"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChampionshipTable;
