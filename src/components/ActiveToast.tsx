import React, { useEffect } from 'react';
import { NotificationItem } from '../types';
import { Trophy, Clock, AlertTriangle, Star, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ActiveToastProps {
  notification: NotificationItem | null;
  onDismiss: () => void;
}

export const ActiveToast: React.FC<ActiveToastProps> = ({ notification, onDismiss }) => {
  useEffect(() => {
    if (!notification) return;

    // Trigger celebratory confetti on podium result notifications!
    if (notification.type === 'PODIUM_RESULT') {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.2 },
          colors: ['#E8002D', '#FF8000', '#FCD34D', '#FFFFFF'],
        });
      } catch {
        // Fallback
      }
    }

    const timer = setTimeout(() => {
      onDismiss();
    }, 6000);

    return () => clearTimeout(timer);
  }, [notification]);

  if (!notification) return null;

  return (
    <div className="fixed top-16 right-4 z-50 max-w-md w-full animate-in slide-in-from-top duration-300">
      <div className="p-4 rounded-xl border border-red-500/60 bg-slate-950 text-slate-100 shadow-2xl backdrop-blur-md flex items-start gap-3">
        <div className="p-2 rounded-lg bg-red-600 text-white shrink-0 mt-0.5 shadow-md">
          {notification.type === 'PODIUM_RESULT' ? (
            <Trophy className="w-5 h-5" />
          ) : notification.type === 'SESSION_START' ? (
            <Clock className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
        </div>

        <div className="flex-1 pr-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-red-600/30 text-red-400 font-bold uppercase">
              PUSH ALERT
            </span>
            <span className="text-[10px] font-mono text-slate-400">Just now</span>
          </div>
          <h4 className="text-sm font-racing font-bold text-slate-100 mt-1 uppercase tracking-wide">
            {notification.title}
          </h4>
          <p className="text-xs font-sans text-slate-300 mt-0.5 leading-snug">
            {notification.message}
          </p>
        </div>

        <button
          onClick={onDismiss}
          className="text-slate-500 hover:text-slate-200 p-1 rounded-md"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
