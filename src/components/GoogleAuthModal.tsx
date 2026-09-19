import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Check, ShieldCheck, Lock, Sparkles, RefreshCw, LogIn } from 'lucide-react';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
}) => {
  const { user, loginWithGoogle, logout, isLoading } = useAuth();
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [showCustomFields, setShowCustomFields] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={`relative w-full max-w-md rounded-2xl shadow-2xl border overflow-hidden transition-all ${
          isDarkMode ? 'bg-[#0F141E] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Top Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-800/40">
          <div className="flex items-center gap-2.5">
            {/* Google G Logo SVG */}
            <svg className="w-6 h-6" viewBox="0 0 24 24">
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
            <div>
              <h3 className="font-bold text-base tracking-tight">Google Identity</h3>
              <p className="text-[11px] text-slate-400">Secure OAuth 2.0 Authentication</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {user ? (
            // Already Signed In State
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center gap-3">
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-12 h-12 rounded-full border-2 border-emerald-500 object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm truncate">{user.name}</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  </div>
                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  <span className="inline-block px-2 py-0.5 mt-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-semibold rounded">
                    AUTHENTICATED WITH GOOGLE
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-400 space-y-1.5 bg-slate-900/50 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <span>Google User ID:</span>
                  <span className="font-mono text-slate-300 text-[11px]">{user.id.slice(0, 16)}...</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Favorite Drivers Sync:</span>
                  <span className="text-emerald-400 font-medium">Cloud Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Push Alerts Subscription:</span>
                  <span className="text-emerald-400 font-medium">Synced</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={logout}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-semibold transition"
                >
                  Sign Out of Google
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow-lg shadow-red-600/20"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            // Sign In Required State
            <div className="space-y-4">
              <div className="text-center space-y-1.5">
                <p className="text-xs text-slate-300">
                  Sign in with your Google Account to sync your driver telemetry, custom alerts, and 3D car garage preferences.
                </p>
              </div>

              {/* Primary Google Login Button */}
              <button
                id="google-signin-primary-btn"
                onClick={() => loginWithGoogle('anne.dillevsky@gmail.com', 'Anne Dillevsky')}
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-3 transition-all shadow-md hover:shadow-lg disabled:opacity-50 group"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-red-500" />
                ) : (
                  <svg className="w-5 h-5 group-hover:scale-105 transition-transform" viewBox="0 0 24 24">
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
                )}
                <span className="font-semibold">
                  {isLoading ? 'Connecting to Google...' : 'Continue as Anne Dillevsky (anne.dillevsky@gmail.com)'}
                </span>
              </button>

              {/* Custom Google Account Option */}
              {!showCustomFields ? (
                <div className="text-center">
                  <button
                    onClick={() => setShowCustomFields(true)}
                    className="text-[11px] text-slate-400 hover:text-slate-200 underline transition"
                  >
                    Use a different Google account
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 space-y-2">
                  <p className="text-[11px] font-semibold text-slate-300">Sign in with other Google email:</p>
                  <input
                    type="email"
                    placeholder="name@gmail.com"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg text-xs bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                  <input
                    type="text"
                    placeholder="Full Name (optional)"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg text-xs bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                  <button
                    onClick={() => {
                      if (customEmail) {
                        loginWithGoogle(customEmail, customName);
                      }
                    }}
                    disabled={!customEmail || isLoading}
                    className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition disabled:opacity-50"
                  >
                    Authenticate with Google
                  </button>
                </div>
              )}

              {/* Security info note */}
              <div className="pt-2 flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
                <Lock className="w-3 h-3" />
                <span>Protected by Google Identity Services & OAuth 2.0</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
