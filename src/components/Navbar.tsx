import React, { useState } from 'react';
import { 
  Radio, 
  Flag, 
  Moon, 
  Sun, 
  Bell, 
  BellRing,
  BellOff,
  Activity, 
  Map, 
  LineChart, 
  Trophy, 
  Calendar, 
  Star, 
  BookOpen, 
  Volume2, 
  VolumeX,
  ShieldAlert,
  ChevronDown,
  Car,
  LogIn,
  LogOut,
  UserCheck,
  Timer,
  Home,
  Users
} from 'lucide-react';
import { FlagStatus, NotificationItem } from '../types';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  flagStatus: FlagStatus;
  setFlagStatus: (status: FlagStatus) => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  notifications: NotificationItem[];
  unreadCount: number;
  onOpenNotifications: () => void;
  favoriteDriversCount: number;
  onOpenAuthModal: () => void;
  pushNotificationsEnabled?: boolean;
  onTogglePushNotifications?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isDarkMode,
  setIsDarkMode,
  flagStatus,
  setFlagStatus,
  soundEnabled,
  setSoundEnabled,
  unreadCount,
  onOpenNotifications,
  favoriteDriversCount,
  onOpenAuthModal,
  pushNotificationsEnabled = false,
  onTogglePushNotifications,
}) => {
  const [showFlagMenu, setShowFlagMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();


  const flagBadge = {
    GREEN: { text: 'TRACK CLEAR // GREEN', bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    YELLOW: { text: 'SECTOR YELLOW', bg: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    DOUBLE_YELLOW: { text: 'DOUBLE YELLOW', bg: 'bg-amber-500/30 text-amber-300 border-amber-500/40' },
    RED: { text: 'SESSION SUSPENDED // RED', bg: 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse' },
    SAFETY_CAR: { text: 'SAFETY CAR DEPLOYED (SC)', bg: 'bg-amber-500 text-slate-950 font-bold border-amber-400' },
    VSC: { text: 'VIRTUAL SAFETY CAR (VSC)', bg: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  }[flagStatus];

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'championship', label: 'Championship', icon: Trophy },
    { id: 'drivers', label: 'Drivers Grid', icon: Users },
    { id: 'teams', label: 'Teams/Cars', icon: Car },
    { id: 'schedule', label: 'Schedule & Live', icon: Calendar },
    { id: 'radio', label: 'Team Radio', icon: Radio },
  ];

  return (
    <header className={`sticky top-0 z-40 border-b transition-colors duration-200 ${
      isDarkMode ? 'bg-[#0B0F17]/95 border-slate-800 backdrop-blur-md' : 'bg-white/95 border-slate-200 backdrop-blur-md'
    }`}>
      {/* Top Motorsport Status Bar */}
      <div className={`px-4 py-1.5 border-b text-xs flex items-center justify-between font-tech ${
        isDarkMode ? 'bg-slate-950/80 border-slate-800/80 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
      }`}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold tracking-wider text-red-500 uppercase">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping inline-block" />
            LIVE FEED
          </div>
          <span className="text-slate-500">|</span>
          <span className="font-semibold text-slate-200">ROUND 17 // AZERBAIJAN GP (BAKU CITY CIRCUIT)</span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline font-mono text-amber-400 font-bold">QUALIFYING LIVE TODAY</span>
          <span className="hidden md:inline text-slate-500">|</span>
          <span className="hidden md:inline text-slate-400">TRACK TEMP: 41.2°C • AIR: 27.5°C • WIND: 14 KM/H</span>
        </div>

        {/* Flag Control Dropdown */}
        <div className="relative flex items-center gap-2">
          <button
            id="race-control-flag-btn"
            onClick={() => setShowFlagMenu(!showFlagMenu)}
            className={`px-2.5 py-0.5 rounded text-[11px] font-bold border flex items-center gap-1.5 uppercase transition ${flagBadge.bg}`}
          >
            <Flag className="w-3 h-3" />
            <span>{flagBadge.text}</span>
            <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
          </button>

          {showFlagMenu && (
            <div className={`absolute right-0 top-full mt-1.5 w-56 rounded-md shadow-2xl border p-1 z-50 text-xs ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
            }`}>
              <div className="px-2 py-1 text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                Simulate Race Control Flag:
              </div>
              {(['GREEN', 'YELLOW', 'VSC', 'SAFETY_CAR', 'RED'] as FlagStatus[]).map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setFlagStatus(st);
                    setShowFlagMenu(false);
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded flex items-center gap-2 hover:bg-slate-800/40 transition text-[11px] font-mono ${
                    flagStatus === st ? 'font-bold text-red-500' : ''
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${
                    st === 'GREEN' ? 'bg-emerald-500' :
                    st === 'RED' ? 'bg-red-500' : 'bg-amber-400'
                  }`} />
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Brand & Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14 sm:h-16">
        <div className="flex items-center gap-4 sm:gap-6">
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center font-racing font-black text-xl text-white shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform">
              F1
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-racing font-extrabold text-lg sm:text-xl tracking-wider text-white">
                  APEX<span className="text-red-500"> LIVE</span>
                </span>
                <span className="neon-tag-glass px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider text-cyan-300 hidden sm:inline-block">
                  APEX TELEMETRY &amp; RACE HUB
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-tight hidden sm:block">F1 FAN HUB // 2026 WORLD CHAMPIONSHIP</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-motorsport uppercase tracking-wider flex items-center gap-2 transition-all relative ${
                    isActive
                      ? isDarkMode
                        ? 'bg-red-600 text-white font-bold shadow-[0_0_15px_rgba(239,68,68,0.4)] border border-red-500'
                        : 'bg-red-600 text-white font-bold shadow-md'
                      : isDarkMode
                      ? 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Utility Controls & Authentication */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Google Auth Status / Sign In Button */}
          {user ? (
            <div className="relative">
              <button
                id="user-profile-menu-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-xl border text-xs transition ${
                  isDarkMode 
                    ? 'border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200' 
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
                }`}
              >
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-6 h-6 rounded-full border border-emerald-500 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-[10px]">
                    {user.name.charAt(0)}
                  </div>
                )}
                <span className="hidden sm:inline font-medium max-w-[90px] truncate text-[11px]">
                  {user.name.split(' ')[0]}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 shadow-sm" title="Google Authenticated" />
              </button>

              {showUserMenu && (
                <div className={`absolute right-0 top-full mt-2 w-64 rounded-xl shadow-2xl border p-3 z-50 text-xs ${
                  isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                }`}>
                  <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800/60">
                    {user.picture && (
                      <img src={user.picture} alt={user.name} className="w-9 h-9 rounded-full" referrerPolicy="no-referrer" />
                    )}
                    <div className="overflow-hidden">
                      <div className="font-bold font-racing text-sm truncate flex items-center gap-1.5">
                        {user.name}
                        <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                    </div>
                  </div>

                  <div className="py-2.5 space-y-1 text-[11px] font-mono text-slate-400 border-b border-slate-800/60">
                    <div className="flex justify-between">
                      <span>Auth Provider:</span>
                      <span className="text-emerald-400 font-semibold">Google Account</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Telemetry Sync:</span>
                      <span className="text-slate-300">Active (Real-time)</span>
                    </div>
                  </div>

                  <button
                    id="sign-out-btn"
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full mt-2.5 py-1.5 px-3 rounded-lg bg-red-600/15 hover:bg-red-600 text-red-400 hover:text-white transition flex items-center justify-center gap-2 font-medium text-xs"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              id="google-signin-nav-btn"
              onClick={onOpenAuthModal}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-700 hover:border-red-500 bg-slate-900/90 hover:bg-slate-800 text-white font-medium text-xs shadow-lg hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all group"
              title="Sign in with Google Account"
            >
              <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span className="hidden sm:inline font-mono tracking-wide">Sign in with Google</span>
              <span className="sm:hidden font-mono">Sign In</span>
            </button>
          )}

          {/* Sound Synthesizer Chime Toggle */}
          <button
            id="sound-toggle-btn"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Radio sound chimes enabled' : 'Mute sound chimes'}
            className={`p-2 rounded-lg border transition ${
              isDarkMode 
                ? 'border-slate-800 text-slate-300 hover:bg-slate-800/70 hover:text-white' 
                : 'border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 opacity-50" />}
          </button>

          {/* Browser Push Notifications Quick Toggle in Top Bar */}
          {onTogglePushNotifications && (
            <button
              id="topbar-push-notifications-toggle"
              onClick={onTogglePushNotifications}
              title={pushNotificationsEnabled ? 'Browser Push Notifications Active (Click to mute)' : 'Enable Browser Push Notifications for Baku & 2026 Races'}
              className={`p-2 rounded-lg border transition flex items-center gap-1.5 ${
                pushNotificationsEnabled
                  ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400 shadow-sm shadow-emerald-500/20'
                  : isDarkMode
                  ? 'border-slate-800 text-slate-400 hover:bg-slate-800/70 hover:text-white'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {pushNotificationsEnabled ? (
                <BellRing className="w-4 h-4 text-emerald-400 animate-pulse" />
              ) : (
                <BellOff className="w-4 h-4 opacity-60" />
              )}
              <span className="hidden md:inline text-[11px] font-mono font-semibold">
                {pushNotificationsEnabled ? 'Push ON' : 'Push OFF'}
              </span>
            </button>
          )}

          {/* Push Notifications Hub Button */}
          <button
            id="notifications-hub-btn"
            onClick={onOpenNotifications}
            className={`relative p-2 rounded-lg border transition ${
              isDarkMode 
                ? 'border-slate-800 text-slate-300 hover:bg-slate-800/70 hover:text-white' 
                : 'border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
            title="Session alerts & push notification center"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-bold font-mono flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Dark Mode / Night Racing Mode Toggle */}
          <button
            id="theme-toggle-btn"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition ${
              isDarkMode 
                ? 'border-slate-800 bg-slate-900/80 text-amber-300 hover:bg-slate-800' 
                : 'border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200'
            }`}
            title={isDarkMode ? 'Switch to Paddock Daylight Mode' : 'Switch to Night Racing AMOLED Mode'}
          >
            {isDarkMode ? (
              <>
                <Moon className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="hidden md:inline font-mono text-[11px]">NIGHT RACING</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden md:inline font-mono text-[11px]">DAYLIGHT</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Horizontal Sub-Navigation */}
      <div className="md:hidden border-t overflow-x-auto no-scrollbar py-2 px-3 flex items-center justify-around gap-1 bg-slate-950/60">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition shrink-0 ${
                isActive
                  ? 'bg-red-600 text-white font-semibold shadow-sm'
                  : isDarkMode
                  ? 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};

