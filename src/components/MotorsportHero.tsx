import React from 'react';
import { Activity, Zap, Compass, Trophy, Timer, Shield, Sparkles } from 'lucide-react';

interface MotorsportHeroProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDarkMode: boolean;
}

export const MotorsportHero: React.FC<MotorsportHeroProps> = ({
  activeTab,
  setActiveTab,
  isDarkMode,
}) => {
  return (
    <div 
      id="apex-motorsport-hero"
      className="relative mb-8 rounded-2xl overflow-hidden border border-slate-800 carbon-pattern shadow-2xl transition-all duration-300"
    >
      {/* Dynamic Grid Lines & Glowing Accent Lights */}
      <div className="absolute inset-0 race-grid-lines opacity-30 pointer-events-none" />
      
      {/* Cyan & Crimson Ambient Neon Lighting Orbs */}
      <div className="absolute -top-32 -left-24 w-96 h-96 rounded-full bg-cyan-500/15 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-24 w-96 h-96 rounded-full bg-red-600/20 blur-[130px] pointer-events-none" />

      <div className="relative z-10 px-6 py-8 sm:px-10 sm:py-10 flex flex-col justify-between">
        {/* Top Badges & Status Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          {/* Requested Badge: A sleek neon-bordered glassmorphism tag saying "APEX TELEMETRY & RACE HUB" */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full neon-tag-glass text-xs font-mono text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
            <span className="font-bold tracking-wider uppercase text-[11px] sm:text-xs">
              APEX TELEMETRY &amp; RACE HUB
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-red-400 font-semibold text-[10px] tracking-widest uppercase">
              2026 PRO FEED
            </span>
          </div>

          {/* Secondary Brand Badge: F1 FAN HUB */}
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="px-2.5 py-1 rounded bg-slate-900/80 border border-slate-700/60 text-slate-300 font-bold uppercase tracking-wider text-[10px]">
              F1 FAN HUB // OFFICIAL TIMING
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-1 rounded bg-red-600/15 text-red-400 border border-red-500/30 text-[10px] font-bold">
              <Zap className="w-3 h-3" />
              LIVE SPEED TRAPS
            </span>
          </div>
        </div>

        {/* Brand Name & Large Bold Italicized Hero Title with Aggressive Red/Cyan Metallic Gradient Glow */}
        <div className="relative max-w-5xl">
          {/* Translucent Layered Background Text Behind It for Optical Depth */}
          <div 
            className="absolute -top-6 sm:-top-8 -left-2 select-none pointer-events-none font-orbitron italic font-black uppercase text-5xl sm:text-7xl lg:text-8xl tracking-widest text-white/[0.04] whitespace-nowrap z-0 overflow-hidden max-w-full"
            aria-hidden="true"
          >
            PINNACLE MOTORSPORT
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center font-racing font-black text-xl text-white shadow-lg shadow-red-600/40">
                F1
              </div>
              <span className="font-motorsport font-black text-lg sm:text-xl tracking-wider text-slate-200 uppercase">
                APEX LIVE <span className="text-red-500">//</span> 2026 WORLD CHAMPIONSHIP
              </span>
            </div>

            {/* Requested Hero Header: PINNACLE MOTORSPORT with subtle red/cyan neon text-glow */}
            <h1 className="font-motorsport italic font-black uppercase text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-[0.95] metallic-red-cyan-glow mt-2">
              PINNACLE MOTORSPORT
            </h1>

            <div className="mt-2 text-sm sm:text-lg font-motorsport italic font-bold tracking-wider text-slate-300 uppercase flex items-center gap-2">
              <span className="text-red-500">///</span>
              <span>PRECISION TELEMETRY &amp; REAL-TIME RACE DYNAMICS</span>
            </div>

            <p className="mt-3 text-xs sm:text-sm md:text-base text-slate-300 font-sans max-w-2xl leading-relaxed">
              Direct telemetry uplink from Baku City Circuit with live sector deltas, high-frequency speed traps up to 354.8 km/h, 
              instant DRS actuation metrics, and driver championship simulations.
            </p>
          </div>
        </div>

        {/* Telemetry Quick Status & Navigation Jump Grid */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <button
            onClick={() => setActiveTab('timing')}
            className={`p-3 rounded-xl border text-left transition group ${
              activeTab === 'timing' 
                ? 'bg-red-600/15 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Live Timing</span>
              <Activity className="w-3.5 h-3.5 text-red-500 group-hover:scale-110 transition-transform" />
            </div>
            <div className="font-racing font-bold text-base text-white">BAKU GP LIVE</div>
            <div className="text-[10px] font-mono text-emerald-400">354.8 KM/H TRAP</div>
          </button>

          <button
            onClick={() => setActiveTab('standings')}
            className={`p-3 rounded-xl border text-left transition group ${
              activeTab === 'standings' 
                ? 'bg-red-600/15 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Grid Leaders</span>
              <Trophy className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="font-racing font-bold text-base text-white">DRIVERS &amp; POINTS</div>
            <div className="text-[10px] font-mono text-cyan-400">P1 ANTONELLI (348 PTS)</div>
          </button>

          <button
            onClick={() => setActiveTab('teams')}
            className={`p-3 rounded-xl border text-left transition group ${
              activeTab === 'teams' 
                ? 'bg-red-600/15 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Constructors</span>
              <Shield className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="font-racing font-bold text-base text-white">10 F1 TEAMS</div>
            <div className="text-[10px] font-mono text-slate-400">MCLAREN VS MERCEDES</div>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`p-3 rounded-xl border text-left transition group ${
              activeTab === 'calendar' 
                ? 'bg-red-600/15 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Race Calendar</span>
              <Timer className="w-3.5 h-3.5 text-yellow-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="font-racing font-bold text-base text-white">ROUND 17 OF 24</div>
            <div className="text-[10px] font-mono text-amber-400">AZERBAIJAN GP</div>
          </button>
        </div>
      </div>
    </div>
  );
};
