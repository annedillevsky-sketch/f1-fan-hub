import { Driver, Constructor, RaceEvent, SessionType, TyreCompound } from '../types';
import { INITIAL_DRIVERS, CONSTRUCTORS, RACE_CALENDAR } from '../data/f1Data';
import { DRIVER_PORTRAITS } from '../data/driverMedia';

// Environment variable configuration according to user requirements:
// API Key fetched from process.env.REACT_APP_F1_API_KEY
// Base URL: https://v1.formula-1.api-sports.io/
// Request header: x-apisports-key: process.env.REACT_APP_F1_API_KEY
export const API_BASE_URL = 'https://v1.formula-1.api-sports.io';

export const getF1ApiKey = (): string => {
  if (typeof process !== 'undefined' && process.env?.REACT_APP_F1_API_KEY) {
    return process.env.REACT_APP_F1_API_KEY;
  }
  return '';
};

// Response metadata
export interface ApiStatusInfo {
  isLive: boolean;
  status: 'idle' | 'loading' | 'live' | 'fallback' | 'rate-limited' | 'error';
  lastUpdated: string | null;
  season: string;
  hasKey: boolean;
  message?: string;
}

// API-Sports raw driver ranking interface
export interface ApiSportsDriverRankingItem {
  position: number;
  driver: {
    id: number;
    name: string;
    abbr?: string;
    number?: number;
    image?: string;
  };
  team: {
    id: number;
    name: string;
    logo?: string;
  };
  points: number | null;
  wins: number | null;
  behind: number | string | null;
  season: number;
}

// API-Sports raw team ranking interface
export interface ApiSportsTeamRankingItem {
  position: number;
  team: {
    id: number;
    name: string;
    logo?: string;
  };
  points: number | null;
  season: number;
}

// API-Sports raw race interface
export interface ApiSportsRaceItem {
  id: number;
  competition: {
    id: number;
    name: string;
    location: {
      country: string;
      city: string;
    };
  };
  circuit: {
    id: number;
    name: string;
    image?: string;
  };
  season: number;
  type: string;
  status: string;
  date: string;
  distance?: string;
  laps?: {
    total: number | null;
    current?: number | null;
  };
  fastest_lap?: {
    driver?: { id: number };
    time?: string;
  };
}

interface ApiSportsRootResponse<T> {
  get: string;
  parameters: Record<string, any>;
  errors: any[] | Record<string, any>;
  results: number;
  response: T[];
}

// Helper mappings for colors, codes, and country flags
const TEAM_COLOR_MAP: Record<string, { color: string; secondary: string }> = {
  'mercedes': { color: '#27F4D2', secondary: '#C0C0C0' },
  'mclaren': { color: '#FF8000', secondary: '#000000' },
  'ferrari': { color: '#E8002D', secondary: '#FFF200' },
  'red bull': { color: '#3671C6', secondary: '#EA1D2D' },
  'aston martin': { color: '#229971', secondary: '#CEDC00' },
  'williams': { color: '#64C4FF', secondary: '#002F6C' },
  'alpine': { color: '#0093CC', secondary: '#FD4BC7' },
  'sauber': { color: '#52E252', secondary: '#000000' },
  'kick sauber': { color: '#52E252', secondary: '#000000' },
  'rb': { color: '#6692FF', secondary: '#FFFFFF' },
  'racing bulls': { color: '#6692FF', secondary: '#FFFFFF' },
  'haas': { color: '#B6BABD', secondary: '#DA291C' },
};

const COUNTRY_FLAGS: Record<string, string> = {
  'Bahrain': '🇧🇭',
  'Saudi Arabia': '🇸🇦',
  'Australia': '🇦🇺',
  'Japan': '🇯🇵',
  'China': '🇨🇳',
  'United States': '🇺🇸',
  'USA': '🇺🇸',
  'Italy': '🇮🇹',
  'Monaco': '🇲🇨',
  'Canada': '🇨🇦',
  'Spain': '🇪🇸',
  'Austria': '🇦🇹',
  'United Kingdom': '🇬🇧',
  'Great Britain': '🇬🇧',
  'Hungary': '🇭🇺',
  'Belgium': '🇧🇪',
  'Netherlands': '🇳🇱',
  'Azerbaijan': '🇦🇿',
  'Singapore': '🇸🇬',
  'Mexico': '🇲🇽',
  'Brazil': '🇧🇷',
  'Qatar': '🇶🇦',
  'United Arab Emirates': '🇦🇪',
  'Abu Dhabi': '🇦🇪',
};

function getTeamTheme(teamName: string) {
  const lower = (teamName || '').toLowerCase();
  for (const [key, theme] of Object.entries(TEAM_COLOR_MAP)) {
    if (lower.includes(key)) return theme;
  }
  return { color: '#E10600', secondary: '#FFFFFF' };
}

