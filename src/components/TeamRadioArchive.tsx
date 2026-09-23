import React, { useState, useMemo } from 'react';
import { 
  Radio, 
  Search, 
  X, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Clock, 
  History, 
  Filter, 
  RotateCcw, 
  Copy, 
  Check, 
  Flag, 
  User, 
  ShieldAlert, 
  ChevronRight,
  SlidersHorizontal,
  Flame,
  Award
} from 'lucide-react';
import { RadioMessage } from '../types';
import { TEAM_RADIO_ARCHIVE } from '../data/f1Data';
import { DRIVER_PORTRAITS } from '../data/driverMedia';
import { DriverAvatar } from './DriverAvatar';
import { playTeamRadioTransmission, playTeamRadioChirp } from '../utils/audioAlerts';

interface TeamRadioArchiveProps {
  radioMessages?: RadioMessage[];
  isDarkMode?: boolean;
  initialDriverFilter?: string;
  initialTeamFilter?: string;
  onSelectRadioMessage?: (msg: RadioMessage) => void;
  className?: string;
}

export const TeamRadioArchive: React.FC<TeamRadioArchiveProps> = ({
  radioMessages = TEAM_RADIO_ARCHIVE,
  isDarkMode = true,
  initialDriverFilter = 'ALL',
  initialTeamFilter = 'ALL',
  onSelectRadioMessage,
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [eraFilter, setEraFilter] = useState<'all' | 'recent' | 'historic'>('all');
  const [selectedDriver, setSelectedDriver] = useState<string>(initialDriverFilter);
  const [selectedTeam, setSelectedTeam] = useState<string>(initialTeamFilter);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'driver' | 'team'>('newest');

  // Currently selected / active message for the featured radio player deck
  const [activeMessageId, setActiveMessageId] = useState<string>(radioMessages[0]?.id || '');
  const [isPlayingAudioId, setIsPlayingAudioId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Extract unique drivers and teams from the archive for dropdown filters
  const availableDrivers = useMemo(() => {
    const map = new Map<string, { code: string; name: string }>();
    radioMessages.forEach(msg => {
      if (!map.has(msg.driverCode)) {
        map.set(msg.driverCode, { code: msg.driverCode, name: msg.driverName });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [radioMessages]);

  const availableTeams = useMemo(() => {
    const set = new Set<string>();
    radioMessages.forEach(msg => {
      if (msg.team) set.add(msg.team);
    });
    return Array.from(set).sort();
  }, [radioMessages]);

  // Filter and search logic
  const filteredMessages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return radioMessages.filter(msg => {
      // 1. Era filter
      if (eraFilter === 'recent' && msg.isHistoric) return false;
      if (eraFilter === 'historic' && !msg.isHistoric) return false;

      // 2. Driver filter
      if (selectedDriver !== 'ALL') {
        if (msg.driverCode.toLowerCase() !== selectedDriver.toLowerCase() &&
            msg.driverName.toLowerCase() !== selectedDriver.toLowerCase()) {
          return false;
        }
      }

      // 3. Team filter
      if (selectedTeam !== 'ALL') {
        if (msg.team.toLowerCase() !== selectedTeam.toLowerCase()) {
          return false;
        }
      }

      // 4. Type filter
      if (selectedType !== 'ALL') {
        if (msg.type !== selectedType) {
          return false;
        }
      }

      // 5. Text search query (matches driver name, code, team, message words, grand prix, context)
      if (q) {
        const matchName = msg.driverName.toLowerCase().includes(q);
        const matchCode = msg.driverCode.toLowerCase().includes(q);
        const matchTeam = msg.team.toLowerCase().includes(q);
        const matchText = msg.message.toLowerCase().includes(q);
        const matchGp = msg.grandPrix?.toLowerCase().includes(q) || false;
        const matchContext = msg.context?.toLowerCase().includes(q) || false;
        const matchYear = msg.year ? msg.year.toString().includes(q) : false;

        if (!matchName && !matchCode && !matchTeam && !matchText && !matchGp && !matchContext && !matchYear) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        const yearA = a.year || (a.isHistoric ? 2015 : 2026);
        const yearB = b.year || (b.isHistoric ? 2015 : 2026);
        if (yearB !== yearA) return yearB - yearA;
        return (b.lap || 0) - (a.lap || 0);
      }
      if (sortBy === 'oldest') {
        const yearA = a.year || (a.isHistoric ? 2015 : 2026);
        const yearB = b.year || (b.isHistoric ? 2015 : 2026);
        if (yearA !== yearB) return yearA - yearB;
        return (a.lap || 0) - (b.lap || 0);
      }
      if (sortBy === 'driver') {
        return a.driverName.localeCompare(b.driverName);
      }
      if (sortBy === 'team') {
        return a.team.localeCompare(b.team);
      }
      return 0;
    });
  }, [radioMessages, searchQuery, eraFilter, selectedDriver, selectedTeam, selectedType, sortBy]);

  // Active message to show on player deck
  const activeMessage = useMemo(() => {
    return filteredMessages.find(m => m.id === activeMessageId) || filteredMessages[0] || null;
  }, [filteredMessages, activeMessageId]);

  // Play audio transmission handler
  const handlePlayTransmission = (msg: RadioMessage) => {
    setActiveMessageId(msg.id);
    onSelectRadioMessage?.(msg);
    setIsPlayingAudioId(msg.id);
    playTeamRadioTransmission(msg.message, msg.driverName);

    // Auto reset transmitting indicator after estimated duration
    const duration = Math.min(10000, Math.max(3000, msg.message.length * 75));
    setTimeout(() => {
      setIsPlayingAudioId(prev => prev === msg.id ? null : prev);
    }, duration);
  };

  // Stop currently playing audio
  const handleStopAudio = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    playTeamRadioChirp();
    setIsPlayingAudioId(null);
  };

  // Copy transcript to clipboard
  const handleCopyQuote = (msg: RadioMessage) => {
    const text = `${msg.driverName} (${msg.team}, ${msg.year || '2026'} ${msg.grandPrix || ''}): ${msg.message}`;
    navigator.clipboard?.writeText(text);
    setCopiedId(msg.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setEraFilter('all');
    setSelectedDriver('ALL');
    setSelectedTeam('ALL');
    setSelectedType('ALL');
    setSortBy('newest');
  };

  const isFiltered = searchQuery !== '' || eraFilter !== 'all' || selectedDriver !== 'ALL' || selectedTeam !== 'ALL' || selectedType !== 'ALL';

  const typeColorMap: Record<string, { bg: string; text: string; border: string }> = {
    STRATEGY: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
    PITS: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
    INCIDENT: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
    CELEBRATION: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    MEMORABLE: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Banner */}
      <div className={`p-5 sm:p-6 rounded-2xl border transition-all relative overflow-hidden shadow-xl ${
        isDarkMode 
          ? 'bg-gradient-to-br from-slate-900 via-slate-950 to-[#0A0E17] border-slate-800' 
          : 'bg-gradient-to-br from-white via-slate-50 to-slate-100 border-slate-200'
      }`}>
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 shadow-md">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <span className="font-mono text-xs uppercase tracking-widest text-red-400 font-bold">
                PIT-TO-CAR ENCRYPTED COMMS // OFFICIAL ARCHIVE
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-motorsport italic font-black uppercase tracking-wider text-slate-100">
              TEAM RADIO ARCHIVE
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-mono mt-1 max-w-2xl">
              Search and replay historic F1 classics and recent 2026 race transmissions. Filter by driver, team, or strategic scenario with synthesized audio transmission playback.
            </p>
          </div>

          {/* Quick Counter Metrics */}
          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            <div className="px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/60 font-mono text-center">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">TOTAL IN ARCHIVE</div>
              <div className="text-lg font-bold text-white">{radioMessages.length}</div>
            </div>
            <div className="px-3 py-2 rounded-xl bg-cyan-950/40 border border-cyan-800/50 font-mono text-center">
              <div className="text-[10px] text-cyan-400 uppercase tracking-wider">RECENT 2026</div>
              <div className="text-lg font-bold text-cyan-300">
                {radioMessages.filter(m => !m.isHistoric).length}
              </div>
            </div>
            <div className="px-3 py-2 rounded-xl bg-amber-950/40 border border-amber-800/50 font-mono text-center">
              <div className="text-[10px] text-amber-400 uppercase tracking-wider">HISTORIC CLASSICS</div>
              <div className="text-lg font-bold text-amber-300">
                {radioMessages.filter(m => m.isHistoric).length}
              </div>
            </div>
          </div>
        </div>

        {/* Featured Live Transmitter Console */}
        {activeMessage && (
          <div className="mt-6 pt-5 border-t border-slate-800/80 relative">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold text-slate-300">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                TRANSMITTER DECK // SELECTED CLIP
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                CHANNEL FREQ 456.800 MHz • ENCRYPTED
              </span>
            </div>

            <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
              isPlayingAudioId === activeMessage.id
                ? 'bg-amber-500/10 border-amber-400/50 ring-1 ring-amber-400/40'
                : 'bg-slate-900/90 border-slate-800'
            }`}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Driver Info + Team Badge */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <div className="relative">
                    <DriverAvatar
                      driverId={activeMessage.driverCode.toLowerCase()}
                      driverCode={activeMessage.driverCode}
                      lastName={activeMessage.driverName}
                      teamColor={activeMessage.teamColor}
                      size="lg"
                    />
                    <div 
                      className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900"
                      style={{ backgroundColor: activeMessage.teamColor }}
                      title={activeMessage.team}
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-motorsport italic font-bold text-lg text-white truncate">
                        {activeMessage.driverName}
                      </span>
                      <span 
                        className="px-2 py-0.5 rounded text-[11px] font-mono font-bold"
                        style={{ 
                          backgroundColor: `${activeMessage.teamColor}25`, 
                          color: activeMessage.teamColor,
                          border: `1px solid ${activeMessage.teamColor}50` 
                        }}
                      >
                        {activeMessage.team}
                      </span>
                      {activeMessage.isHistoric ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <History className="w-3 h-3" />
                          HISTORIC CLASSIC ({activeMessage.year || 'LEGEND'})
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                          RECENT ({activeMessage.year || '2026'})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-1 flex-wrap">
                      {activeMessage.grandPrix && (
                        <span>{activeMessage.grandPrix}</span>
                      )}
                      <span>•</span>
                      <span>Lap {activeMessage.lap}</span>
                      <span>•</span>
                      <span>{activeMessage.timeString}</span>
                      <span className={`px-2 py-0.2 rounded text-[10px] font-bold border ${typeColorMap[activeMessage.type]?.bg || ''} ${typeColorMap[activeMessage.type]?.text || ''} ${typeColorMap[activeMessage.type]?.border || ''}`}>
                        {activeMessage.type}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Audio Action Controls */}
                <div className="flex items-center gap-2 self-end lg:self-auto flex-wrap">
                  {isPlayingAudioId === activeMessage.id ? (
                    <button
                      onClick={handleStopAudio}
                      className="px-4 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white transition shadow-lg shadow-red-600/30"
                    >
                      <VolumeX className="w-4 h-4 animate-bounce" />
                      <span>STOP AUDIO</span>
                    </button>
                  ) : (
                    <button
                      id={`play-featured-${activeMessage.id}`}
                      onClick={() => handlePlayTransmission(activeMessage)}
                      className="px-4 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow-lg shadow-amber-500/30 group"
                    >
                      <Volume2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span>LISTEN TRANSMISSION</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleCopyQuote(activeMessage)}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                    title="Copy radio quote"
                  >
                    {copiedId === activeMessage.id ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Spoken Quote Typography */}
              <div className="mt-3.5 p-3.5 rounded-xl bg-black/40 border border-slate-800/80">
                <p className="text-base sm:text-lg font-mono font-medium italic text-amber-300 tracking-wide">
                  {activeMessage.message}
                </p>
                {activeMessage.context && (
                  <p className="text-xs font-mono text-slate-400 mt-2 flex items-start gap-1.5 pt-2 border-t border-slate-800/60">
                    <span className="text-amber-400 font-bold shrink-0">CONTEXT:</span>
                    <span>{activeMessage.context}</span>
                  </p>
                )}
              </div>

              {/* Radio equalizer animated bars when playing */}
              {isPlayingAudioId === activeMessage.id && (
                <div className="mt-3 flex items-center gap-1.5 text-xs font-mono text-amber-400">
                  <span className="animate-pulse">TRANSMITTING VOICE MODULATION</span>
                  <div className="flex items-end gap-1 h-3 ml-2">
                    <span className="w-1 bg-amber-400 h-2 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1 bg-amber-400 h-3 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1 bg-amber-400 h-1 animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="w-1 bg-amber-400 h-3.5 animate-bounce" style={{ animationDelay: '450ms' }} />
                    <span className="w-1 bg-amber-400 h-2 animate-bounce" style={{ animationDelay: '200ms' }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Search & Filter Command Bar */}
      <div className={`p-4 sm:p-5 rounded-2xl border transition shadow-lg ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="space-y-4">
          {/* Main Search Input */}
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="team-radio-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by driver, team name, keywords (e.g. 'Verstappen', 'Ferrari', 'GP2 engine', 'tyres', 'leave me alone')..."
              className={`w-full pl-11 pr-10 py-3 rounded-xl text-sm font-mono transition outline-none border ${
                isDarkMode 
                  ? 'bg-slate-950/80 border-slate-700/80 text-white placeholder-slate-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                  : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-lg transition"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Pills and Dropdowns Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            {/* Era Tabs (All, Recent, Historic) */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
              <button
                id="filter-era-all"
                onClick={() => setEraFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  eraFilter === 'all'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>All Messages</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                  {radioMessages.length}
                </span>
              </button>

              <button
                id="filter-era-recent"
                onClick={() => setEraFilter('recent')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  eraFilter === 'recent'
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>Recent 2026</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                  {radioMessages.filter(m => !m.isHistoric).length}
                </span>
              </button>

              <button
                id="filter-era-historic"
                onClick={() => setEraFilter('historic')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  eraFilter === 'historic'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <History className="w-3.5 h-3.5 text-amber-300" />
                <span>Historic Classics</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                  {radioMessages.filter(m => m.isHistoric).length}
                </span>
              </button>
            </div>

            {/* Select Dropdowns: Driver, Team, Category, Sort */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Driver Filter */}
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">DRIVER:</span>
                <select
                  id="select-radio-driver"
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium bg-slate-800 border border-slate-700 text-slate-200 outline-none hover:border-slate-600 focus:border-red-500"
                >
                  <option value="ALL">All Drivers</option>
                  {availableDrivers.map(d => (
                    <option key={d.code} value={d.code}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Team Filter */}
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">TEAM:</span>
                <select
                  id="select-radio-team"
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium bg-slate-800 border border-slate-700 text-slate-200 outline-none hover:border-slate-600 focus:border-red-500"
                >
                  <option value="ALL">All Teams</option>
                  {availableTeams.map(t => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">TYPE:</span>
                <select
                  id="select-radio-type"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium bg-slate-800 border border-slate-700 text-slate-200 outline-none hover:border-slate-600 focus:border-red-500"
                >
                  <option value="ALL">All Types</option>
                  <option value="STRATEGY">Strategy</option>
                  <option value="PITS">Pits</option>
                  <option value="INCIDENT">Incident</option>
                  <option value="CELEBRATION">Celebration</option>
                  <option value="MEMORABLE">Memorable / Iconic</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">SORT:</span>
                <select
                  id="select-radio-sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium bg-slate-800 border border-slate-700 text-slate-200 outline-none hover:border-slate-600 focus:border-red-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest / Historic First</option>
                  <option value="driver">Driver Name</option>
                  <option value="team">Team Name</option>
                </select>
              </div>

              {/* Reset Filters button */}
              {isFiltered && (
                <button
                  id="reset-radio-filters-btn"
                  onClick={handleResetFilters}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-mono text-red-400 hover:text-white bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 flex items-center gap-1 transition"
                  title="Reset all search and filter conditions"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Active Filter Tags Indicator */}
          {isFiltered && (
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800 flex-wrap text-xs font-mono">
              <span className="text-slate-400">Active Filters:</span>

              {searchQuery && (
                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 flex items-center gap-1 border border-slate-700">
                  Search: "{searchQuery}"
                  <X className="w-3 h-3 cursor-pointer hover:text-red-400" onClick={() => setSearchQuery('')} />
                </span>
              )}

              {eraFilter !== 'all' && (
                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 flex items-center gap-1 border border-slate-700">
                  Era: {eraFilter === 'recent' ? 'Recent 2026' : 'Historic'}
                  <X className="w-3 h-3 cursor-pointer hover:text-red-400" onClick={() => setEraFilter('all')} />
                </span>
              )}

              {selectedDriver !== 'ALL' && (
                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 flex items-center gap-1 border border-slate-700">
                  Driver: {selectedDriver}
                  <X className="w-3 h-3 cursor-pointer hover:text-red-400" onClick={() => setSelectedDriver('ALL')} />
                </span>
              )}

              {selectedTeam !== 'ALL' && (
                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 flex items-center gap-1 border border-slate-700">
                  Team: {selectedTeam}
                  <X className="w-3 h-3 cursor-pointer hover:text-red-400" onClick={() => setSelectedTeam('ALL')} />
                </span>
              )}

              {selectedType !== 'ALL' && (
                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 flex items-center gap-1 border border-slate-700">
                  Type: {selectedType}
                  <X className="w-3 h-3 cursor-pointer hover:text-red-400" onClick={() => setSelectedType('ALL')} />
                </span>
              )}

              <span className="text-slate-500 ml-auto">
                Found {filteredMessages.length} of {radioMessages.length}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Radio Messages Grid / List */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="font-bold text-slate-200">
              {filteredMessages.length} TRANSMISSIONS
            </span>
            <span>• Click card to inspect or press Listen to play audio</span>
          </div>
        </div>

        {filteredMessages.length === 0 ? (
          /* Empty State */
          <div className={`p-10 rounded-2xl border text-center font-mono space-y-4 ${
            isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-500">
              <Radio className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-200">No Radio Transmissions Found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                No archived messages matched your search query or filters. Try adjusting driver, team, or clearing keywords.
              </p>
            </div>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white transition shadow-md inline-flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset All Filters</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMessages.map((msg) => {
              const isSelected = activeMessage?.id === msg.id;
              const isPlaying = isPlayingAudioId === msg.id;

              return (
                <div
                  key={msg.id}
                  onClick={() => {
                    setActiveMessageId(msg.id);
                    onSelectRadioMessage?.(msg);
                  }}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-800/90 border-red-500/60 ring-2 ring-red-500/20 shadow-lg'
                      : isDarkMode
                      ? 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  {/* Top Bar: Driver Info, Era Badge, Team Pill */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <DriverAvatar
                          driverId={msg.driverCode.toLowerCase()}
                          driverCode={msg.driverCode}
                          lastName={msg.driverName}
                          teamColor={msg.teamColor}
                          size="md"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-sm text-white truncate">
                              {msg.driverName}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                              #{msg.driverCode}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 truncate">
                            <span 
                              className="w-2 h-2 rounded-full inline-block shrink-0" 
                              style={{ backgroundColor: msg.teamColor }} 
                            />
                            <span className="truncate">{msg.team}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Era / Year Pill */}
                      <div className="shrink-0 text-right">
                        {msg.isHistoric ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 inline-flex items-center gap-1">
                            <History className="w-3 h-3" />
                            {msg.year || 'HISTORIC'}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                            {msg.year || '2026'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Radio Transcript */}
                    <div className="my-2.5">
                      <p className={`text-sm font-mono italic leading-relaxed ${
                        isPlaying 
                          ? 'text-amber-300 font-bold' 
                          : isSelected 
                          ? 'text-amber-200' 
                          : 'text-slate-200'
                      }`}>
                        {msg.message}
                      </p>

                      {msg.context && (
                        <p className="text-[11px] font-mono text-slate-400 mt-2 line-clamp-2">
                          <span className="text-slate-500 font-bold">Context:</span> {msg.context}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bottom Metadata & Play Control */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-2">
                    <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 flex-wrap">
                      {msg.grandPrix && (
                        <span className="truncate max-w-[150px]">{msg.grandPrix}</span>
                      )}
                      <span>Lap {msg.lap}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${typeColorMap[msg.type]?.bg || ''} ${typeColorMap[msg.type]?.text || ''} ${typeColorMap[msg.type]?.border || ''}`}>
                        {msg.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyQuote(msg);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        title="Copy transcript"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        id={`btn-play-radio-${msg.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isPlaying) {
                            handleStopAudio();
                          } else {
                            handlePlayTransmission(msg);
                          }
                        }}
                        className={`px-2.5 py-1.5 rounded-lg font-mono text-[11px] font-bold flex items-center gap-1.5 transition ${
                          isPlaying
                            ? 'bg-amber-500 text-slate-950 font-black ring-2 ring-amber-400 shadow-md'
                            : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 hover:text-white'
                        }`}
                        title="Listen to audio transmission"
                      >
                        <Volume2 className={`w-3.5 h-3.5 ${isPlaying ? 'animate-bounce' : ''}`} />
                        <span>{isPlaying ? 'PLAYING...' : 'LISTEN'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
