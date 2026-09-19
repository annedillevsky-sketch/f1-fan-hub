import React, { useState, useMemo } from 'react';
import { 
  Sliders, 
  Thermometer, 
  Activity, 
  Clock, 
  Zap, 
  ShieldAlert, 
  RotateCcw, 
  Play, 
  Volume2, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingDown, 
  Layers 
} from 'lucide-react';
import { TyreCompound, StrategyPlan, Driver } from '../types';
import { playWheelGunSound, playJackDropSound, playEngineRevSound } from '../utils/audioAlerts';

interface PitStopStrategyPredictorProps {
  isDarkMode: boolean;
  soundEnabled: boolean;
  drivers?: Driver[];
}


interface CircuitPreset {
  id: string;
  name: string;
  country: string;
  flag: string;
  totalLaps: number;
  pitLossSeconds: number;
  baseTrackTemp: number;
  baseWearRate: number;
  description: string;
}

const CIRCUITS: CircuitPreset[] = [
  {
    id: 'baku',
    name: 'Baku City Circuit',
    country: 'Azerbaijan',
    flag: '🇦🇿',
    totalLaps: 51,
    pitLossSeconds: 21.2,
    baseTrackTemp: 41,
    baseWearRate: 1.15,
    description: 'High track surface temps with heavy traction demands out of 90° corners and huge slipstream straight.',
  },
  {
    id: 'silverstone',
    name: 'Silverstone Circuit',
    country: 'Great Britain',
    flag: '🇬🇧',
    totalLaps: 52,
    pitLossSeconds: 24.5,
    baseTrackTemp: 32,
    baseWearRate: 1.35,
    description: 'Extreme lateral loads through Maggotts, Becketts, and Stowe. Front-left tyre wear is the limiting factor.',
  },
  {
    id: 'monza',
    name: 'Autodromo Nazionale Monza',
    country: 'Italy',
    flag: '🇮🇹',
    totalLaps: 53,
    pitLossSeconds: 23.8,
    baseTrackTemp: 35,
    baseWearRate: 0.85,
    description: 'Temple of Speed. Low downforce trim reduces tyre scrub, making a 1-stop strategy dominant.',
  },
  {
    id: 'spa',
    name: 'Circuit de Spa-Francorchamps',
    country: 'Belgium',
    flag: '🇧🇪',
    totalLaps: 44,
    pitLossSeconds: 22.0,
    baseTrackTemp: 26,
    baseWearRate: 1.25,
    description: 'Massive elevation change through Eau Rouge. High compression and tyre graining risk in Sector 2.',
  },
];