function getDriverIdFromName(name: string): string {
  const lower = (name || '').toLowerCase();
  if (lower.includes('verstappen')) return 'ver';
  if (lower.includes('norris')) return 'nor';
  if (lower.includes('leclerc')) return 'lec';
  if (lower.includes('piastri')) return 'pia';
  if (lower.includes('hamilton')) return 'ham';
  if (lower.includes('russell')) return 'rus';
  if (lower.includes('antonelli')) return 'ant';
  if (lower.includes('sainz')) return 'sai';
  if (lower.includes('alonso')) return 'alo';
  if (lower.includes('gasly')) return 'gas';
  if (lower.includes('albon')) return 'alb';
  if (lower.includes('hulkenberg') || lower.includes('hülkenberg')) return 'hul';
  if (lower.includes('tsunoda')) return 'tsu';
  if (lower.includes('stroll')) return 'str';
  if (lower.includes('lawson')) return 'law';
  if (lower.includes('hadjar')) return 'had';
  if (lower.includes('ocon')) return 'oco';
  if (lower.includes('bearman')) return 'bea';
  if (lower.includes('doohan')) return 'doo';
  if (lower.includes('bortoleto')) return 'bor';
  return lower.replace(/[^a-z0-9]/g, '').slice(0, 3) || 'drv';
}

/**
 * Perform an authenticated request to API-Sports F1 endpoint
 * Supports direct fetch to https://v1.formula-1.api-sports.io/ with fallback to local proxy
 */
