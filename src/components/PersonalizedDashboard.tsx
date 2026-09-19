import React, { useState } from 'react';
import { Driver, RadioMessage } from '../types';
import { 
  Star, 
  Radio, 
  Zap, 
  Activity, 
  ArrowUpRight, 
  Gauge, 
  Clock, 
  Shield, 
  Flame, 
  UserCheck,
  Bell,
  Volume2,
  Sliders,
  Check,
  Flag
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { playTeamRadioTransmission } from '../utils/audioAlerts';

interface PersonalizedDashboardProps {
  drivers: Driver[];
  favoriteDriverIds: string[];
  onToggleFavorite: (id: string) => void;
  onSelectDriverForTelemetry: (id: string) => void;
  onNavigateToTab: (tab: string) => void;
  isDarkMode: boolean;
  radioMessages: RadioMessage[];
}

export const PersonalizedDashboard: React.FC<PersonalizedDashboardProps> = ({
  drivers,
  favoriteDriverIds,
  onToggleFavorite,
  onSelectDriverForTelemetry,
  onNavigateToTab,
  isDarkMode,
  radioMessages,
}) => {
  const { alertPreferences, updateAlertPreference, user } = useAuth();
  const [playingRadioId, setPlayingRadioId] = useState<string | null>(null);
  const favoriteDrivers = drivers.filter(d => favoriteDriverIds.includes(d.id));

  const handlePlayDriverRadio = (msg: RadioMessage) => {
    setPlayingRadioId(msg.id);
    playTeamRadioTransmission(msg.message, msg.driverName);
    setTimeout(() => setPlayingRadioId(null), 3500);
  };


  return (
    <div className="space-y-6">
      {/* Header & Quick Selector Pills */}
      <div className={`p-4 sm:p-6 rounded-xl border ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase">
                VIP Driver Telemetry Deck
              </span>
              <span className="text-xs text-slate-400">Personalized Real-Time Tracking</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-racing font-bold text-slate-100 tracking-wide mt-1">
              My Paddock Favorites ({favoriteDrivers.length} Selected)
            </h2>
          </div>

          <div className="text-xs font-mono text-slate-400">
            Click any star to track your favorite drivers live
          </div>
        </div>

        {/* Quick Driver Toggle Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-800">
          <span className="text-xs font-mono text-slate-400 mr-1">QUICK TOGGLE:</span>
          {drivers.map(driver => {
            const isFav = favoriteDriverIds.includes(driver.id);
            return (
              <button
                key={driver.id}
                onClick={() => onToggleFavorite(driver.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono flex items-center gap-1.5 border transition ${
                  isFav
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                    : 'text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: driver.teamColor }} />
                <span>{driver.code}</span>
                <Star className={`w-3 h-3 ${isFav ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Alert Preferences & Audio Customizer Panel */}
      <div className={`p-4 sm:p-5 rounded-xl border ${
        isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-red-500" />
            <h3 className="text-sm font-racing font-bold text-slate-100 uppercase tracking-wide">
              Push Notification & Audio Alert Preferences
            </h3>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
            <Check className="w-3.5 h-3.5" />
            Auto-saved to {user?.name ? `${user.name}'s Account` : 'Local Profile'}
          </span>
        </div>

        <p className="text-xs text-slate-400 mb-3">
          Customize instant audio chirps and push banner alerts for your paddock session.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {[
            { key: 'sessionStart', label: 'Session Starts', icon: Flag },
            { key: 'safetyCar', label: 'Safety Car (SC)', icon: Shield },
            { key: 'fastestLap', label: 'Purple Sectors', icon: Zap },
            { key: 'teamRadio', label: 'Team Radio', icon: Radio },
            { key: 'pitWindow', label: 'Pit Windows', icon: Clock },
            { key: 'soundEffects', label: 'Sound FX', icon: Volume2 },
          ].map(({ key, label, icon: Icon }) => {
            const isEnabled = alertPreferences[key as keyof typeof alertPreferences];
            return (
              <button
                key={key}
                onClick={() => updateAlertPreference(key as any, !isEnabled)}
                className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition ${
                  isEnabled
                    ? 'bg-slate-800 border-red-500/50 text-slate-100 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-500 hover:text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <Icon className={`w-3.5 h-3.5 ${isEnabled ? 'text-red-400' : 'text-slate-600'}`} />
                  <span className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-700'}`} />
                </div>
                <span className="text-xs font-mono font-medium truncate">{label}</span>
                <span className="text-[10px] font-mono uppercase mt-0.5 text-slate-400">
                  {isEnabled ? 'ENABLED' : 'MUTED'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* When no favorites selected, show recommendation state */}
      {favoriteDrivers.length === 0 ? (
        <div className={`p-12 text-center rounded-xl border border-dashed ${
          isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-300'
        }`}>
          <Star className="w-12 h-12 text-amber-400 mx-auto opacity-70 mb-3" />
          <h3 className="text-xl font-racing font-bold text-slate-100">
            No Favorite Drivers Selected Yet
          </h3>
          <p className="text-xs font-mono text-slate-400 max-w-md mx-auto mt-2 mb-6">
            Star your heroes above or choose from the top contenders below to unlock customized pit strategy windows, live sector alerts, and team radio chatter.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            {drivers.slice(0, 4).map(d => (
              <button
                key={d.id}
                onClick={() => onToggleFavorite(d.id)}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-mono text-xs font-bold hover:bg-red-500 transition shadow-lg shadow-red-600/20"
              >
                + Track {d.firstName} {d.lastName} (#{d.number})
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Grid of Favorite Driver Telemetry Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {favoriteDrivers.map((driver) => {
            const driverRadio = radioMessages.find(m => m.driverCode === driver.code);

            return (
              <div 
                key={driver.id}
                className={`p-5 rounded-xl border relative overflow-hidden transition shadow-lg ${
                  isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                {/* Team accent strip */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1.5" 
                  style={{ backgroundColor: driver.teamColor }} 
                />

                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center font-racing font-black text-xl text-white shadow-md"
                      style={{ backgroundColor: driver.teamColor }}
                    >
                      #{driver.number}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-racing font-bold text-slate-100">
                          {driver.firstName} {driver.lastName}
                        </h3>
                        <span className="text-xs font-mono text-slate-400">({driver.countryCode})</span>
                      </div>
                      <div className="text-xs text-slate-400 font-mono">
                        {driver.team} • Position: <span className="font-bold text-slate-100">P{driver.currentPosition}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleFavorite(driver.id)}
                    className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 transition"
                    title="Remove from favorites"
                  >
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  </button>
                </div>

                {/* Primary Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className={`p-2.5 rounded-lg border ${
                    isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="text-[10px] font-mono text-slate-400">GAP TO LEADER</div>
                    <div className="text-sm font-mono font-bold text-slate-100 mt-1">
                      {driver.gapToLeader}
                    </div>
                  </div>

                  <div className={`p-2.5 rounded-lg border ${
                    isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="text-[10px] font-mono text-slate-400">LAST LAP</div>
                    <div className="text-sm font-mono font-bold text-slate-100 mt-1">
                      {driver.lastLapTime}
                    </div>
                  </div>

                  <div className={`p-2.5 rounded-lg border ${
                    isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="text-[10px] font-mono text-slate-400">TYRE LIFE</div>
                    <div className="text-sm font-mono font-bold text-amber-400 mt-1">
                      {driver.currentTyre} ({driver.tyreLaps}L)
                    </div>
                  </div>
                </div>

                {/* Microsectors */}
                <div className="flex items-center justify-between text-xs font-mono p-2.5 rounded-lg bg-slate-950/40 border border-slate-800 mb-4">
                  <span className="text-slate-400 text-[10px]">MICROSECTORS:</span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200">
                      S1: <span className="font-bold">{driver.s1Time}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200">
                      S2: <span className="font-bold">{driver.s2Time}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200">
                      S3: <span className="font-bold">{driver.s3Time}</span>
                    </span>
                  </div>
                </div>

                {/* Pit Stop Window Predictor */}
                <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-900/30 text-xs font-mono text-slate-300 mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-blue-400 font-bold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      STRATEGY PIT WINDOW
                    </span>
                    <button
                      onClick={() => onNavigateToTab('strategy')}
                      className="text-[10px] text-blue-400 hover:text-blue-300 underline font-mono"
                    >
                      Open Simulator &rarr;
                    </button>
                  </div>
                  <div className="text-slate-200 mt-1">
                    Expected Box Window: <span className="font-bold text-amber-300">Laps {driver.tyreLaps + 8} - {driver.tyreLaps + 11}</span>. Estimated pit loss: 19.8 seconds.
                  </div>
                </div>

                {/* Driver Radio Snippet */}
                {driverRadio && (
                  <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-900/30 text-xs font-mono text-amber-300 mb-4">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400">
                        <Radio className="w-3 h-3 animate-pulse" />
                        TEAM RADIO (LAP {driverRadio.lap})
                      </div>
                      <button
                        onClick={() => handlePlayDriverRadio(driverRadio)}
                        disabled={playingRadioId === driverRadio.id}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 border transition ${
                          playingRadioId === driverRadio.id
                            ? 'bg-amber-500 text-slate-950 border-amber-400'
                            : 'bg-slate-900 text-amber-300 border-amber-500/40 hover:bg-amber-500/20'
                        }`}
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>{playingRadioId === driverRadio.id ? 'TRANSMITTING...' : 'PLAY AUDIO'}</span>
                      </button>
                    </div>
                    <div className="italic">"{driverRadio.message}"</div>
                  </div>
                )}


                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => {
                      onSelectDriverForTelemetry(driver.id);
                      onNavigateToTab('telemetry');
                    }}
                    className="flex-1 py-2 rounded-lg bg-purple-600 text-white font-mono text-xs font-bold hover:bg-purple-500 transition flex items-center justify-center gap-1.5"
                  >
                    <Gauge className="w-3.5 h-3.5" />
                    <span>Open Telemetry</span>
                  </button>

                  <button
                    onClick={() => onNavigateToTab('circuit')}
                    className="flex-1 py-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-200 font-mono text-xs font-bold hover:bg-slate-800 transition flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Track on Map</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