export const PitStopStrategyPredictor: React.FC<PitStopStrategyPredictorProps> = ({
  isDarkMode,
  soundEnabled,
  drivers = [],
}) => {

  const [selectedCircuitId, setSelectedCircuitId] = useState<string>('baku');
  const [trackTemp, setTrackTemp] = useState<number>(41);
  const [wearMultiplier, setWearMultiplier] = useState<number>(1.15);
  const [safetyCarWindow, setSafetyCarWindow] = useState<boolean>(false);
  const [activeStrategyId, setActiveStrategyId] = useState<string>('strat-1stop');
  const [isSimulatingStop, setIsSimulatingStop] = useState<boolean>(false);
  const [simulatedStopLap, setSimulatedStopLap] = useState<number>(23);
  const [pitStopTime, setPitStopTime] = useState<number | null>(null);

  const currentCircuit = CIRCUITS.find(c => c.id === selectedCircuitId) || CIRCUITS[0];

  // Handle switching circuit
  const handleSelectCircuit = (circuit: CircuitPreset) => {
    setSelectedCircuitId(circuit.id);
    setTrackTemp(circuit.baseTrackTemp);
    setWearMultiplier(circuit.baseWearRate);
  };

  // Base tyre lifespans (laps) at 30°C and 1.0 wear
  const tyreLife = useMemo(() => {
    // Hot track (>35°C) increases soft degradation drastically
    const tempDegFactor = 1 + Math.max(0, (trackTemp - 30) * 0.018);
    const effectiveWear = wearMultiplier * tempDegFactor;

    return {
      SOFT: Math.max(8, Math.round(17 / effectiveWear)),
      MEDIUM: Math.max(14, Math.round(28 / effectiveWear)),
      HARD: Math.max(22, Math.round(42 / effectiveWear)),
    };
  }, [trackTemp, wearMultiplier]);

  // Generate strategy plans dynamically based on conditions
  const strategies: StrategyPlan[] = useMemo(() => {
    const laps = currentCircuit.totalLaps;
    const pitLoss = safetyCarWindow ? currentCircuit.pitLossSeconds * 0.55 : currentCircuit.pitLossSeconds;

    // Strategy 1: Medium -> Hard 1-Stop
    const mStint1 = Math.min(tyreLife.MEDIUM, Math.round(laps * 0.44));
    const hStint2 = laps - mStint1;
    const strat1Time = laps * 92.0 + pitLoss + (trackTemp > 45 ? 4.5 : 0);

    // Strategy 2: Soft -> Hard -> Medium 2-Stop
    const sStint1 = Math.min(tyreLife.SOFT, Math.round(laps * 0.28));
    const hStint2_2 = Math.min(tyreLife.HARD, Math.round(laps * 0.42));
    const mStint3 = laps - sStint1 - hStint2_2;
    // 2 stops lose 2 x pit loss, but run faster fresher rubber (~0.4s/lap)
    const strat2Time = laps * 91.5 + (pitLoss * 2) - (trackTemp > 42 ? 2.5 : 0);

    // Strategy 3: Hard -> Soft Reverse 1-Stop
    const hStint1_3 = Math.min(tyreLife.HARD, Math.round(laps * 0.68));
    const sStint2_3 = laps - hStint1_3;
    const strat3Time = laps * 92.4 + pitLoss + (sStint2_3 > tyreLife.SOFT ? 6.0 : 0);

    // Strategy 4: Soft -> Medium -> Soft Sprint 2-Stop
    const smStint1 = Math.min(tyreLife.SOFT, Math.round(laps * 0.3));
    const smStint2 = Math.min(tyreLife.MEDIUM, Math.round(laps * 0.4));
    const smStint3 = laps - smStint1 - smStint2;
    const strat4Time = laps * 91.2 + (pitLoss * 2) + (trackTemp > 38 ? 5.0 : 0);

    const baseMin = Math.min(strat1Time, strat2Time, strat3Time, strat4Time);

    return [
      {
        id: 'strat-1stop',
        name: 'Primary 1-Stop (Medium → Hard)',
        stops: 1,
        stints: [
          {
            compound: 'MEDIUM',
            startLap: 1,
            endLap: mStint1,
            totalLaps: mStint1,
            tyreWearAtEnd: Math.min(100, Math.round((mStint1 / tyreLife.MEDIUM) * 90)),
            pitDurationSec: pitLoss,
          },
          {
            compound: 'HARD',
            startLap: mStint1 + 1,
            endLap: laps,
            totalLaps: hStint2,
            tyreWearAtEnd: Math.min(100, Math.round((hStint2 / tyreLife.HARD) * 85)),
            pitDurationSec: 0,
          },
        ],
        totalRaceTimeSeconds: Math.round(strat1Time),
        deltaToOptimalSec: Number((strat1Time - baseMin).toFixed(1)),
        riskFactor: trackTemp > 45 ? 'MEDIUM' : 'LOW',
        description: `Start on Medium tyres for opening stability, box on Lap ${mStint1} for durable Hards to the chequered flag.`,
        keyAdvantage: 'Minimizes pit lane transit loss and avoids traffic in mid-race pack.',
      },
      {
        id: 'strat-2stop',
        name: 'Aggressive 2-Stop (Soft → Hard → Medium)',
        stops: 2,
        stints: [
          {
            compound: 'SOFT',
            startLap: 1,
            endLap: sStint1,
            totalLaps: sStint1,
            tyreWearAtEnd: Math.min(100, Math.round((sStint1 / tyreLife.SOFT) * 95)),
            pitDurationSec: pitLoss,
          },
          {
            compound: 'HARD',
            startLap: sStint1 + 1,
            endLap: sStint1 + hStint2_2,
            totalLaps: hStint2_2,
            tyreWearAtEnd: Math.min(100, Math.round((hStint2_2 / tyreLife.HARD) * 80)),
            pitDurationSec: pitLoss,
          },
          {
            compound: 'MEDIUM',
            startLap: sStint1 + hStint2_2 + 1,
            endLap: laps,
            totalLaps: mStint3,
            tyreWearAtEnd: Math.min(100, Math.round((mStint3 / tyreLife.MEDIUM) * 75)),
            pitDurationSec: 0,
          },
        ],
        totalRaceTimeSeconds: Math.round(strat2Time),
        deltaToOptimalSec: Number((strat2Time - baseMin).toFixed(1)),
        riskFactor: 'MEDIUM',
        description: `Maximize Turn 1 launch grip on Softs, take early undercut on Lap ${sStint1}, attack late on fresh Mediums.`,
        keyAdvantage: 'Pace advantage of +0.45s per lap; ideal if high track degradation triggers tyre blister cliff.',
      },
      {
        id: 'strat-alt-1stop',
        name: 'Alternative Reverse 1-Stop (Hard → Soft)',
        stops: 1,
        stints: [
          {
            compound: 'HARD',
            startLap: 1,
            endLap: hStint1_3,
            totalLaps: hStint1_3,
            tyreWearAtEnd: Math.min(100, Math.round((hStint1_3 / tyreLife.HARD) * 92)),
            pitDurationSec: pitLoss,
          },
          {
            compound: 'SOFT',
            startLap: hStint1_3 + 1,
            endLap: laps,
            totalLaps: sStint2_3,
            tyreWearAtEnd: Math.min(100, Math.round((sStint2_3 / tyreLife.SOFT) * 98)),
            pitDurationSec: 0,
          },
        ],
        totalRaceTimeSeconds: Math.round(strat3Time),
        deltaToOptimalSec: Number((strat3Time - baseMin).toFixed(1)),
        riskFactor: 'HIGH',
        description: `Go long on opening Hard tyres hoping for mid-race Safety Car, then unleash lightweight Softs for final laps.`,
        keyAdvantage: 'Maximum Safety Car opportunism; gain +12s if SC triggers during Laps 25–36.',
      },
      {
        id: 'strat-sprint-2stop',
        name: 'Sprint Attack 2-Stop (Soft → Medium → Soft)',
        stops: 2,
        stints: [
          {
            compound: 'SOFT',
            startLap: 1,
            endLap: smStint1,
            totalLaps: smStint1,
            tyreWearAtEnd: 95,
            pitDurationSec: pitLoss,
          },
          {
            compound: 'MEDIUM',
            startLap: smStint1 + 1,
            endLap: smStint1 + smStint2,
            totalLaps: smStint2,
            tyreWearAtEnd: 88,
            pitDurationSec: pitLoss,
          },
          {
            compound: 'SOFT',
            startLap: smStint1 + smStint2 + 1,
            endLap: laps,
            totalLaps: smStint3,
            tyreWearAtEnd: 90,
            pitDurationSec: 0,
          },
        ],
        totalRaceTimeSeconds: Math.round(strat4Time),
        deltaToOptimalSec: Number((strat4Time - baseMin).toFixed(1)),
        riskFactor: 'HIGH',
        description: 'No Hard tyres used. Pure qualifying pace attack on soft compounds, reliant on clean air overtaking.',
        keyAdvantage: 'Highest instantaneous apex grip, but vulnerable to extreme tyre thermal degradation.',
      },
    ];
  }, [currentCircuit, tyreLife, trackTemp, safetyCarWindow]);

  // Best optimal strategy
  const optimalStrategy = useMemo(() => {
    return strategies.reduce((prev, curr) => 
      curr.deltaToOptimalSec < prev.deltaToOptimalSec ? curr : prev, strategies[0]
    );
  }, [strategies]);

  // Selected strategy object
  const activeStrategy = strategies.find(s => s.id === activeStrategyId) || optimalStrategy;

  // Compound color helper
  const getCompoundColors = (compound: TyreCompound) => {
    switch (compound) {
      case 'SOFT':
        return {
          bg: 'bg-red-600',
          text: 'text-red-400',
          border: 'border-red-500',
          lightBg: 'bg-red-500/15',
          label: 'Soft (C5/C4)',
        };
      case 'MEDIUM':
        return {
          bg: 'bg-yellow-500',
          text: 'text-yellow-400',
          border: 'border-yellow-500',
          lightBg: 'bg-yellow-500/15',
          label: 'Medium (C4/C3)',
        };
      case 'HARD':
        return {
          bg: 'bg-slate-100 text-slate-950',
          text: 'text-slate-200',
          border: 'border-slate-300',
          lightBg: 'bg-white/15',
          label: 'Hard (C3/C2)',
        };
      default:
        return {
          bg: 'bg-emerald-500',
          text: 'text-emerald-400',
          border: 'border-emerald-500',
          lightBg: 'bg-emerald-500/15',
          label: 'Intermediate',
        };
    }
  };

  // Simulate pit stop action with realistic sound effects
  const handleSimulatePitStop = () => {
    setIsSimulatingStop(true);
    setPitStopTime(null);

    if (soundEnabled) {
      // 1. Wheel gun whir & torque clacks
      playWheelGunSound();
      
      // 2. Car jack drop after 1.8s
      setTimeout(() => {
        playJackDropSound();
      }, 1900);

      // 3. Throttle rev departure after 2.2s
      setTimeout(() => {
        playEngineRevSound('rev');
      }, 2300);
    }

    // Measure pit stop time (between 2.05s and 2.45s)
    const randomStop = Number((2.05 + Math.random() * 0.4).toFixed(2));
    setTimeout(() => {
      setPitStopTime(randomStop);
      setIsSimulatingStop(false);
    }, 2400);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className={`p-4 sm:p-6 rounded-xl border ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-red-600/20 text-red-400 border border-red-500/30">
                Pirelli Race Strategy Studio
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Monte Carlo Tyre Wear & Undercut Simulator
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-racing font-bold tracking-wide mt-1 text-slate-100">
              Pit Stop & Tyre Stint Predictor • {currentCircuit.name} {currentCircuit.flag}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentCircuit.description} • {currentCircuit.totalLaps} Race Laps
            </p>
          </div>

          {/* Circuit Switcher Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl border border-slate-800 bg-slate-950">
            {CIRCUITS.map(c => (
              <button
                key={c.id}
                onClick={() => handleSelectCircuit(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition ${
                  selectedCircuitId === c.id
                    ? 'bg-red-600 text-white font-bold shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <span>{c.flag}</span>
                <span className="hidden sm:inline">{c.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Condition Sliders & Toggles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-5 border-t border-slate-800/80">
          {/* Slider 1: Track Temperature */}
          <div className={`p-4 rounded-xl border ${
            isDarkMode ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Thermometer className={`w-4 h-4 ${trackTemp >= 40 ? 'text-red-500' : trackTemp >= 30 ? 'text-amber-400' : 'text-blue-400'}`} />
                <span className="text-xs font-mono font-bold text-slate-300 uppercase">Track Surface Temp</span>
              </div>
              <span className={`text-sm font-mono font-bold ${trackTemp >= 40 ? 'text-red-400' : trackTemp >= 30 ? 'text-amber-300' : 'text-blue-300'}`}>
                {trackTemp}°C
              </span>
            </div>
            <input
              type="range"
              min={20}
              max={55}
              step={1}
              value={trackTemp}
              onChange={(e) => setTrackTemp(Number(e.target.value))}
              className="w-full accent-red-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
              <span>Cool (20°C)</span>
              <span>Optimal (32°C)</span>
              <span>Extreme Heat (55°C)</span>
            </div>
          </div>

          {/* Slider 2: Tyre Degradation Rate */}
          <div className={`p-4 rounded-xl border ${
            isDarkMode ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-mono font-bold text-slate-300 uppercase">Tyre Wear Rate</span>
              </div>
              <span className="text-sm font-mono font-bold text-purple-400">
                {wearMultiplier.toFixed(2)}x
              </span>
            </div>
            <input
              type="range"
              min={0.7}
              max={1.8}
              step={0.05}
              value={wearMultiplier}
              onChange={(e) => setWearMultiplier(Number(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
              <span>Low (0.7x)</span>
              <span>Baseline (1.0x)</span>
              <span>Blistering (1.8x)</span>
            </div>
          </div>

          {/* Toggle: Safety Car Probability */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between ${
            isDarkMode ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-mono font-bold text-slate-300 uppercase">Safety Car / VSC Pit</span>
              </div>
              <button
                onClick={() => setSafetyCarWindow(!safetyCarWindow)}
                className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border transition ${
                  safetyCarWindow
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {safetyCarWindow ? 'ACTIVE (-11.5s)' : 'INACTIVE'}
              </button>
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-2">
              {safetyCarWindow 
                ? '🏎️ SC delta pit stop loss reduced to ~10.2s. Cheap pit stop window unlocked!' 
                : 'Standard green flag racing pit loss (~21.2s under racing speeds).'}
            </p>
          </div>
        </div>

        {/* Estimated Tyre Life Indicators */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800/60">
          <div className="p-2.5 rounded-lg border border-red-500/30 bg-red-950/20 text-center">
            <span className="text-[10px] font-mono font-bold text-red-400 uppercase block">SOFT (RED) WINDOW</span>
            <span className="text-base font-racing font-bold text-red-300">{tyreLife.SOFT} Laps Max</span>
          </div>
          <div className="p-2.5 rounded-lg border border-yellow-500/30 bg-yellow-950/20 text-center">
            <span className="text-[10px] font-mono font-bold text-yellow-400 uppercase block">MEDIUM (YELLOW) WINDOW</span>
            <span className="text-base font-racing font-bold text-yellow-300">{tyreLife.MEDIUM} Laps Max</span>
          </div>
          <div className="p-2.5 rounded-lg border border-slate-400/30 bg-slate-800/30 text-center">
            <span className="text-[10px] font-mono font-bold text-slate-300 uppercase block">HARD (WHITE) WINDOW</span>
            <span className="text-base font-racing font-bold text-slate-100">{tyreLife.HARD} Laps Max</span>
          </div>
        </div>
      </div>

      {/* Strategies Comparison List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-red-500" />
            <h3 className="text-sm font-racing font-bold uppercase tracking-wider text-slate-200">
              Predicted Pit Stop Strategies ({currentCircuit.totalLaps} Laps)
            </h3>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-bold">
            ★ {optimalStrategy.name.split(' (')[0]} is Optimal
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {strategies.map((strat) => {
            const isSelected = activeStrategyId === strat.id;
            const isFastest = strat.deltaToOptimalSec === 0;

            return (
              <div
                key={strat.id}
                onClick={() => setActiveStrategyId(strat.id)}
                className={`p-4 sm:p-5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-red-500 shadow-xl bg-slate-900 ring-1 ring-red-500/50'
                    : isDarkMode
                    ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase ${
                      isFastest ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {strat.stops}-STOP STRATEGY
                    </span>
                    <h4 className="font-racing font-bold text-sm sm:text-base text-slate-100">
                      {strat.name}
                    </h4>
                    {isFastest && (
                      <span className="px-1.5 py-0.2 rounded bg-red-600 text-white text-[10px] font-bold font-mono animate-pulse">
                        FASTEST
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 font-mono text-xs self-end sm:self-center">
                    <div className="text-slate-400">
                      DELTA: <span className={isFastest ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                        {isFastest ? 'OPTIMAL' : `+${strat.deltaToOptimalSec}s`}
                      </span>
                    </div>
                    <div className="text-slate-400 hidden md:block">
                      RISK: <span className={strat.riskFactor === 'LOW' ? 'text-emerald-400' : strat.riskFactor === 'MEDIUM' ? 'text-amber-400' : 'text-red-400'}>
                        {strat.riskFactor}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stint Gantt Timeline Bar */}
                <div className="relative w-full h-8 rounded-lg overflow-hidden bg-slate-950 flex border border-slate-800 shadow-inner">
                  {strat.stints.map((stint, idx) => {
                    const widthPct = (stint.totalLaps / currentCircuit.totalLaps) * 100;
                    const colors = getCompoundColors(stint.compound);

                    return (
                      <div
                        key={idx}
                        style={{ width: `${widthPct}%` }}
                        className={`h-full relative flex items-center justify-center font-mono text-[11px] font-bold transition-all ${colors.bg} ${
                          stint.compound === 'HARD' ? 'text-slate-950' : 'text-white'
                        } border-r border-slate-950/40`}
                        title={`Stint ${idx + 1}: Laps ${stint.startLap} to ${stint.endLap} on ${stint.compound}`}
                      >
                        <span className="truncate px-1">
                          {stint.compound[0]} (L{stint.startLap}–{stint.endLap})
                        </span>

                        {/* Pit Stop Marker icon between stints */}
                        {idx < strat.stints.length - 1 && (
                          <span className="absolute right-0 top-0 bottom-0 w-2.5 bg-black/60 flex items-center justify-center text-[9px] text-white">
                            P
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Lap Ruler Markers */}
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1 px-1">
                  <span>Lap 1</span>
                  <span>Lap {Math.round(currentCircuit.totalLaps * 0.25)}</span>
                  <span>Lap {Math.round(currentCircuit.totalLaps * 0.5)}</span>
                  <span>Lap {Math.round(currentCircuit.totalLaps * 0.75)}</span>
                  <span>Lap {currentCircuit.totalLaps} 🏁</span>
                </div>

                {/* Description & Tactics */}
                <div className="mt-3 pt-3 border-t border-slate-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono text-slate-400">
                  <p className="text-slate-300">
                    {strat.description}
                  </p>
                  <span className="text-[11px] text-amber-300 font-medium shrink-0">
                    💡 {strat.keyAdvantage}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Pit Stop Wheel Gun Audio Simulator */}
      <div className={`p-5 sm:p-6 rounded-xl border ${
        isDarkMode ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-red-950/40 border-red-500/30' : 'bg-red-50/80 border-red-200'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-600 text-white uppercase">
                Pit Box Crew Audio Sim
              </span>
              <span className="text-xs text-slate-400 font-mono">Pneumatic Wheel Gun & Jack Drop Synthesizer</span>
            </div>
            <h3 className="text-lg font-racing font-bold text-slate-100 mt-1">
              Simulate Active Pit Stop Sequence
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Experience the authentic sub-2.5s tyre change soundscape with 4-corner wheel guns, jack drop, and throttle launch.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="simulate-pit-btn"
              onClick={handleSimulatePitStop}
              disabled={isSimulatingStop}
              className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center gap-2 shadow-lg transition ${
                isSimulatingStop
                  ? 'bg-amber-500 text-slate-950 animate-pulse cursor-wait'
                  : 'bg-red-600 text-white hover:bg-red-500 shadow-red-600/30 active:scale-95'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>{isSimulatingStop ? 'BOX BOX... CHANGING TYRES' : 'TRIGGER PIT STOP'}</span>
            </button>

            {pitStopTime !== null && (
              <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-emerald-500/40 text-center animate-in zoom-in duration-200">
                <span className="text-[10px] font-mono text-emerald-400 block font-bold">STATIONARY TIME</span>
                <span className="text-lg font-mono font-black text-white">
                  {pitStopTime}s
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Live Status indicator during stop */}
        {isSimulatingStop && (
          <div className="mt-4 p-3 rounded-lg bg-slate-950/80 border border-red-500/40 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <span>CAR STATIONARY IN PIT BOX • WHEEL GUNS ENGAGED (18,000 RPM)</span>
            </div>
            <span className="text-red-400 font-bold animate-pulse">RED LIGHTS ON</span>
          </div>
        )}
      </div>
    </div>
  );
};