async function fetchFromApiSports<T>(path: string): Promise<{ data: T[] | null; error?: string; isLive: boolean }> {
  const apiKey = getF1ApiKey();

  // If no API key is provided, indicate readiness for user key
  if (!apiKey) {
    return {
      data: null,
      error: 'REACT_APP_F1_API_KEY is not set. Add it in Settings/Secrets.',
      isLive: false,
    };
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const directUrl = `${API_BASE_URL}${cleanPath}`;
  const proxyUrl = `/api/f1${cleanPath}`;

  const requestHeaders = {
    'Accept': 'application/json',
    'x-apisports-key': apiKey,
  };

  // Try direct URL first
  try {
    const res = await fetch(directUrl, {
      method: 'GET',
      headers: requestHeaders,
    });

    if (res.ok) {
      const json: ApiSportsRootResponse<T> = await res.json();
      
      // Check for API errors object (e.g. rate limit, token invalid)
      if (json.errors) {
        const errStr = Array.isArray(json.errors) 
          ? json.errors.join(', ') 
          : Object.values(json.errors).join(', ');
        if (errStr) {
          console.warn('[API-Sports] Error response:', errStr);
          return { data: null, error: errStr, isLive: false };
        }
      }

      if (json.response && Array.isArray(json.response) && json.response.length > 0) {
        return { data: json.response, isLive: true };
      }
    }
  } catch (err: any) {
    // If direct fetch hit CORS or network issues, try local proxy route
    console.warn('[API-Sports] Direct call failed, attempting proxy:', err?.message);
    try {
      const proxyRes = await fetch(proxyUrl, {
        method: 'GET',
        headers: requestHeaders,
      });

      if (proxyRes.ok) {
        const proxyJson: ApiSportsRootResponse<T> = await proxyRes.json();
        if (proxyJson.response && Array.isArray(proxyJson.response) && proxyJson.response.length > 0) {
          return { data: proxyJson.response, isLive: true };
        }
      }
    } catch (proxyErr) {
      console.warn('[API-Sports] Proxy call also failed:', proxyErr);
    }
  }

  return { data: null, error: 'Empty or unavailable API response', isLive: false };
}

/**
 * 1. Fetch Driver Standings & Stats
 * Endpoint: /rankings/drivers?season=2026 (or active season)
 */
export async function fetchLiveDriverStandings(season = '2026'): Promise<{ drivers: Driver[]; isLive: boolean; error?: string }> {
  // First attempt requested season
  let result = await fetchFromApiSports<ApiSportsDriverRankingItem>(`/rankings/drivers?season=${season}`);

  // If 2026 is empty (season in preparation), attempt latest active 2025/2024 season
  if (!result.data || result.data.length === 0) {
    result = await fetchFromApiSports<ApiSportsDriverRankingItem>(`/rankings/drivers?season=2025`);
  }

  if (result.data && result.data.length > 0) {
    // Map API-Sports driver data into our rich Driver interface
    const mappedDrivers: Driver[] = result.data.map((item, index) => {
      const rawName = item.driver.name || 'Unknown Pilot';
      const nameParts = rawName.split(' ');
      const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : rawName;
      const driverId = getDriverIdFromName(lastName);
      const teamTheme = getTeamTheme(item.team.name);

      // Find matching baseline driver for telemetry defaults & simulation state
      const baseline = INITIAL_DRIVERS.find(d => d.id === driverId) || INITIAL_DRIVERS[index % INITIAL_DRIVERS.length];

      return {
        ...baseline,
        id: driverId,
        code: item.driver.abbr || baseline.code || lastName.slice(0, 3).toUpperCase(),
        number: item.driver.number || baseline.number,
        firstName,
        lastName,
        team: item.team.name,
        teamColor: teamTheme.color,
        carColor: teamTheme.secondary,
        points: item.points ?? baseline.points,
        wins: item.wins ?? baseline.wins,
        podiums: Math.floor((item.wins || 0) * 2.2) || baseline.podiums,
        currentPosition: item.position || index + 1,
        gridPosition: item.position || index + 1,
        // Prioritize official F1 cutouts, then API-Sports driver image, then baseline
        headshotUrl: DRIVER_PORTRAITS[driverId] || item.driver.image || baseline.headshotUrl,
      };
    });

    return { drivers: mappedDrivers, isLive: true };
  }

  // Fallback to rich baseline 2026 grid with explanation
  return {
    drivers: INITIAL_DRIVERS,
    isLive: false,
    error: result.error || 'Using baseline 2026 data',
  };
}

/**
 * 2. Fetch Team / Constructor Standings
 * Endpoint: /rankings/teams?season=2026
 */
export async function fetchLiveTeamStandings(season = '2026'): Promise<{ constructors: Constructor[]; isLive: boolean; error?: string }> {
  let result = await fetchFromApiSports<ApiSportsTeamRankingItem>(`/rankings/teams?season=${season}`);

  if (!result.data || result.data.length === 0) {
    result = await fetchFromApiSports<ApiSportsTeamRankingItem>(`/rankings/teams?season=2025`);
  }

  if (result.data && result.data.length > 0) {
    const mappedTeams: Constructor[] = result.data.map((item, index) => {
      const teamName = item.team.name;
      const theme = getTeamTheme(teamName);
      const matchedBase = CONSTRUCTORS.find(c => 
        c.name.toLowerCase().includes(teamName.toLowerCase().split(' ')[0]) ||
        teamName.toLowerCase().includes(c.id)
      ) || CONSTRUCTORS[index % CONSTRUCTORS.length];

      return {
        ...matchedBase,
        id: matchedBase.id,
        name: teamName,
        points: item.points ?? matchedBase.points,
        championshipRank: item.position || index + 1,
        color: theme.color,
        secondaryColor: theme.secondary,
      };
    });

    return { constructors: mappedTeams, isLive: true };
  }

  return {
    constructors: CONSTRUCTORS,
    isLive: false,
    error: result.error || 'Using baseline 2026 constructors',
  };
}

/**
 * 3. Fetch Race Dates, Locations, and Calendar
 * Endpoint: /races?season=2026
 */
export async function fetchLiveRaces(season = '2026'): Promise<{ races: RaceEvent[]; isLive: boolean; error?: string }> {
  let result = await fetchFromApiSports<ApiSportsRaceItem>(`/races?season=${season}`);

  if (!result.data || result.data.length === 0) {
    result = await fetchFromApiSports<ApiSportsRaceItem>(`/races?season=2025`);
  }

  if (result.data && result.data.length > 0) {
    // Filter only Formula 1 main Grand Prix / Sprint events
    const validRaces = result.data.filter(r => r.type === 'Race' || !r.type);

    const mappedRaces: RaceEvent[] = validRaces.map((item, index) => {
      const country = item.competition.location.country || 'Global';
      const city = item.competition.location.city || '';
      const flagEmoji = COUNTRY_FLAGS[country] || '🏁';
      const circuitName = item.circuit.name || `${city} Circuit`;
      const raceDate = item.date ? new Date(item.date) : new Date();
      const now = new Date();

      // Determine status based on dates
      let status: 'UPCOMING' | 'LIVE' | 'COMPLETED' = 'UPCOMING';
      const diffHours = (raceDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      if (diffHours < -4) {
        status = 'COMPLETED';
      } else if (diffHours >= -4 && diffHours <= 2) {
        status = 'LIVE';
      } else {
        status = 'UPCOMING';
      }

      // Match with baseline circuit for SVG and telemetry if available
      const matchedEvent = RACE_CALENDAR[index % RACE_CALENDAR.length];

      return {
        id: `api-rd-${index + 1}`,
        round: index + 1,
        name: item.competition.name || `${city} Grand Prix`,
        circuit: circuitName,
        country,
        flagEmoji,
        circuitId: matchedEvent?.circuitId || 'silverstone',
        date: item.date ? item.date.split('T')[0] : matchedEvent.date,
        isSprint: (item.type || '').toLowerCase().includes('sprint') || matchedEvent?.isSprint || false,
        status,
        sessions: matchedEvent?.sessions || [
          { type: 'FP1' as SessionType, name: 'Practice 1', dateTime: item.date, completed: status === 'COMPLETED' },
          { type: 'QUALIFYING' as SessionType, name: 'Qualifying', dateTime: item.date, completed: status === 'COMPLETED' },
          { type: 'RACE' as SessionType, name: 'Grand Prix', dateTime: item.date, completed: status === 'COMPLETED' },
        ],
      };
    });

    return { races: mappedRaces, isLive: true };
  }

  return {
    races: RACE_CALENDAR,
    isLive: false,
    error: result.error || 'Using baseline 2026 race calendar',
  };
}
