import React, { useState, useEffect } from 'react';
import { 
  Timer, 
  Calendar, 
  Users, 
  Car, 
  ChevronRight, 
  MapPin, 
  Zap, 
  Radio, 
  Sparkles,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { RACE_CALENDAR } from '../data/f1Data';
import { RaceEvent } from '../types';

interface HomeLandingProps {
  onNavigateTab: (tab: string) => void;
  isDarkMode: boolean;
  races?: RaceEvent[];
  loading?: boolean;
}

export const HomeLanding: React.FC<HomeLandingProps> = ({
  onNavigateTab,
  isDarkMode,
  races,
  loading = false,
}) => {
  // Target next Grand Prix dynamically from OpenF1 races or fallback
  const now = new Date();
  const availableRaces = races && races.length > 0 ? races : RACE_CALENDAR;
  const nextEvent = availableRaces.find(e => {
    if (e.status === 'LIVE') return true;
    const d = new Date(e.date);
    return !isNaN(d.getTime()) && d.getTime() >= (now.getTime() - 24 * 60 * 60 * 1000);
  }) || availableRaces.find(e => e.id === 'rd-17') || availableRaces[0];

  // Real-time Countdown timer state to the next Grand Prix race
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!nextEvent) return;
    
    // Parse target date (use session race time if available or event date)
    const raceSession = nextEvent.sessions?.find(s => s.type === 'RACE');
    const targetDateStr = raceSession?.dateTime || `${nextEvent.date}T13:00:00Z`;
    let targetTime = new Date(targetDateStr).getTime();
    if (isNaN(targetTime)) {
      targetTime = new Date(nextEvent.date).getTime();
    }

    // If target is in the past, provide simulated active race countdown
    const calcCountdown = () => {
      const currentTime = Date.now();
      let diff = targetTime - currentTime;

      if (isNaN(diff) || diff <= 0) {
        // If event date has passed, show active round or zero
        setTimeLeft({ days: 1, hours: 4, minutes: 12, seconds: 35 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calcCountdown();
    const timer = setInterval(calcCountdown, 1000);
    return () => clearInterval(timer);
  }, [nextEvent]);

  return (
    <div className="relative min-h-[78vh] flex flex-col items-center justify-center text-center px-4 py-8 sm:py-12 overflow-hidden">
      {/* Dynamic Background Lighting Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[750px] h-[350px] rounded-full bg-red-600/15 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-72 h-72 rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-80 h-80 rounded-full bg-red-700/10 blur-[130px] pointer-events-none" />

      {/* Subtle Carbon Fiber & Racing Grid Texture */}
      <div className="absolute inset-0 carbon-pattern opacity-40 pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center space-y-8 sm:space-y-10">
        
        {/* Top Motorsport Tag Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full neon-tag-glass text-xs font-mono text-cyan-300 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
          <span className="font-bold tracking-widest uppercase text-[11px] sm:text-xs">
            APEX TELEMETRY &amp; RACE HUB
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-red-400 font-semibold text-[10px] tracking-widest uppercase">
            2026 WORLD CHAMPIONSHIP
          </span>
        </div>

        {/* Brand Header: Large High-End F1 / APEX Motorsport Logo with Red Neon Glow */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-3 mb-1">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-red-600 flex items-center justify-center font-racing font-black text-2xl sm:text-3xl text-white shadow-[0_0_35px_rgba(239,68,68,0.6)]">
              F1
            </div>
            <div className="text-left">
              <span className="font-motorsport font-black text-xl sm:text-2xl tracking-wider text-slate-100 uppercase block leading-tight">
                APEX LIVE
              </span>
              <span className="text-[10px] sm:text-xs font-mono font-semibold tracking-widest text-red-500 uppercase block">
                OFFICIAL MOTORSPORT HUB
              </span>
            </div>
          </div>

          <h1 className="font-motorsport italic font-black uppercase text-4xl sm:text-6xl md:text-7xl tracking-tight leading-[0.95] metallic-red-cyan-glow">
            PINNACLE MOTORSPORT
          </h1>

          {/* Brief Welcome Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-slate-300 font-sans max-w-2xl mx-auto leading-relaxed pt-1">
            Welcome to the ultimate 2026 Formula 1 telemetry and race dynamics center.
            Experience live track telemetry, high-resolution driver analytics, and direct session updates.
          </p>
        </div>

        {/* Next Grand Prix Live Countdown Timer */}
        <div className="w-full max-w-2xl p-6 sm:p-8 rounded-3xl bg-slate-950/80 border border-red-500/30 shadow-[0_0_40px_rgba(239,68,68,0.2)] backdrop-blur-xl relative overflow-hidden group">
          {/* Top Neon Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
          
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-red-400">
              <Timer className="w-4 h-4 text-red-500" />
              <span>NEXT GRAND PRIX COUNTDOWN // ROUND {nextEvent.round}</span>
              {loading && (
                <span className="inline-flex items-center gap-1 text-[10px] text-cyan-400 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-700 ml-2">
                  <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                  <span>LIVE SYNC</span>
                </span>
              )}
            </div>

            <div className="text-xl sm:text-2xl font-motorsport font-black text-white uppercase tracking-wide flex items-center gap-2">
              <span>{nextEvent.flagEmoji}</span>
              <span>{nextEvent.name}</span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-red-500" />
              <span>{nextEvent.circuit}</span>
              <span>•</span>
              <span className="text-slate-300">{nextEvent.date}</span>
            </div>

            {/* Countdown Digits Grid */}
            <div className="grid grid-cols-4 gap-2 sm:gap-4 w-full max-w-md pt-2">
              <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col items-center shadow-inner">
                <span className="font-motorsport font-black text-3xl sm:text-4xl text-white">
                  {String(timeLeft.days).padStart(2, '0')}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mt-1">
                  DAYS
                </span>
              </div>

              <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col items-center shadow-inner">
                <span className="font-motorsport font-black text-3xl sm:text-4xl text-white">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mt-1">
                  HOURS
                </span>
              </div>

              <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col items-center shadow-inner">
                <span className="font-motorsport font-black text-3xl sm:text-4xl text-white">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mt-1">
                  MINS
                </span>
              </div>

              <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/90 border border-red-500/40 flex flex-col items-center shadow-inner">
                <span className="font-motorsport font-black text-3xl sm:text-4xl text-red-500 animate-pulse">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-red-400 mt-1">
                  SECS
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Clean Exploration Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full max-w-3xl pt-2">
          <button
            onClick={() => onNavigateTab('drivers')}
            className="p-4 rounded-2xl bg-slate-900/70 hover:bg-slate-800/90 border border-slate-800 hover:border-red-500/60 transition-all duration-300 text-left group shadow-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-600/15 text-red-400 border border-red-500/20 group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="font-motorsport font-bold text-sm text-white uppercase group-hover:text-red-400 transition-colors">
                  Drivers Grid
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  All 20 Pilots &amp; Portraits
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </button>

          <button
            onClick={() => onNavigateTab('teams')}
            className="p-4 rounded-2xl bg-slate-900/70 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/60 transition-all duration-300 text-left group shadow-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-600/15 text-cyan-400 border border-cyan-500/20 group-hover:scale-110 transition-transform">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <div className="font-motorsport font-bold text-sm text-white uppercase group-hover:text-cyan-400 transition-colors">
                  Teams &amp; Cars
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  3D CAD &amp; Livery Cutouts
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </button>

          <button
            onClick={() => onNavigateTab('schedule')}
            className="p-4 rounded-2xl bg-slate-900/70 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/60 transition-all duration-300 text-left group shadow-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-600/15 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="font-motorsport font-bold text-sm text-white uppercase group-hover:text-amber-400 transition-colors">
                  Schedule &amp; Live
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Sessions &amp; Telemetry
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </button>
        </div>

      </div>
    </div>
  );
};
