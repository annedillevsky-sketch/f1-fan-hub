import React from 'react';
import { Radio, RefreshCw, AlertCircle, Database, CheckCircle2 } from 'lucide-react';
import { useApiSports } from '../context/ApiSportsContext';

interface ApiStatusBannerProps {
  isDarkMode: boolean;
}

export const ApiStatusBanner: React.FC<ApiStatusBannerProps> = ({ isDarkMode }) => {
  const { apiStatus, loading, refreshData, season, setSeason } = useApiSports();

  return (
    <div 
      className={`px-4 py-2 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs font-mono transition-all ${
        isDarkMode 
          ? 'bg-slate-950/70 border-slate-800/80 text-slate-300' 
          : 'bg-white/90 border-slate-200 text-slate-700 shadow-sm'
      }`}
    >
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Status Indicator Dot */}
        <div className="flex items-center gap-1.5">
          <span 
            className={`w-2.5 h-2.5 rounded-full inline-block ${
              apiStatus.isLive 
                ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse' 
                : apiStatus.hasKey 
                  ? 'bg-amber-400' 
                  : 'bg-cyan-400'
            }`} 
          />
          <span className="font-bold uppercase tracking-wider text-[11px]">
            {apiStatus.isLive ? 'API-SPORTS LIVE' : 'API-SPORTS INTEGRATED'}
          </span>
        </div>

        <span className="text-slate-600 hidden sm:inline">|</span>

        {/* Status Message */}
        <span className="text-[11px] text-slate-400 truncate max-w-[280px] sm:max-w-md">
          {apiStatus.message}
        </span>

        {apiStatus.lastUpdated && (
          <span className="text-[10px] text-slate-500 hidden md:inline">
            • Synced: {apiStatus.lastUpdated}
          </span>
        )}
      </div>

      {/* Season Picker & Sync Action */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-slate-900/90 px-2 py-0.5 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase">Season:</span>
          <select
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            disabled={loading}
            className="bg-transparent text-red-400 font-bold text-xs focus:outline-none cursor-pointer"
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
        </div>

        <button
          onClick={() => refreshData()}
          disabled={loading}
          className={`p-1.5 rounded-lg border flex items-center gap-1 transition ${
            isDarkMode 
              ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300' 
              : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Fetch latest data from API-Sports"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-red-500' : ''}`} />
          <span className="text-[10px] font-bold hidden sm:inline">
            {loading ? 'SYNCING...' : 'SYNC'}
          </span>
        </button>
      </div>
    </div>
  );
};
