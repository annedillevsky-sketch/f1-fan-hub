import React, { useState } from 'react';
import { Calendar, Activity, Map, LineChart, Timer, Radio } from 'lucide-react';
import { RaceCalendar } from './RaceCalendar';
import { LiveTiming } from './LiveTiming';
import { CircuitMap } from './CircuitMap';
import { TelemetryAnalysis } from './TelemetryAnalysis';
import { TeamRadioArchive } from './TeamRadioArchive';
import { Driver, FlagStatus, NotificationItem, RaceEvent, RadioMessage } from '../types';

interface ScheduleAndLiveProps {
  drivers: Driver[];
  setDrivers: React.Dispatch<React.SetStateAction<Driver[]>>;
  flagStatus: FlagStatus;
  isDarkMode: boolean;
  soundEnabled: boolean;
  favoriteDriverIds: string[];
  onToggleFavorite: (id: string) => void;
  onSelectDriverForTelemetry: (id: string) => void;
  radioMessages: RadioMessage[];
  onDispatchNotification: (notification: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void;
  subscribedEvents: string[];
  onToggleEventSubscription: (eventId: string) => void;
  pushNotificationsEnabled?: boolean;
  onTogglePushNotifications?: () => void;
  races?: RaceEvent[];
  loading?: boolean;
}

export const ScheduleAndLive: React.FC<ScheduleAndLiveProps> = ({
  drivers,
  setDrivers,
  flagStatus,
  isDarkMode,
  soundEnabled,
  favoriteDriverIds,
  onToggleFavorite,
  onSelectDriverForTelemetry,
  radioMessages,
  onDispatchNotification,
  subscribedEvents,
  onToggleEventSubscription,
  pushNotificationsEnabled,
  onTogglePushNotifications,
  races,
  loading = false,
}) => {
  const [subView, setSubView] = useState<'schedule' | 'timing' | 'circuit' | 'telemetry' | 'radio'>('schedule');

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Controls for Schedule & Live */}
      <div className={`p-3 sm:p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
        isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping inline-block" />
          <span className="font-motorsport italic font-black text-lg sm:text-xl text-white uppercase tracking-wider">
            SCHEDULE &amp; LIVE SESSIONS
          </span>
        </div>

        {/* Clean Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl border border-slate-800 bg-slate-900 text-xs font-mono">
          <button
            id="subview-schedule"
            onClick={() => setSubView('schedule')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
              subView === 'schedule'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Race Calendar &amp; Sync</span>
          </button>

          <button
            id="subview-timing"
            onClick={() => setSubView('timing')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
              subView === 'timing'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Live Lap Timing</span>
          </button>

          <button
            id="subview-circuit"
            onClick={() => setSubView('circuit')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
              subView === 'circuit'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Circuit Map</span>
          </button>

          <button
            id="subview-telemetry"
            onClick={() => setSubView('telemetry')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
              subView === 'telemetry'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            <span>Telemetry</span>
          </button>

          <button
            id="subview-radio"
            onClick={() => setSubView('radio')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
              subView === 'radio'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-amber-400" />
            <span>Radio Archive</span>
          </button>
        </div>
      </div>

      {/* Render Selected View */}
      {subView === 'schedule' && (
        <RaceCalendar
          isDarkMode={isDarkMode}
          onDispatchNotification={onDispatchNotification}
          subscribedEvents={subscribedEvents}
          onToggleEventSubscription={onToggleEventSubscription}
          pushNotificationsEnabled={pushNotificationsEnabled}
          onTogglePushNotifications={onTogglePushNotifications}
          races={races}
          loading={loading}
        />
      )}

      {subView === 'timing' && (
        <LiveTiming
          drivers={drivers}
          setDrivers={setDrivers}
          flagStatus={flagStatus}
          isDarkMode={isDarkMode}
          soundEnabled={soundEnabled}
          favoriteDriverIds={favoriteDriverIds}
          onToggleFavorite={onToggleFavorite}
          onSelectDriverForTelemetry={onSelectDriverForTelemetry}
          radioMessages={radioMessages}
        />
      )}

      {subView === 'circuit' && (
        <CircuitMap
          drivers={drivers}
          isDarkMode={isDarkMode}
        />
      )}

      {subView === 'telemetry' && (
        <TelemetryAnalysis
          drivers={drivers}
          isDarkMode={isDarkMode}
        />
      )}

      {subView === 'radio' && (
        <TeamRadioArchive
          radioMessages={radioMessages}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};
