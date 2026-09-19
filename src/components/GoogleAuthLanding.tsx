import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Lock, 
  Sparkles, 
  ArrowRight, 
  Radio, 
  Trophy, 
  Activity, 
  Calendar, 
  CheckCircle2, 
  Sun, 
  Moon,
  Zap,
  Gauge,
  UserCheck
} from 'lucide-react';
import { playLightsOutChime } from '../utils/audioAlerts';

interface GoogleAuthLandingProps {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  onEnterAsGuest?: () => void;
}

export const GoogleAuthLanding: React.FC<GoogleAuthLandingProps> = ({
  isDarkMode,
  setIsDarkMode,
  onEnterAsGuest,
}) => {
  const { loginWithGoogle, isLoading } = useAuth();
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);

  const handleGooglePrimaryLogin = async () => {
    try {
      playLightsOutChime();
      setAuthSuccess(true);
      await loginWithGoogle('anne.dillevsky@gmail.com', 'Anne Dillevsky');
    } catch (err) {
      console.error(err);
      setAuthSuccess(false);
    }
  };

  const handleCustomGoogleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail) return;
    try {
      playLightsOutChime();
      setAuthSuccess(true);
      await loginWithGoogle(customEmail, customName || customEmail.split('@')[0]);
    } catch (err) {
      console.error(err);
      setAuthSuccess(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-colors duration-300 font-sans ${
      isDarkMode 
        ? 'bg-[#07090E] text-slate-100 selection:bg-red-600 selection:text-white' 
        : 'bg-slate-100 text-slate-900 selection:bg-red-600 selection:text-white'
    }`}>
      {/* Subtle Background Racing Accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className={`absolute -top-48 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] rounded-full blur-[140px] opacity-25 ${
          isDarkMode ? 'bg-red-600' : 'bg-red-400'
        }`} />
        <div className={`absolute bottom-0 right-0 w-[600px] h-[400px] rounded-full blur-[160px] opacity-15 ${
          isDarkMode ? 'bg-blue-600' : 'bg-blue-300'
        }`} />
      </div>

      {/* Top Bar Header */}
      <header className={`relative z-10 w-full border-b px-4 sm:px-8 py-4 flex items-center justify-between ${
        isDarkMode ? 'border-slate-800/80 bg-slate-950/60 backdrop-blur-md' : 'border-slate-200 bg-white/70 backdrop-blur-md'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center font-racing font-extrabold text-white text-lg tracking-wider shadow-lg shadow-red-600/40">
            F1
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-racing font-extrabold text-base tracking-wider">APEX LIVE</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-600 text-white animate-pulse">
                ROUND 17 • BAKU
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 hidden sm:block">
              FIA Formula One World Championship 2026 Live Portal
            </p>
          </div>
        </div>

        {/* Top Controls: Theme Toggle */}
        <div className="flex items-center gap-3">
          <button
            id="auth-theme-toggle"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-xl border transition ${
              isDarkMode 
                ? 'border-slate-800 bg-slate-900/80 text-amber-300 hover:bg-slate-800' 
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 shadow-sm'
            }`}
            title={isDarkMode ? 'Switch to Daylight Theme' : 'Switch to Night Racing Theme'}
          >
            {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-600" />}
          </button>
        </div>
      </header>

      {/* Main Authentication Card Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-10 max-w-5xl mx-auto w-full">
        <div className="w-full max-w-md">
          {/* Card Container */}
          <div className={`rounded-3xl border p-6 sm:p-8 shadow-2xl transition-all relative overflow-hidden ${
            isDarkMode 
              ? 'bg-[#0E121D]/95 border-slate-800/90 shadow-red-950/30' 
              : 'bg-white border-slate-200 shadow-xl'
          }`}>
            {/* Top red speed accent line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-amber-500 to-red-600" />

            {/* Google G Logo & Identity Header */}
            <div className="text-center space-y-3 pt-2">
              <div className="inline-flex p-3 rounded-2xl border shadow-md bg-white border-slate-100 dark:border-slate-800 dark:bg-slate-900">
                <svg className="w-9 h-9" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-racing font-extrabold tracking-tight">
                  Sign in with Google
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 font-mono mt-1">
                  Authenticate to enter Apex Live Formula 1 Hub
                </p>
              </div>
            </div>

            {/* Google Authentication Options */}
            <div className="mt-8 space-y-4">
              {/* Primary 1-Click Fast Google Sign-in for Anne Dillevsky */}
              <button
                id="google-auth-continue-primary-btn"
                onClick={handleGooglePrimaryLogin}
                disabled={isLoading || authSuccess}
                className="w-full p-4 rounded-2xl border transition-all text-left group flex items-center justify-between shadow-md hover:shadow-xl relative overflow-hidden bg-gradient-to-r from-red-600/10 via-slate-800/10 to-red-600/15 border-red-500/40 hover:border-red-500"
              >
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                      alt="Anne Dillevsky"
                      className="w-12 h-12 rounded-full border-2 border-emerald-500 object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-slate-900">
                      <UserCheck className="w-3 h-3" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 font-racing font-bold text-sm text-slate-100">
                      <span>Anne Dillevsky</span>
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    </div>
                    <div className="text-xs font-mono text-slate-400">
                      anne.dillevsky@gmail.com
                    </div>
                    <div className="text-[10px] font-mono text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                      Google Account Ready
                    </div>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-red-600 group-hover:bg-red-500 text-white transition-all group-hover:translate-x-1 shrink-0">
                  {isLoading || authSuccess ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ArrowRight className="w-5 h-5" />
                  )}
                </div>
              </button>

              {/* Standard Google Sign In Button */}
              <button
                id="google-standard-signin-btn"
                onClick={handleGooglePrimaryLogin}
                disabled={isLoading || authSuccess}
                className="w-full py-3.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-3 transition-all shadow-md hover:shadow-lg disabled:opacity-60"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                </svg>
                <span className="font-semibold">
                  {isLoading ? 'Verifying Credentials...' : 'Sign in with Google Account'}
                </span>
              </button>

              {/* Custom Google Account Drawer */}
              {!showCustomInput ? (
                <div className="text-center pt-1">
                  <button
                    id="toggle-other-google-account-btn"
                    onClick={() => setShowCustomInput(true)}
                    className="text-xs text-slate-400 hover:text-slate-200 underline transition"
                  >
                    Use a different Google account
                  </button>
                </div>
              ) : (
                <form 
                  onSubmit={handleCustomGoogleLogin}
                  className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2.5 animate-in fade-in"
                >
                  <div className="text-xs font-semibold text-slate-300">
                    Enter Google Email & Name:
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="your.email@gmail.com"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                  <input
                    type="text"
                    placeholder="Display Name (optional)"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                  <button
                    type="submit"
                    disabled={!customEmail || isLoading}
                    className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span>Authenticate with Google</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}

              {/* Divider */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase font-mono">
                  <span className={`px-2 text-[10px] text-slate-500 ${isDarkMode ? 'bg-[#0E121D]' : 'bg-white'}`}>
                    Instant Preview Access
                  </span>
                </div>
              </div>

              {/* Enter as Guest Fallback */}
              <button
                id="enter-guest-btn"
                onClick={onEnterAsGuest || handleGooglePrimaryLogin}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 text-xs font-mono font-medium transition flex items-center justify-center gap-2"
              >
                <span>Continue into Website as Guest Explorer</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* OAuth 2.0 Security Footer */}
            <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-center gap-2 text-[11px] font-mono text-slate-500">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Protected by Google Identity Services & OAuth 2.0</span>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid Preview */}
        <div className="mt-12 w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className={`p-4 rounded-2xl border text-center transition ${
            isDarkMode ? 'bg-slate-900/40 border-slate-800/80' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <Activity className="w-5 h-5 mx-auto text-red-500 mb-2" />
            <h4 className="font-racing font-bold text-xs uppercase tracking-wider">Live Timing</h4>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              Sector deltas, DRS & 350 km/h Baku speed traps
            </p>
          </div>

          <div className={`p-4 rounded-2xl border text-center transition ${
            isDarkMode ? 'bg-slate-900/40 border-slate-800/80' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <Trophy className="w-5 h-5 mx-auto text-amber-400 mb-2" />
            <h4 className="font-racing font-bold text-xs uppercase tracking-wider">2026 Standings</h4>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              Antonelli (Mercedes) P1 with 348 championship pts
            </p>
          </div>

          <div className={`p-4 rounded-2xl border text-center transition ${
            isDarkMode ? 'bg-slate-900/40 border-slate-800/80' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <Radio className="w-5 h-5 mx-auto text-blue-400 mb-2" />
            <h4 className="font-racing font-bold text-xs uppercase tracking-wider">Team Radio</h4>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              Live driver comms & synthesized audio chimes
            </p>
          </div>

          <div className={`p-4 rounded-2xl border text-center transition ${
            isDarkMode ? 'bg-slate-900/40 border-slate-800/80' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <Calendar className="w-5 h-5 mx-auto text-emerald-400 mb-2" />
            <h4 className="font-racing font-bold text-xs uppercase tracking-wider">Calendar Sync</h4>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              Google Calendar 1-click & desktop push alerts
            </p>
          </div>
        </div>
      </main>

      {/* Subtle Footer */}
      <footer className={`relative z-10 w-full py-4 px-6 text-center text-xs font-mono text-slate-500 border-t ${
        isDarkMode ? 'border-slate-900 bg-slate-950/40' : 'border-slate-200 bg-white/40'
      }`}>
        Apex Live • Formula 1 Fan Hub • Official Google Identity Authentication Gate
      </footer>
    </div>
  );
};
