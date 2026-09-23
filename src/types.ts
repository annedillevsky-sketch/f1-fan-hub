export type TyreCompound = 'SOFT' | 'MEDIUM' | 'HARD' | 'INTERMEDIATE' | 'WET';

export type SessionType = 'FP1' | 'FP2' | 'FP3' | 'QUALIFYING' | 'SPRINT' | 'RACE';

export type FlagStatus = 'GREEN' | 'YELLOW' | 'DOUBLE_YELLOW' | 'RED' | 'SAFETY_CAR' | 'VSC';

export interface Driver {
  id: string;
  code: string;
  number: number;
  firstName: string;
  lastName: string;
  team: string;
  teamColor: string;
  carColor: string;
  country: string;
  countryCode: string;
  points: number;
  podiums: number;
  wins: number;
  currentPosition: number;
  gridPosition: number;
  gapToLeader: string;
  intervalToAhead: string;
  lastLapTime: string;
  bestLapTime: string;
  s1Time: string;
  s2Time: string;
  s3Time: string;
  s1Status: 'fastest' | 'personal' | 'normal';
  s2Status: 'fastest' | 'personal' | 'normal';
  s3Status: 'fastest' | 'personal' | 'normal';
  currentTyre: TyreCompound;
  tyreLaps: number;
  pitStops: number;
  inPit: boolean;
  drsActive: boolean;
  speedTrapKmH: number;
  trackProgress: number; // 0 to 1 along circuit
  recentLaps: string[];
  headshotUrl?: string;
}

export interface Constructor {
  id: string;
  name: string;
  base: string;
  teamPrincipal: string;
  powerUnit: string;
  color: string;
  secondaryColor: string;
  points: number;
  championshipRank: number;
  drivers: string[]; // driver codes
}

export interface CircuitCorner {
  number: number;
  name?: string;
  x: number;
  y: number;
  speedKmH: number;
  gear: number;
  brakingG: number;
  drsZone?: boolean;
}

export interface CircuitInfo {
  id: string;
  name: string;
  country: string;
  locality: string;
  lengthKm: number;
  laps: number;
  lapRecord: {
    time: string;
    driver: string;
    year: number;
  };
  turns: number;
  drsZonesCount: number;
  svgPath: string;
  viewBox: string;
  corners: CircuitCorner[];
  sectors: {
    s1End: number; // 0 to 1 progress
    s2End: number; // 0 to 1 progress
  };
}

export interface RaceEvent {
  id: string;
  round: number;
  name: string;
  circuit: string;
  country: string;
  flagEmoji: string;
  circuitId: string;
  date: string;
  sessions: {
    type: SessionType;
    name: string;
    dateTime: string;
    completed: boolean;
    podium?: { p1: string; p2: string; p3: string };
  }[];
  isSprint: boolean;
  status: 'UPCOMING' | 'LIVE' | 'COMPLETED';
}

export interface TelemetrySample {
  distanceM: number;
  speed1: number;
  speed2: number;
  throttle1: number;
  throttle2: number;
  brake1: number;
  brake2: number;
  gear1: number;
  gear2: number;
  deltaSeconds: number; // Driver 1 vs Driver 2 delta
  corner?: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: 'Technical' | 'Driver Market' | 'Race Debrief' | 'FIA & Rules' | 'Paddock News' | 'Championship';
  source: string;
  date: string;
  readTime: string;
  tags: string[];
  imageUrl?: string;
}

export interface HistoricalRecord {
  id: string;
  title: string;
  category: 'All-Time Wins' | 'World Championships' | 'Iconic Races' | 'Circuit Milestones';
  statPrimary: string;
  statSecondary: string;
  description: string;
  yearOrEra: string;
  keyHolders: { name: string; value: string | number; teamOrCountry: string }[];
}

export interface NotificationItem {
  id: string;
  type: 'SESSION_START' | 'PODIUM_RESULT' | 'SAFETY_CAR' | 'FASTEST_LAP' | 'FAVORITE_ALERT' | 'SYSTEM_ALERT';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  eventId?: string;
}

export interface RadioMessage {
  id: string;
  driverCode: string;
  driverName: string;
  team: string;
  teamColor: string;
  type: 'PITS' | 'STRATEGY' | 'INCIDENT' | 'CELEBRATION' | 'MEMORABLE';
  message: string;
  lap: number;
  timeString: string;
  year?: number;
  grandPrix?: string;
  era?: 'recent' | 'historic';
  isHistoric?: boolean;
  context?: string;
}

export interface AlertPreferences {
  sessionStart: boolean;
  safetyCar: boolean;
  fastestLap: boolean;
  teamRadio: boolean;
  pitWindow: boolean;
  overtakeAlerts: boolean;
  soundEffects: boolean;
}

export interface StrategyStint {
  compound: TyreCompound;
  startLap: number;
  endLap: number;
  totalLaps: number;
  tyreWearAtEnd: number; // 0 to 100%
  pitDurationSec: number;
}

export interface StrategyPlan {
  id: string;
  name: string;
  stops: number;
  stints: StrategyStint[];
  totalRaceTimeSeconds: number;
  deltaToOptimalSec: number;
  riskFactor: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  keyAdvantage: string;
}
