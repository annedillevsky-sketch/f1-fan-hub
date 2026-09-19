import React, { useState, useEffect } from 'react';
import { NotificationItem } from '../types';
import { 
  Bell, 
  BellRing, 
  CheckCheck, 
  Trash2, 
  X, 
  Flag, 
  Trophy, 
  AlertTriangle, 
  Star, 
  Clock, 
  ExternalLink 
} from 'lucide-react';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onDismissNotification: (id: string) => void;
  isDarkMode: boolean;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onClearAll,
  onDismissNotification,
  isDarkMode,
}) => {
  const [browserPermission, setBrowserPermission] = useState<string>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserPermission(Notification.permission);
    }
  }, []);

  const requestBrowserPush = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setBrowserPermission(perm);
      } catch {
        // Iframe restriction fallback
      }
    }
  };

  if (!isOpen) return null;

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'SESSION_START':
        return <Clock className="w-4 h-4 text-red-400" />;
      case 'PODIUM_RESULT':
        return <Trophy className="w-4 h-4 text-amber-400" />;
      case 'SAFETY_CAR':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'FAVORITE_ALERT':
        return <Star className="w-4 h-4 text-emerald-400" />;
      default:
        return <Flag className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
      <div 
        className={`w-full max-w-md h-full border-l flex flex-col shadow-2xl transition-all ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500">
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-racing font-bold uppercase tracking-wide">
                Push Alert Dispatch Center
              </h3>
              <p className="text-[11px] font-mono text-slate-400">
                Session starts & podium triggers
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* System Notification Permission Bar */}
        <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 text-xs font-mono">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">BROWSER PUSH:</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              browserPermission === 'granted' 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : 'bg-amber-500/20 text-amber-400'
            }`}>
              {browserPermission.toUpperCase()}
            </span>
          </div>

          {browserPermission !== 'granted' && (
            <button
              onClick={requestBrowserPush}
              className="w-full mt-2 py-1.5 rounded bg-red-600/20 text-red-400 border border-red-500/30 font-bold hover:bg-red-600 hover:text-white transition text-[11px]"
            >
              Request Desktop System Push Notifications
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div className="px-4 py-2 border-b border-slate-800/80 flex items-center justify-between text-xs font-mono">
          <button
            onClick={onMarkAllAsRead}
            className="text-slate-400 hover:text-white flex items-center gap-1 transition"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark read</span>
          </button>
          <button
            onClick={onClearAll}
            className="text-slate-400 hover:text-red-400 flex items-center gap-1 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear all</span>
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="py-16 text-center text-slate-500 font-mono text-xs">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
              No notifications yet. Scheduled race start alerts will appear here.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3.5 rounded-xl border relative transition ${
                  n.read 
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-80' 
                    : 'bg-slate-950 border-red-500/40 shadow-md'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                    {getNotificationIcon(n.type)}
                  </div>

                  <div className="flex-1 pr-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-racing font-bold text-slate-100 uppercase tracking-wide">
                        {n.title}
                      </h4>
                    </div>
                    <p className="text-xs font-sans text-slate-300 mt-1 leading-snug">
                      {n.message}
                    </p>
                    <div className="text-[10px] font-mono text-slate-500 mt-2">
                      {n.timestamp}
                    </div>
                  </div>

                  <button
                    onClick={() => onDismissNotification(n.id)}
                    className="text-slate-500 hover:text-slate-300 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
