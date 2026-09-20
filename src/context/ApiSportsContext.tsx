import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Driver, Constructor, RaceEvent } from '../types';
import { INITIAL_DRIVERS, CONSTRUCTORS, RACE_CALENDAR } from '../data/f1Data';
import { 
  fetchLiveDriverStandings, 
  fetchLiveTeamStandings, 
  fetchLiveRaces, 
  ApiStatusInfo,
  getF1ApiKey 
} from '../services/apiSportsService';

interface ApiSportsContextType {
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

const ApiSportsContext = createContext<ApiSportsContextType | undefined>(undefined);

export const ApiSportsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [season, setSeason] = useState<string>('2026');
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [constructors, setConstructors] = useState<Constructor[]>(CONSTRUCTORS);
  const [races, setRaces] = useState<RaceEvent[]>(RACE_CALENDAR);
  const [loading, setLoading] = useState<boolean>(true);

  const apiKey = getF1ApiKey();

  const [apiStatus, setApiStatus] = useState<ApiStatusInfo>({
    isLive: false,
    status: apiKey ? 'loading' : 'fallback',
    lastUpdated: null,
    season: '2026',
    hasKey: Boolean(apiKey),
    message: apiKey ? 'Connecting to API-Sports...' : 'Using default 2026 Championship dataset',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    const key = getF1ApiKey();

    try {
      // Execute all 3 endpoint fetches concurrently
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
        hasKey: Boolean(key),
        message: anyLive 
          ? `Live API-Sports Connected (${season} Season)` 
          : key 
            ? 'API key active • Serving cached 2026 grid data' 
            : 'Live API-Sports ready (Configure REACT_APP_F1_API_KEY in Settings)',
      });
    } catch (err: any) {
      console.error('Failed to fetch from API-Sports:', err);
      setApiStatus({
        isLive: false,
        status: 'error',
        lastUpdated: null,
        season,
        hasKey: Boolean(key),
        message: err?.message || 'Connection error. Reverting to baseline grid.',
      });
    } finally {
      setLoading(false);
    }
  }, [season]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <ApiSportsContext.Provider
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
    </ApiSportsContext.Provider>
  );
};

export const useApiSports = (): ApiSportsContextType => {
  const context = useContext(ApiSportsContext);
  if (!context) {
    throw new Error('useApiSports must be used within an ApiSportsProvider');
  }
  return context;
};
