import type { Driver, Constructor, RaceEvent, SessionType, TyreCompound } from '../types';
import { INITIAL_DRIVERS, CONSTRUCTORS, RACE_CALENDAR } from '../data/f1Data';
import { DRIVER_PORTRAITS } from '../data/driverMedia';

// OpenF1 Base URL: Real-time, public, and open Formula 1 telemetry API
// OpenF1 is free, open-source, and does not require private API keys.
export const OPENF1_BASE_URL = 'https://api.openf1.org/v1';

export interface ApiStatusInfo {
  isLive: boolean;
  status: 'idle' | 'loading' | 'live' | 'fallback' | 'rate-limited' | 'error';
  lastUpdated: string | null;
  season: string;
  source: 'OpenF1 Live API' | 'Default 2026 Dataset';
  message?: string;
}

// OpenF1 Raw Driver Interface
export interface OpenF1Driver {
  session_key: number;
  meeting_key: number;
  broadcast_name: string;
  country_code: string;
  first_name: string;
  full_name: string;
  headshot_url: string | null;
  last_name: string;
  driver_number: number;
  team_colour: string | null;
  team_name: string;
  name_acronym: string;
}

// OpenF1 Raw Meeting (Race Event) Interface
export interface OpenF1Meeting {
  meeting_key: number;
  meeting_name: string;
  meeting_official_name: string;
  location: string;
  country_key: number;
  country_code: string;
  country_name: string;
  circuit_key: number;
  circuit_short_name: string;
  date_start: string;
  gmt_offset: string;
  year: number;
}

// OpenF1 Raw Session Interface
export interface OpenF1Session {
  session_key: number;
  meeting_key: number;
  session_name: string;
  session_type: string;
  date_start: string;
  date_end: string;
  gmt_offset: string;
  country_name: string;
  circuit_short_name: string;
  year: number;
}

// OpenF1 Position Interface
export interface OpenF1Position {
  date: string;
  driver_number: number;
  meeting_key: number;
  session_key: number;
  position: number;
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
 * Universal OpenF1 Fetcher
 * Tries direct OpenF1 endpoint first; if blocked by CORS or network, routes through Vite proxy (/api/openf1)
 */
async function fetchFromOpenF1<T>(path: string): Promise<{ data: T[] | null; error?: string; isLive: boolean }> {
  const directUrl = `${OPENF1_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const proxyUrl = `/api/openf1${path.startsWith('/') ? path : `/${path}`}`;

  // 1. Direct fetch to OpenF1
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(directUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      const list = Array.isArray(json) ? json : [];
      return { data: list as T[], isLive: true };
    }
  } catch (err: any) {
    // Fall back to Vite local proxy
  }

  // 2. Proxy fallback
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const proxyRes = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (proxyRes.ok) {
      const json = await proxyRes.json();
      const list = Array.isArray(json) ? json : [];
      return { data: list as T[], isLive: true };
    }
  } catch (proxyErr: any) {
    // Fall through to error
  }

  return { data: null, isLive: false, error: 'Network request could not reach OpenF1 API' };
}

/**
 * 1. Fetch Drivers from OpenF1
 * Endpoint: /drivers?session_key=latest
 */
export async function fetchLiveDriverStandings(season = '2026'): Promise<{ drivers: Driver[]; isLive: boolean; error?: string }> {
  try {
    const result = await fetchFromOpenF1<OpenF1Driver>('/drivers?session_key=latest');

    if (result.isLive && result.data && result.data.length > 0) {
      // Also try to get latest positions
      const positionsResult = await fetchFromOpenF1<OpenF1Position>('/position?session_key=latest');
      const latestPositions = new Map<number, number>();
      if (positionsResult.data) {
        for (const p of positionsResult.data) {
          latestPositions.set(p.driver_number, p.position);
        }
      }

      const mappedDrivers: Driver[] = result.data.map((item, index) => {
        const lastName = item.last_name || item.broadcast_name?.split(' ')[0] || item.full_name || 'Pilot';
        const firstName = item.first_name || item.broadcast_name?.split(' ')[1] || '';
        const driverId = getDriverIdFromName(lastName);
        const teamTheme = item.team_colour ? { color: `#${item.team_colour}`, secondary: '#FFFFFF' } : getTeamTheme(item.team_name);
        const code = item.name_acronym || lastName.slice(0, 3).toUpperCase();

        const baseline = INITIAL_DRIVERS.find(d => d.id === driverId || d.number === item.driver_number) || INITIAL_DRIVERS[index % INITIAL_DRIVERS.length];
        const currentPos = latestPositions.get(item.driver_number) || baseline.currentPosition || index + 1;

        return {
          ...baseline,
          id: driverId,
          code,
          number: item.driver_number || baseline.number,
          firstName: firstName || baseline.firstName,
          lastName: lastName || baseline.lastName,
          team: item.team_name || baseline.team,
          teamColor: teamTheme.color,
          carColor: teamTheme.secondary,
          country: item.country_code || baseline.country,
          countryCode: item.country_code || baseline.countryCode,
          currentPosition: currentPos,
          gridPosition: currentPos,
          headshotUrl: DRIVER_PORTRAITS[driverId] || item.headshot_url || baseline.headshotUrl,
        };
      });

      // Sort strictly by Championship points descending
      mappedDrivers.sort((a, b) => b.points - a.points || b.wins - a.wins);
      mappedDrivers.forEach((d, idx) => {
        d.currentPosition = idx + 1;
      });

      return {
        drivers: mappedDrivers,
        isLive: true,
      };
    }
  } catch (err) {
    // Fall back to baseline
  }

  return {
    drivers: INITIAL_DRIVERS,
    isLive: false,
    error: 'Using default 2026 Championship dataset',
  };
}

