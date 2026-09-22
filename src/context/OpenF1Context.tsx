import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Driver, Constructor, RaceEvent } from '../types';
import { INITIAL_DRIVERS, CONSTRUCTORS, RACE_CALENDAR } from '../data/f1Data';
import { 
  fetchLiveDriverStandings, 
  fetchLiveTeamStandings, 
  fetchLiveRaces, 
  ApiStatusInfo 
} from '../services/openF1Service';

interface OpenF1ContextType {
  drivers: Driver[];
  setDrivers: React.Dispatch<React.SetStateAction<Driver[]>>;
  constructors: Constructor[];
  races: RaceEvent[];
  loading: boolean;
  apiStatus: ApiStatusInfo;
  season: string;
  setSeason: (season: string) => void;
  refreshData: () => Promise<void>;
}

const OpenF1Context = createContext<OpenF1ContextType | undefined>(undefined);

export const OpenF1Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [season, setSeason] = useState<string>('2026');
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [constructors, setConstructors] = useState<Constructor[]>(CONSTRUCTORS);
  const [races, setRaces] = useState<RaceEvent[]>(RACE_CALENDAR);
  const [loading, setLoading] = useState<boolean>(true);

  const [apiStatus, setApiStatus] = useState<ApiStatusInfo>({
    isLive: false,
    status: 'loading',
    lastUpdated: null,
    season: '2026',
    source: 'OpenF1 Live API',
    message: 'Connecting to OpenF1 real-time telemetry API...',
  });

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      // Execute all OpenF1 fetches concurrently
      const [driversResult, teamsResult, racesResult] = await Promise.all([
        fetchLiveDriverStandings(season),
        fetchLiveTeamStandings(season),
        fetchLiveRaces(season),
      ]);

      if (driversResult.drivers && driversResult.drivers.length > 0) {
        setDrivers(driversResult.drivers);
      }

      if (teamsResult.constructors && teamsResult.constructors.length > 0) {
        setConstructors(teamsResult.constructors);
      }

      if (racesResult.races && racesResult.races.length > 0) {
        setRaces(racesResult.races);
      }

      const anyLive = driversResult.isLive || teamsResult.isLive || racesResult.isLive;

      setApiStatus({
        isLive: anyLive,
        status: anyLive ? 'live' : 'fallback',
        lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        season,
        source: anyLive ? 'OpenF1 Live API' : 'Default 2026 Dataset',
        message: anyLive 
          ? `OpenF1 Real-time Telemetry Live (Connected to OpenF1 Public API)` 
          : 'Serving 2026 Championship regulations dataset',
      });
    } catch (err: any) {
      console.error('Failed to fetch from OpenF1:', err);
      setApiStatus({
        isLive: false,
        status: 'error',
        lastUpdated: null,
        season,
        source: 'Default 2026 Dataset',
        message: err?.message || 'Connection to OpenF1 timed out. Reverting to baseline dataset.',
      });
    } finally {
      setLoading(false);
    }
  }, [season]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <OpenF1Context.Provider
      value={{
        drivers,
        setDrivers,
        constructors,
        races,
        loading,
        apiStatus,
        season,
        setSeason,
        refreshData: loadData,
      }}
    >
      {children}
    </OpenF1Context.Provider>
  );
};

export const useOpenF1 = (): OpenF1ContextType => {
  const context = useContext(OpenF1Context);
  if (!context) {
    throw new Error('useOpenF1 must be used within an OpenF1Provider');
  }
  return context;
};

// Aliases for seamless backward compatibility
export const ApiSportsProvider = OpenF1Provider;
export const useApiSports = useOpenF1;
