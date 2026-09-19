import React, { useState, useEffect } from 'react';
import { 
  Driver, 
  FlagStatus, 
  TyreCompound, 
  RadioMessage 
} from '../types';
import { 
  Play, 
  Pause, 
  FastForward, 
  RotateCcw, 
  Star, 
  Radio, 
  Zap, 
  ArrowUp, 
  ArrowDown, 
  Minus, 
  AlertTriangle, 
  Volume2, 
  CheckCircle2, 
  Gauge, 
  Filter,
  Eye,
  Sparkles,
  Sliders,
  Wind,
  Droplets,
  Compass,
  Layers
} from 'lucide-react';
import { playTeamRadioChirp, playAlertChime, playTeamRadioTransmission } from '../utils/audioAlerts';
import { DriverAvatar } from './DriverAvatar';
import { TeamBadge } from './TeamBadge';

interface LiveTimingProps {
  drivers: Driver[];
  setDrivers: React.Dispatch<React.SetStateAction<Driver[]>>;
  flagStatus: FlagStatus;
  isDarkMode: boolean;
  soundEnabled: boolean;
  favoriteDriverIds: string[];
  onToggleFavorite: (id: string) => void;
  onSelectDriverForTelemetry: (id: string) => void;
  radioMessages: RadioMessage[];
}

