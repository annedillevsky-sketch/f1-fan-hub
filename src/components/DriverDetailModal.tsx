import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Trophy, 
  Medal, 
  Flag, 
  Flame, 
  Star, 
  Share2, 
  Calendar, 
  MapPin, 
  Car, 
  Zap, 
  Activity, 
  Volume2, 
  History, 
  Award, 
  CheckCircle2, 
  ChevronRight,
  ExternalLink,
  Info,
  ArrowLeftRight
} from 'lucide-react';
import { 
  DriverDetailedProfile, 
  getDriverDetailedProfile, 
  DRIVER_CAREER_DATABASE 
} from '../data/driverCareerData';
import { DRIVER_PORTRAITS, TEAM_CAR_LIVERIES } from '../data/driverMedia';
import { playTeamRadioTransmission } from '../utils/audioAlerts';

interface DriverDetailModalProps {
  driverIdOrCode: string | null;
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  onSelectDriverForTelemetry?: (id: string) => void;
  onOpenCompare?: (driverId: string) => void;
}

export const DriverDetailModal: React.FC<DriverDetailModalProps> = ({
  driverIdOrCode,
  isOpen,
  onClose,
  isDarkMode = true,
  isFavorite = false,
  onToggleFavorite,
  onSelectDriverForTelemetry,
  onOpenCompare,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'career' | 'season2026' | 'radio'>('overview');
  const [imageError, setImageError] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Look up profile in database
  const profile: DriverDetailedProfile | undefined = useMemo(() => {
    if (!driverIdOrCode) return undefined;
    return getDriverDetailedProfile(driverIdOrCode);
  }, [driverIdOrCode]);

  // Reset tab and image error state when driver changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab('overview');
      setImageError(false);
      setCopiedToast(false);
      setIsPlayingAudio(false);
    }
  }, [driverIdOrCode, isOpen]);

  // Handle ESC key to close modal & lock body scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen || !profile) {
    return null;
  }

  const teamCarLivery = TEAM_CAR_LIVERIES[profile.liveryKey];

  const handleShare = () => {
    const text = `${profile.fullName} (#${profile.number}) - ${profile.team} • 2026 F1 Championship: P${profile.season2026.position} with ${profile.season2026.totalPoints} PTS. Career: ${profile.career.wins} Wins, ${profile.career.podiums} Podiums, ${profile.career.worldChampionships} Titles.`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    }
  };

  const handlePlayQuote = () => {
    if (!profile.famousQuote || isPlayingAudio) return;
    setIsPlayingAudio(true);
    playTeamRadioTransmission(profile.famousQuote.text);
    setTimeout(() => {
      setIsPlayingAudio(false);
    }, 4500);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-8 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="driver-modal-title"
    >
      <div 
        className={`relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden text-slate-100 transition-all ${
          isDarkMode 
            ? 'bg-[#0B0F17] border-slate-800 shadow-[0_25px_60px_rgba(0,0,0,0.8)]' 
            : 'bg-white border-slate-200 text-slate-900 shadow-2xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dynamic Team Colored Top Accent Bar */}
        <div 
          className="h-1.5 w-full shrink-0" 
          style={{ backgroundColor: profile.teamColor }}
        />

        {/* Modal Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between gap-3 shrink-0 ${
          isDarkMode ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-3 min-w-0">
            {/* Driver Number Badge */}
            <div 
              className="w-11 h-11 rounded-2xl flex items-center justify-center font-racing font-black text-xl text-slate-950 shrink-0 shadow-md ring-2 ring-white/10"
              style={{ backgroundColor: profile.teamColor }}
            >
              #{profile.number}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 
                  id="driver-modal-title"
                  className="font-racing font-black text-lg sm:text-2xl tracking-wide uppercase truncate"
                >
                  {profile.fullName}
                </h2>
                <span className="text-sm" title={profile.country}>{profile.flagEmoji}</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700">
                  {profile.code}
                </span>
                {profile.season2026.position === 1 && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-amber-400" />
                    P1 LEADER
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span 
                  className="font-bold uppercase tracking-wider"
                  style={{ color: profile.teamColor }}
                >
                  {profile.team}
                </span>
                <span>•</span>
                <span>2026 Official World Championship Profile</span>
              </div>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Favorite Toggle Button */}
            {onToggleFavorite && (
              <button
                onClick={() => onToggleFavorite(profile.id)}
                className={`p-2.5 rounded-xl border transition ${
                  isFavorite 
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' 
                    : 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorite drivers'}
                aria-label="Toggle favorite"
              >
                <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400' : ''}`} />
              </button>
            )}

            {/* Share / Copy Summary Button */}
            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60 transition relative"
              title="Copy driver statistics summary"
              aria-label="Share driver stats"
            >
              <Share2 className="w-4 h-4" />
              {copiedToast && (
                <span className="absolute -bottom-8 right-0 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500 text-slate-950 shadow-md whitespace-nowrap animate-bounce">
                  Copied!
                </span>
              )}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Close modal (Esc)"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-6">
          {/* Driver Hero Showcase Card */}
          <div className={`p-4 sm:p-6 rounded-2xl border relative overflow-hidden ${
            isDarkMode 
              ? 'bg-gradient-to-br from-slate-900/90 via-slate-950 to-black border-slate-800' 
              : 'bg-gradient-to-br from-slate-50 via-white to-slate-100 border-slate-200'
          }`}>
            {/* Ambient Team Glow Background */}
            <div 
              className="absolute -right-16 -top-16 w-72 h-72 rounded-full opacity-15 blur-3xl pointer-events-none"
              style={{ backgroundColor: profile.teamColor }}
            />
            <div 
              className="absolute -left-16 -bottom-16 w-60 h-60 rounded-full opacity-10 blur-3xl pointer-events-none"
              style={{ backgroundColor: profile.teamColor }}
            />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
              {/* Driver Image or Official Stylized Silhouette */}
              <div className="md:col-span-5 flex flex-col items-center justify-center">
                <div 
                  className="w-48 h-56 sm:w-56 sm:h-64 rounded-2xl flex items-center justify-center relative overflow-hidden border-2 shadow-2xl transition group"
                  style={{ 
                    borderColor: `${profile.teamColor}70`,
                    background: `linear-gradient(180deg, ${profile.teamColor}15 0%, rgba(15,23,42,0.95) 100%)`
                  }}
                >
                  {!imageError ? (
                    <img 
                      src={profile.headshotUrl} 
                      alt={profile.fullName}
                      onError={() => setImageError(true)}
                      className="w-full h-full object-contain object-bottom drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)] transform group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    /* High-tech Motorsport SVG Placeholder */
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                      <div 
                        className="w-24 h-24 rounded-full border-2 flex items-center justify-center mb-3 shadow-inner"
                        style={{ borderColor: profile.teamColor, backgroundColor: `${profile.teamColor}15` }}
                      >
                        <Car className="w-12 h-12" style={{ color: profile.teamColor }} />
                      </div>
                      <span className="font-racing font-black text-3xl tracking-wider text-slate-100">
                        {profile.code}
                      </span>
                      <span className="text-xs font-mono uppercase font-bold text-slate-400 mt-1">
                        #{profile.number} • {profile.country}
                      </span>
                    </div>
                  )}

                  {/* Watermark Number in background */}
                  <div 
                    className="absolute right-2 bottom-1 font-racing font-black text-6xl opacity-10 select-none pointer-events-none text-white"
                  >
                    #{profile.number}
                  </div>
                </div>

                {/* Team Car Livery Cutout Preview */}
                {teamCarLivery && (
                  <div className="mt-3 w-48 sm:w-56 h-12 flex items-center justify-center opacity-85 hover:opacity-100 transition">
                    <img 
                      src={teamCarLivery} 
                      alt={`${profile.team} Car Livery`}
                      className="max-h-full object-contain filter drop-shadow-md"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
              </div>

              {/* Driver Key Stats Snapshot */}
              <div className="md:col-span-7 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span 
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider"
                      style={{ 
                        backgroundColor: `${profile.teamColor}25`, 
                        color: profile.teamColor,
                        border: `1px solid ${profile.teamColor}50` 
                      }}
                    >
                      {profile.team}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {profile.carName}
                    </span>
                  </div>

                  <h3 className="font-racing font-extrabold text-2xl sm:text-3xl text-white">
                    {profile.fullName}
                  </h3>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">
                    Power Unit: <span className="text-slate-200 font-semibold">{profile.powerUnit}</span>
                  </p>
                </div>

                {/* 4-Stat Metric Quick Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">2026 RANK</span>
                    <div className="font-racing font-black text-xl text-amber-400 mt-0.5">
                      P{profile.season2026.position}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">2026 POINTS</span>
                    <div className="font-racing font-black text-xl text-white mt-0.5">
                      {profile.season2026.totalPoints}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">2026 WINS</span>
                    <div className="font-racing font-black text-xl text-red-400 mt-0.5 flex items-center justify-center gap-1">
                      <Flame className="w-4 h-4 text-red-400" />
                      <span>{profile.season2026.wins}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">CAREER PODIUMS</span>
                    <div className="font-racing font-black text-xl text-cyan-400 mt-0.5">
                      {profile.career.podiums}
                    </div>
                  </div>
                </div>

                {/* Career Championships Highlight (if applicable) */}
                {profile.career.worldChampionships > 0 ? (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
                        {profile.career.worldChampionships}x Formula 1 World Champion
                      </div>
                      <div className="text-[11px] font-mono text-amber-200/80">
                        {profile.career.championshipYears?.join(', ')}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center gap-3 text-xs font-mono text-slate-400">
                    <Medal className="w-4 h-4 text-slate-500" />
                    <span>F1 Debut: <strong className="text-slate-200">{profile.career.f1Debut.year} {profile.career.f1Debut.grandPrix}</strong> ({profile.career.f1Debut.team})</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-1.5 shrink-0 ${
                activeTab === 'overview' 
                  ? 'bg-red-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>Bio &amp; Passport</span>
            </button>

            <button
              onClick={() => setActiveTab('career')}
              className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-1.5 shrink-0 ${
                activeTab === 'career' 
                  ? 'bg-red-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Career Record ({profile.career.grandPrixStarts} GPs)</span>
            </button>

            <button
              onClick={() => setActiveTab('season2026')}
              className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-1.5 shrink-0 ${
                activeTab === 'season2026' 
                  ? 'bg-red-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>2026 Season Form</span>
            </button>

            {profile.famousQuote && (
              <button
                onClick={() => setActiveTab('radio')}
                className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'radio' 
                    ? 'bg-red-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Team Radio Moments</span>
              </button>
            )}
          </div>

          {/* Tab 1: Bio & Passport */}
          {activeTab === 'overview' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Driver Biography Text */}
              <div className={`p-4 sm:p-5 rounded-2xl border ${
                isDarkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                  <Award className="w-4 h-4 text-red-500" />
                  <span>Racing Profile &amp; Campaign Overview</span>
                </h4>
                <p className="text-sm leading-relaxed text-slate-300">
                  {profile.biography}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-800">
                  <span className="text-[11px] font-mono text-slate-400 font-bold uppercase block mb-1">
                    Driving Characteristics &amp; Style:
                  </span>
                  <p className="text-xs font-mono text-slate-300 leading-relaxed italic">
                    "{profile.racingStyle}"
                  </p>
                </div>
              </div>

              {/* Passport & Fast Facts */}
              <div className={`p-4 sm:p-5 rounded-2xl border ${
                isDarkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <Flag className="w-4 h-4 text-amber-500" />
                  <span>Driver Passport &amp; Official Metadata</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Nationality</span>
                    <div className="font-bold text-slate-200 text-sm mt-0.5 flex items-center gap-1.5">
                      <span>{profile.flagEmoji}</span>
                      <span>{profile.country} ({profile.countryCode})</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Born / Age</span>
                    <div className="font-bold text-slate-200 text-sm mt-0.5">
                      {profile.dateOfBirth} ({profile.age} years)
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Birthplace</span>
                    <div className="font-bold text-slate-200 text-sm mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-red-400" />
                      <span>{profile.placeOfBirth}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Permanent Car Number</span>
                    <div className="font-bold text-amber-400 text-sm mt-0.5 font-racing">
                      #{profile.number}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Current Team</span>
                    <div className="font-bold text-slate-200 text-sm mt-0.5" style={{ color: profile.teamColor }}>
                      {profile.team}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Chassis / Chassis Code</span>
                    <div className="font-bold text-slate-200 text-sm mt-0.5 truncate">
                      {profile.carName}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Career Record */}
          {activeTab === 'career' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Comprehensive Career Numbers */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <span className="text-[10px] font-mono text-slate-400 block font-bold uppercase">TITLES</span>
                  <div className="font-racing font-black text-2xl text-amber-400 mt-1">
                    {profile.career.worldChampionships}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <span className="text-[10px] font-mono text-slate-400 block font-bold uppercase">GP STARTS</span>
                  <div className="font-racing font-black text-2xl text-white mt-1">
                    {profile.career.grandPrixStarts}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <span className="text-[10px] font-mono text-slate-400 block font-bold uppercase">WINS</span>
                  <div className="font-racing font-black text-2xl text-red-400 mt-1">
                    {profile.career.wins}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <span className="text-[10px] font-mono text-slate-400 block font-bold uppercase">PODIUMS</span>
                  <div className="font-racing font-black text-2xl text-cyan-400 mt-1">
                    {profile.career.podiums}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <span className="text-[10px] font-mono text-slate-400 block font-bold uppercase">POLE POS</span>
                  <div className="font-racing font-black text-2xl text-purple-400 mt-1">
                    {profile.career.polePositions}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <span className="text-[10px] font-mono text-slate-400 block font-bold uppercase">CAREER PTS</span>
                  <div className="font-racing font-black text-2xl text-emerald-400 mt-1">
                    {profile.career.totalCareerPoints}
                  </div>
                </div>
              </div>

              {/* Milestones Card */}
              <div className={`p-4 sm:p-5 rounded-2xl border ${
                isDarkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Formula 1 Career Milestones</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-500 font-bold block text-[10px]">F1 DEBUT</span>
                      <span className="text-slate-200 font-semibold">{profile.career.f1Debut.year} • {profile.career.f1Debut.grandPrix}</span>
                      <span className="text-slate-400 block text-[11px]">{profile.career.f1Debut.team}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-500 font-bold block text-[10px]">FIRST GRAND PRIX WIN</span>
                      {profile.career.firstWin ? (
                        <>
                          <span className="text-slate-200 font-semibold">{profile.career.firstWin.year} • {profile.career.firstWin.grandPrix}</span>
                        </>
                      ) : (
                        <span className="text-slate-500">Searching for maiden victory</span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-500 font-bold block text-[10px]">FIRST PODIUM</span>
                      {profile.career.firstPodium ? (
                        <span className="text-slate-200 font-semibold">{profile.career.firstPodium.year} • {profile.career.firstPodium.grandPrix}</span>
                      ) : (
                        <span className="text-slate-500">Chasing maiden podium</span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-500 font-bold block text-[10px]">HIGHEST RACE FINISH &amp; GRID</span>
                      <span className="text-slate-200 font-semibold">{profile.career.highestRaceFinish} (Start: {profile.career.highestGridPosition})</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Career Teams Chronology */}
              <div className={`p-4 sm:p-5 rounded-2xl border ${
                isDarkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <History className="w-4 h-4 text-cyan-400" />
                  <span>Team History &amp; Chronology</span>
                </h4>

                <div className="space-y-2.5">
                  {profile.career.careerTeams.map((ct, idx) => (
                    <div 
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono"
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded font-bold bg-slate-800 text-slate-300 text-[11px] whitespace-nowrap">
                          {ct.years}
                        </span>
                        <div>
                          <div className="font-bold text-slate-100 text-sm">{ct.team}</div>
                          {ct.highlight && (
                            <div className="text-[11px] text-slate-400 mt-0.5">{ct.highlight}</div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-slate-400 text-[11px] self-end sm:self-auto">
                        {ct.races !== undefined && <span>{ct.races} GPs</span>}
                        {ct.wins !== undefined && ct.wins > 0 && (
                          <span className="text-amber-400 font-bold flex items-center gap-1">
                            <Flame className="w-3 h-3" />
                            {ct.wins} Wins
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: 2026 Season Form */}
          {activeTab === 'season2026' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">GRAND PRIX POINTS</span>
                  <div className="font-racing font-bold text-xl text-slate-100 mt-1">
                    {profile.season2026.racePoints} <span className="text-xs font-normal text-slate-500">PTS</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">SPRINT POINTS</span>
                  <div className="font-racing font-bold text-xl text-slate-100 mt-1">
                    {profile.season2026.sprintPoints} <span className="text-xs font-normal text-slate-500">PTS</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">2026 POLES</span>
                  <div className="font-racing font-bold text-xl text-purple-400 mt-1">
                    {profile.season2026.polePositions}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">FASTEST LAPS</span>
                  <div className="font-racing font-bold text-xl text-cyan-400 mt-1">
                    {profile.season2026.fastestLaps}
                  </div>
                </div>
              </div>

              {/* Recent Race Results Ribbon */}
              <div className={`p-4 sm:p-5 rounded-2xl border ${
                isDarkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
                  <span>Recent 2026 Grand Prix Form Guide</span>
                  <span className="text-[11px] text-slate-500">Last 8 Rounds</span>
                </h4>

                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {profile.season2026.recentResults.map((res, i) => {
                    const isP1 = res === 'P1';
                    const isPodium = res === 'P2' || res === 'P3';
                    const isDnf = res === 'DNF';

                    return (
                      <div 
                        key={i} 
                        className={`px-3 py-2 rounded-xl text-center font-mono shrink-0 border shadow-sm ${
                          isP1 
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-black' 
                            : isPodium 
                            ? 'bg-slate-800 text-cyan-300 border-cyan-500/50 font-bold' 
                            : isDnf 
                            ? 'bg-red-950/60 text-red-400 border-red-800/80 font-bold' 
                            : 'bg-slate-950 text-slate-300 border-slate-800'
                        }`}
                      >
                        <div className="text-[10px] uppercase text-slate-400 mb-0.5">R{i + 1}</div>
                        <div className="text-sm font-racing font-extrabold">{res}</div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Best 2026 Finish: <strong className="text-slate-200">{profile.season2026.bestFinish}</strong></span>
                  <span>Laps Led: <strong className="text-amber-400 font-bold">{profile.season2026.lapsLed} Laps</strong></span>
                  <span>DNFs: <strong className="text-slate-300">{profile.season2026.dnfs}</strong></span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Team Radio */}
          {activeTab === 'radio' && profile.famousQuote && (
            <div className="space-y-4 animate-fadeIn">
              <div className={`p-5 rounded-2xl border ${
                isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 animate-pulse" />
                    <span>Pit-To-Car Voice Transmission</span>
                  </span>
                  {profile.famousQuote.year && (
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      Season {profile.famousQuote.year}
                    </span>
                  )}
                </div>

                <blockquote className="text-base sm:text-lg font-mono italic text-amber-200 border-l-2 border-amber-500 pl-4 py-1 leading-relaxed">
                  {profile.famousQuote.text}
                </blockquote>

                <div className="mt-3 text-xs font-mono text-slate-400 flex items-center justify-between flex-wrap gap-2">
                  <span>Context: <span className="text-slate-200">{profile.famousQuote.context}</span></span>

                  {/* Play Audio Button */}
                  <button
                    onClick={handlePlayQuote}
                    disabled={isPlayingAudio}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 border transition shadow-sm ${
                      isPlayingAudio
                        ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse'
                        : 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>{isPlayingAudio ? 'TRANSMITTING COMMS...' : 'PLAY AUDIO TRANSMISSION'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className={`p-4 border-t flex flex-wrap items-center justify-between gap-3 shrink-0 ${
          isDarkMode ? 'border-slate-800 bg-slate-950/90' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="text-xs font-mono text-slate-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>OpenF1 Real-Time Verified Database</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Compare Driver Button */}
            {onOpenCompare && (
              <button
                onClick={() => {
                  onOpenCompare(profile.id);
                  onClose();
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-red-600/20 border border-red-500/40 text-red-300 hover:bg-red-600/30 hover:text-white transition flex items-center gap-1.5 shadow-sm"
                title="Compare this driver against any 2026 rival"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-red-400" />
                <span>Compare vs Rival</span>
              </button>
            )}

            {/* Optional Telemetry Launch Button */}
            {onSelectDriverForTelemetry && (
              <button
                onClick={() => {
                  onSelectDriverForTelemetry(profile.id);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60 hover:text-white transition flex items-center gap-1.5 shadow-sm"
              >
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Open Live Telemetry</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition"
            >
              Close (Esc)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDetailModal;