/**
 * 2. Fetch Team / Constructor Standings from OpenF1
 */
export async function fetchLiveTeamStandings(season = '2026'): Promise<{ constructors: Constructor[]; isLive: boolean; error?: string }> {
  try {
    const result = await fetchFromOpenF1<OpenF1Driver>('/drivers?session_key=latest');

    if (result.isLive && result.data && result.data.length > 0) {
      // Group drivers by team name
      const teamMap = new Map<string, { color: string; drivers: string[] }>();

      for (const d of result.data) {
        if (!d.team_name) continue;
        const normalizedTeam = d.team_name.trim();
        const code = d.name_acronym || `D${d.driver_number}`;
        const color = d.team_colour ? `#${d.team_colour}` : getTeamTheme(normalizedTeam).color;

        const existing = teamMap.get(normalizedTeam);
        if (existing) {
          if (!existing.drivers.includes(code)) existing.drivers.push(code);
        } else {
          teamMap.set(normalizedTeam, { color, drivers: [code] });
        }
      }

      if (teamMap.size > 0) {
        let rank = 1;
        const mappedConstructors: Constructor[] = [];

        for (const [teamName, data] of teamMap.entries()) {
          const matchedBase = CONSTRUCTORS.find(c =>
            c.name.toLowerCase().includes(teamName.toLowerCase().split(' ')[0]) ||
            teamName.toLowerCase().includes(c.id)
          ) || CONSTRUCTORS[(rank - 1) % CONSTRUCTORS.length];

          const theme = getTeamTheme(teamName);

          mappedConstructors.push({
            ...matchedBase,
            id: matchedBase.id,
            name: teamName,
            color: data.color || theme.color,
            secondaryColor: theme.secondary,
            championshipRank: rank++,
            drivers: data.drivers.length > 0 ? data.drivers : matchedBase.drivers,
          });
        }

        return {
          constructors: mappedConstructors,
          isLive: true,
        };
      }
    }
  } catch (err) {
    // Fall back to baseline constructors
  }

  return {
    constructors: CONSTRUCTORS,
    isLive: false,
    error: 'Using default 2026 Constructor dataset',
  };
}

/**
 * 3. Fetch Race Dates, Locations, and Calendar from OpenF1
 * Endpoint: /meetings?year=latest or /meetings
 */
export async function fetchLiveRaces(season = '2026'): Promise<{ races: RaceEvent[]; isLive: boolean; error?: string }> {
  try {
    const result = await fetchFromOpenF1<OpenF1Meeting>('/meetings?year=latest');

    if (result.isLive && result.data && result.data.length > 0) {
      const sessionsResult = await fetchFromOpenF1<OpenF1Session>('/sessions?year=latest');
      const sessionsByMeeting = new Map<number, OpenF1Session[]>();
      if (sessionsResult.data) {
        for (const s of sessionsResult.data) {
          const list = sessionsByMeeting.get(s.meeting_key) || [];
          list.push(s);
          sessionsByMeeting.set(s.meeting_key, list);
        }
      }

      const now = new Date();
      const mappedRaces: RaceEvent[] = result.data.map((meeting, index) => {
        const round = index + 1;
        const country = meeting.country_name || 'Global';
        const flagEmoji = COUNTRY_FLAGS[country] || '🏁';
        const raceDate = meeting.date_start ? new Date(meeting.date_start) : new Date();

        // Calculate status
        let status: 'UPCOMING' | 'LIVE' | 'COMPLETED' = 'UPCOMING';
        const diffHours = (raceDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        if (diffHours < -4) {
          status = 'COMPLETED';
        } else if (diffHours >= -4 && diffHours <= 2) {
          status = 'LIVE';
        } else {
          status = 'UPCOMING';
        }

        const matchedEvent = RACE_CALENDAR[index % RACE_CALENDAR.length];
        const meetingSessions = sessionsByMeeting.get(meeting.meeting_key) || [];

        const sessionsList = meetingSessions.length > 0
          ? meetingSessions.map(s => ({
              type: (s.session_name.toUpperCase().includes('RACE') 
                ? 'RACE' 
                : s.session_name.toUpperCase().includes('QUALIFY') 
                ? 'QUALIFYING' 
                : 'FP1') as SessionType,
              name: s.session_name,
              dateTime: s.date_start,
              completed: status === 'COMPLETED',
            }))
          : matchedEvent?.sessions || [
              { type: 'FP1' as SessionType, name: 'Practice 1', dateTime: meeting.date_start, completed: status === 'COMPLETED' },
              { type: 'QUALIFYING' as SessionType, name: 'Qualifying', dateTime: meeting.date_start, completed: status === 'COMPLETED' },
              { type: 'RACE' as SessionType, name: 'Grand Prix', dateTime: meeting.date_start, completed: status === 'COMPLETED' },
            ];

        return {
          id: `openf1-rd-${round}`,
          round,
          name: meeting.meeting_name || `${meeting.location} Grand Prix`,
          circuit: meeting.circuit_short_name || meeting.location || matchedEvent?.circuit || 'Circuit',
          circuitId: matchedEvent?.circuitId || 'silverstone',
          country,
          flagEmoji,
          date: meeting.date_start ? meeting.date_start.split('T')[0] : matchedEvent.date,
          isSprint: matchedEvent?.isSprint || false,
          status,
          sessions: sessionsList,
        };
      });

      return {
        races: mappedRaces,
        isLive: true,
      };
    }
  } catch (err) {
    // Fall back to default calendar
  }

  return {
    races: RACE_CALENDAR,
    isLive: false,
    error: 'Using default 2026 Race Calendar',
  };
}