export const LiveTiming: React.FC<LiveTimingProps> = ({
  drivers,
  setDrivers,
  flagStatus,
  isDarkMode,
  soundEnabled,
  favoriteDriverIds,
  onToggleFavorite,
  onSelectDriverForTelemetry,
  radioMessages,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [currentLap, setCurrentLap] = useState<number>(38);
  const totalLaps = 51;
  const [filterMode, setFilterMode] = useState<'all' | 'top10' | 'favorites'>('all');
  const [activeRadio, setActiveRadio] = useState<RadioMessage | null>(radioMessages[0] || null);

  // Casual (Simple) View vs. Pro View Toggle
  const [viewMode, setViewMode] = useState<'simple' | 'pro'>(() => {
    try {
      const saved = localStorage.getItem('f1_timing_view_mode');
      if (saved === 'simple' || saved === 'pro') return saved;
    } catch {}
    return 'simple'; // Default to friendly Casual View
  });

  const handleViewModeChange = (mode: 'simple' | 'pro') => {
    setViewMode(mode);
    try {
      localStorage.setItem('f1_timing_view_mode', mode);
    } catch {}
  };

  // Live simulation tick: updates sector times, lap times, and track progress
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setDrivers(prevDrivers => {
        return prevDrivers.map((driver, idx) => {
          // Increment track progress
          const progressDelta = (0.015 * simSpeed) * (1 - (idx * 0.0015));
          let newProgress = driver.trackProgress + progressDelta;

          // Lap completed rollover
          if (newProgress >= 1.0) {
            newProgress = newProgress % 1.0;
            // Slightly fluctuate lap time for realism
            const randomDelta = (Math.random() * 0.4 - 0.2).toFixed(3);
            const baseSec = 87 + (idx * 0.2); // approx 1:27.xxx
            const totalSec = baseSec + parseFloat(randomDelta);
            const mins = Math.floor(totalSec / 60);
            const secs = (totalSec % 60).toFixed(3).padStart(6, '0');
            const newLapTime = `${mins}:${secs}`;

            return {
              ...driver,
              trackProgress: newProgress,
              lastLapTime: newLapTime,
              tyreLaps: driver.tyreLaps + 1,
              // Random purple/green sector
              s1Status: idx === 0 && Math.random() > 0.6 ? 'fastest' : Math.random() > 0.5 ? 'personal' : 'normal',
              s2Status: idx === 1 && Math.random() > 0.6 ? 'fastest' : Math.random() > 0.5 ? 'personal' : 'normal',
              s3Status: Math.random() > 0.5 ? 'personal' : 'normal',
            };
          }

          return {
            ...driver,
            trackProgress: newProgress,
            drsActive: driver.intervalToAhead.includes('+0.') || (parseFloat(driver.intervalToAhead.replace(/[^0-9.]/g, '')) < 1.0),
          };
        });
      });
    }, 1000 / simSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, simSpeed]);

  // Tyre badge styling helper
  const getTyreBadge = (compound: TyreCompound, laps: number) => {
    const config = {
      SOFT: { text: 'S', color: 'bg-red-600 text-white border-red-500', name: 'Soft' },
      MEDIUM: { text: 'M', color: 'bg-yellow-500 text-slate-950 border-yellow-400 font-bold', name: 'Medium' },
      HARD: { text: 'H', color: 'bg-white text-slate-900 border-slate-300 font-bold', name: 'Hard' },
      INTERMEDIATE: { text: 'I', color: 'bg-emerald-600 text-white border-emerald-500', name: 'Inter' },
      WET: { text: 'W', color: 'bg-blue-600 text-white border-blue-500', name: 'Wet' },
    }[compound];

    return (
      <div className="flex items-center gap-2 font-mono">
        <span 
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-black shadow-sm ${config.color}`}
          title={`${config.name} compound`}
        >
          {config.text}
        </span>
        <div className="text-left">
          <span className="text-xs font-bold text-slate-200 block leading-tight">{config.name}</span>
          <span className="text-[10px] text-slate-400 font-medium">{laps} laps old</span>
        </div>
      </div>
    );
  };

  // Sector time badge styling helper
  const getSectorBadge = (time: string, status: 'fastest' | 'personal' | 'normal') => {
    const style = {
      fastest: 'text-purple-300 font-bold bg-purple-500/20 border-purple-500/40 shadow-sm shadow-purple-500/10',
      personal: 'text-emerald-300 font-bold bg-emerald-500/20 border-emerald-500/40 shadow-sm shadow-emerald-500/10',
      normal: 'text-slate-300 bg-slate-800/60 border-slate-750',
    }[status];

    return (
      <span className={`px-2 py-1 rounded-md text-xs font-mono border ${style}`}>
        {time}
      </span>
    );
  };

  // Filter drivers based on view mode
  const filteredDrivers = drivers.filter(d => {
    if (filterMode === 'top10') return d.currentPosition <= 10;
    if (filterMode === 'favorites') return favoriteDriverIds.includes(d.id);
    return true;
  });

  const [isRadioPlayingAudio, setIsRadioPlayingAudio] = useState<boolean>(false);

  const handlePlayRadio = (msg: RadioMessage, withVoice = true) => {
    setActiveRadio(msg);
    if (soundEnabled && withVoice) {
      setIsRadioPlayingAudio(true);
      playTeamRadioTransmission(msg.message, msg.driverName);
      setTimeout(() => setIsRadioPlayingAudio(false), 3500);
    } else if (soundEnabled) {
      playTeamRadioChirp();
    }
  };

  return (
    <div className="space-y-6">
      {/* Live Grand Prix Header Info Banner */}
      <div className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl ${
        isDarkMode 
          ? 'bg-gradient-to-r from-red-950/40 via-[#0D111A] to-slate-900 border-red-500/30 shadow-red-950/20' 
          : 'bg-gradient-to-r from-red-50 via-white to-slate-50 border-red-200 shadow-slate-200'
      }`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center font-racing font-black text-2xl text-white shadow-lg shadow-red-600/30 shrink-0">
            17
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-red-600 text-white shadow-sm animate-pulse">
                LIVE GRAND PRIX
              </span>
              <span className="text-xs font-mono text-slate-400">Round 17 of 24</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                DRY TRACK
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-racing font-extrabold tracking-wide text-slate-100 mt-1">
              AZERBAIJAN GRAND PRIX • BAKU CITY CIRCUIT 🇦🇿
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              6.003 km • 20 Turns • Neftchilar Avenue 2.2 km DRS Zone • Lap {currentLap} of {totalLaps}
            </p>
          </div>
        </div>

        {/* Environmental conditions: Pro view shows full telemetry, Simple view shows friendly overview */}
        {viewMode === 'pro' ? (
          <div className="flex items-center gap-2 font-mono text-xs self-end md:self-center flex-wrap">
            <div className={`px-3 py-1.5 rounded-xl border ${isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <span className="text-[10px] text-slate-400 block">AIR TEMP</span>
              <span className="font-bold text-slate-200 text-sm">27.5°C</span>
            </div>
            <div className={`px-3 py-1.5 rounded-xl border ${isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <span className="text-[10px] text-slate-400 block">TRACK TEMP</span>
              <span className="font-bold text-red-400 text-sm">41.2°C</span>
            </div>
            <div className={`px-3 py-1.5 rounded-xl border ${isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                <Wind className="w-2.5 h-2.5" /> WIND
              </span>
              <span className="font-bold text-slate-200 text-sm">14 KM/H NW</span>
            </div>
            <div className={`px-3 py-1.5 rounded-xl border ${isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                <Droplets className="w-2.5 h-2.5" /> HUMIDITY
              </span>
              <span className="font-bold text-blue-400 text-sm">52%</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 self-end md:self-center font-mono">
            <div className={`px-4 py-2 rounded-xl border flex items-center gap-3 ${
              isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase block leading-tight">Race Conditions</span>
                <span className="text-xs font-bold text-slate-200">27.5°C • Clean Air & Clear Track</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Control Bar: Simulation + Filters + Casual vs Pro Toggle */}
      <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-lg ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          {/* Play/Pause Feed */}
          <button
            id="sim-play-pause-btn"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center gap-2 shadow-md transition ${
              isPlaying 
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-amber-500/20' 
                : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/20'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-slate-950" /> : <Play className="w-4 h-4 fill-slate-950" />}
            <span>{isPlaying ? 'PAUSE FEED' : 'RESUME FEED'}</span>
          </button>

          {/* Sim Speed Selectors */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            <span className="px-2 text-slate-500 text-[10px] uppercase font-bold">SPEED:</span>
            {[1, 2, 5].map(spd => (
              <button
                key={spd}
                onClick={() => setSimSpeed(spd)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  simSpeed === spd ? 'bg-red-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Current Lap Display */}
          <div className="flex items-center gap-2 font-mono text-xs px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-400">RACE LAP:</span>
            <span className="text-base font-extrabold text-red-500 font-racing">
              {currentLap} <span className="text-xs text-slate-400 font-mono">/ {totalLaps}</span>
            </span>
          </div>
        </div>

        {/* Right Controls: Simple / Pro Toggle & Filter Tabs */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end flex-wrap">
          {/* Casual (Simple) View vs. Pro View Toggle Switch */}
          <div className="flex items-center gap-1 p-1 rounded-xl border border-slate-700/80 bg-slate-950 text-xs font-mono shadow-inner">
            <button
              id="timing-view-toggle-simple"
              onClick={() => handleViewModeChange('simple')}
              className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-all ${
                viewMode === 'simple'
                  ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md shadow-red-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Casual View: Clean, accessible view with driver avatars, team badges, gaps and tyres"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Simple View</span>
            </button>
            <button
              id="timing-view-toggle-pro"
              onClick={() => handleViewModeChange('pro')}
              className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-all ${
                viewMode === 'pro'
                  ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md shadow-red-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Pro View: Complete telemetry tower with microsector times, speed traps, and DRS status"
            >
              <Gauge className="w-3.5 h-3.5" />
              <span>Pro View</span>
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl border border-slate-800 bg-slate-950 text-xs font-mono">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg transition font-medium ${
                filterMode === 'all' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All 20 Cars
            </button>
            <button
              onClick={() => setFilterMode('top10')}
              className={`px-3 py-1.5 rounded-lg transition font-medium ${
                filterMode === 'top10' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Top 10
            </button>
            <button
              onClick={() => setFilterMode('favorites')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition font-medium ${
                filterMode === 'favorites' ? 'bg-red-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>Starred ({favoriteDriverIds.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Team Radio Chatter Live Box */}
      {activeRadio && (
        <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-md ${
          isDarkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3.5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition shadow-md ${
              isRadioPlayingAudio 
                ? 'bg-amber-500 text-slate-950 shadow-amber-500/30 ring-2 ring-amber-400' 
                : 'bg-red-600/20 border border-red-500/30 text-red-400'
            }`}>
              <Radio className={`w-5 h-5 ${isRadioPlayingAudio ? 'animate-spin' : 'animate-pulse'}`} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-racing font-extrabold uppercase tracking-wider text-slate-100">
                  {activeRadio.driverName} (#{activeRadio.driverCode})
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {activeRadio.team}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Lap {activeRadio.lap} • {activeRadio.timeString}
                </span>
                {isRadioPlayingAudio && (
                  <span className="flex items-center gap-1 text-xs font-mono font-bold text-amber-400 animate-pulse">
                    <Volume2 className="w-3.5 h-3.5" />
                    TRANSMITTING AUDIO...
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm font-mono text-amber-300 mt-1 italic">
                "{activeRadio.message}"
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center flex-wrap">
            {/* Audio Play Button */}
            <button
              id="play-radio-audio-btn"
              onClick={() => handlePlayRadio(activeRadio, true)}
              disabled={isRadioPlayingAudio}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 border transition shadow-sm ${
                isRadioPlayingAudio
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700 hover:text-white'
              }`}
              title="Play simulated pit-to-car radio voice transmission"
            >
              <Volume2 className="w-4 h-4" />
              <span>{isRadioPlayingAudio ? 'TRANSMITTING...' : 'PLAY AUDIO'}</span>
            </button>

            {/* Radio message quick selector */}
            <div className="flex items-center gap-1">
              {radioMessages.map(msg => (
                <button
                  key={msg.id}
                  onClick={() => handlePlayRadio(msg, false)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition ${
                    activeRadio.id === msg.id 
                      ? 'bg-red-600 text-white border-red-500 font-bold' 
                      : 'text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {msg.driverCode}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Primary Timing Tower Table */}
      <div className={`rounded-2xl border overflow-hidden shadow-2xl transition-all ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-left select-none">
            <thead>
              <tr className={`border-b text-[11px] uppercase tracking-wider ${
                isDarkMode ? 'bg-slate-950/90 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}>
                {/* Headers adjust based on Simple View vs Pro View */}
                <th className="py-4 px-4 text-center w-16">POS</th>
                <th className="py-4 px-3 w-10">FAV</th>
                
                {viewMode === 'pro' && (
                  <th className="py-4 px-3 w-12 text-center">NO</th>
                )}

                <th className="py-4 px-4">DRIVER & TEAM</th>

                {viewMode === 'simple' && (
                  <th className="py-4 px-4">CONSTRUCTOR</th>
                )}

                <th className="py-4 px-4">GAP / INTERVAL</th>

                {viewMode === 'pro' && (
                  <>
                    <th className="py-4 px-3">LAST LAP</th>
                    <th className="py-4 px-3">SECTOR 1</th>
                    <th className="py-4 px-3">SECTOR 2</th>
                    <th className="py-4 px-3">SECTOR 3</th>
                  </>
                )}

                <th className="py-4 px-4">TYRE COMPOUND</th>

                {viewMode === 'pro' ? (
                  <>
                    <th className="py-4 px-3 text-center">STOPS</th>
                    <th className="py-4 px-3 text-center">DRS</th>
                    <th className="py-4 px-4 text-right">SPEED TRAP</th>
                  </>
                ) : (
                  <th className="py-4 px-4">RACE PROGRESS</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan={viewMode === 'simple' ? 6 : 13} className="py-12 text-center text-slate-400">
                    No drivers matching filter. Star your favorite drivers using the star icon!
                  </td>
                </tr>
              ) : (
                filteredDrivers.map((driver) => {
                  const isFavorite = favoriteDriverIds.includes(driver.id);
                  const posDelta = driver.gridPosition - driver.currentPosition;

                  return (
                    <tr 
                      key={driver.id} 
                      className={`hover:bg-slate-800/50 transition duration-150 group cursor-pointer ${
                        isFavorite ? (isDarkMode ? 'bg-red-950/20' : 'bg-red-50/60') : ''
                      }`}
                      onClick={() => onSelectDriverForTelemetry(driver.id)}
                    >
                      {/* POS - Larger, Bolder Position Badge */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 font-bold">
                          <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-racing font-black text-base transition-transform group-hover:scale-110 shadow-sm ${
                            driver.currentPosition === 1 
                              ? 'bg-gradient-to-br from-amber-300 to-amber-500 text-slate-950 shadow-md shadow-amber-500/30 ring-1 ring-amber-300' 
                              : driver.currentPosition === 2 
                              ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-950 shadow-md ring-1 ring-slate-200' 
                              : driver.currentPosition === 3 
                              ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white shadow-md ring-1 ring-amber-500' 
                              : isDarkMode 
                              ? 'bg-slate-800/90 text-slate-200 border border-slate-700/80' 
                              : 'bg-slate-200 text-slate-800 border border-slate-300'
                          }`}>
                            {driver.currentPosition}
                          </span>
                          {/* Gain / Loss indicator */}
                          <span className="text-[11px] font-bold">
                            {posDelta > 0 ? (
                              <span className="text-emerald-400 flex items-center" title={`Gained ${posDelta} positions`}>
                                <ArrowUp className="w-3.5 h-3.5" />
                              </span>
                            ) : posDelta < 0 ? (
                              <span className="text-red-400 flex items-center" title={`Lost ${Math.abs(posDelta)} positions`}>
                                <ArrowDown className="w-3.5 h-3.5" />
                              </span>
                            ) : (
                              <span title="Position unchanged" className="inline-flex">
                                <Minus className="w-3 h-3 text-slate-500" />
                              </span>
                            )}
                          </span>
                        </div>
                      </td>

                      {/* Favorite Star */}
                      <td className="py-4 px-3 text-center" onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(driver.id);
                      }}>
                        <button 
                          className="p-1.5 rounded-lg hover:bg-slate-800/80 transition"
                          title={isFavorite ? 'Remove from favorites' : 'Add to favorite drivers'}
                        >
                          <Star className={`w-4 h-4 ${
                            isFavorite ? 'fill-amber-400 text-amber-400' : 'text-slate-500 hover:text-slate-300'
                          }`} />
                        </button>
                      </td>

                      {/* Pro View Number Column */}
                      {viewMode === 'pro' && (
                        <td className="py-4 px-3 font-bold font-racing text-sm text-slate-400 text-center">
                          #{driver.number}
                        </td>
                      )}

                      {/* DRIVER & TEAM: Avatar + Official Team Badge + Larger Bold Typography */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3.5">
                          {/* Driver Portrait Avatar */}
                          <DriverAvatar
                            driverId={driver.id}
                            driverCode={driver.code}
                            firstName={driver.firstName}
                            lastName={driver.lastName}
                            number={driver.number}
                            teamColor={driver.teamColor}
                            size="md"
                            className="ring-2 ring-slate-800"
                          />

                          {/* Team Stripe */}
                          <div 
                            className="w-1.5 h-9 rounded-full shrink-0 shadow-sm" 
                            style={{ backgroundColor: driver.teamColor }} 
                          />

                          {/* Driver Name & Country */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              {/* Larger bolder name */}
                              <span className="font-racing font-extrabold text-base sm:text-lg tracking-wide text-slate-100 group-hover:text-red-400 transition-colors">
                                {driver.firstName} <span className="uppercase">{driver.lastName}</span>
                              </span>
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                                #{driver.number}
                              </span>
                              <span className="text-[11px] font-mono text-slate-400">
                                {driver.countryCode}
                              </span>
                            </div>

                            {/* Team with badge in Pro view, or secondary details */}
                            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                              <TeamBadge teamName={driver.team} size="xs" />
                              <span className="truncate">{driver.team}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Simple View: Dedicated Constructor Column with Official Badge */}
                      {viewMode === 'simple' && (
                        <td className="py-4 px-4 text-slate-300">
                          <div className="flex items-center gap-2">
                            <TeamBadge teamName={driver.team} size="sm" />
                            <span className="font-medium text-xs sm:text-sm text-slate-200">
                              {driver.team}
                            </span>
                          </div>
                        </td>
                      )}

                      {/* Gap / Interval - Clear High-Contrast Spacing */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-sm text-slate-100 font-mono">
                          {driver.gapToLeader}
                        </div>
                        {driver.intervalToAhead !== '-' && (
                          <div className="text-xs text-slate-400 font-mono mt-0.5">
                            int {driver.intervalToAhead}
                          </div>
                        )}
                      </td>

                      {/* Pro View Telemetry Columns: Last Lap + Microsectors */}
                      {viewMode === 'pro' && (
                        <>
                          <td className="py-4 px-3">
                            <div className="font-bold text-xs text-slate-100 font-mono">{driver.lastLapTime}</div>
                            <div className="text-[10px] text-purple-400 font-mono">best {driver.bestLapTime}</div>
                          </td>
                          <td className="py-4 px-3">
                            {getSectorBadge(driver.s1Time, driver.s1Status)}
                          </td>
                          <td className="py-4 px-3">
                            {getSectorBadge(driver.s2Time, driver.s2Status)}
                          </td>
                          <td className="py-4 px-3">
                            {getSectorBadge(driver.s3Time, driver.s3Status)}
                          </td>
                        </>
                      )}

                      {/* Tyre Compound & Laps */}
                      <td className="py-4 px-4">
                        {getTyreBadge(driver.currentTyre, driver.tyreLaps)}
                      </td>

                      {/* Pro View Extra Columns: Stops, DRS, Speed Trap */}
                      {viewMode === 'pro' ? (
                        <>
                          <td className="py-4 px-3 text-center">
                            <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 font-bold text-xs border border-slate-700">
                              {driver.pitStops}
                            </span>
                          </td>
                          <td className="py-4 px-3 text-center">
                            {driver.drsActive ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
                                DRS ACTIVE
                              </span>
                            ) : (
                              <span className="text-slate-600 text-xs font-mono">-</span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-right font-bold text-xs sm:text-sm text-slate-200 font-mono">
                            {driver.speedTrapKmH.toFixed(1)} <span className="text-[10px] font-normal text-slate-500">km/h</span>
                          </td>
                        </>
                      ) : (
                        /* Simple View: Friendly Track Progress Bar */
                        <td className="py-4 px-4 min-w-[140px]">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                              <span>Lap Progress</span>
                              <span className="font-bold text-slate-200">{(driver.trackProgress * 100).toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-750">
                              <div 
                                className="h-full rounded-full transition-all duration-300"
                                style={{ 
                                  width: `${Math.min(100, Math.max(5, driver.trackProgress * 100))}%`,
                                  backgroundColor: driver.teamColor
                                }}
                              />
                            </div>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Legend Footer */}
        <div className={`p-4 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono ${
          isDarkMode ? 'bg-slate-950/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}>
          {viewMode === 'pro' ? (
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block shadow-sm shadow-purple-500/50" />
                Overall Fastest Sector (Purple)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-sm shadow-emerald-500/50" />
                Personal Best Sector (Green)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block shadow-sm shadow-yellow-500/50" />
                Normal Pace (Yellow)
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-400">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Casual View active: Essential race leaderboard, driver avatars & gaps. Toggle <strong>Pro View</strong> above for microsectors.</span>
            </div>
          )}

          <div className="text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-ping" />
            <span>Click any driver row to jump directly into Telemetry Studio</span>
          </div>
        </div>
      </div>
    </div>
  );
};
