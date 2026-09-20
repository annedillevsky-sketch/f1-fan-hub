import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  CalendarPlus, 
  Download, 
  Bell, 
  BellRing, 
  BellOff, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Sparkles, 
  Send, 
  ChevronDown, 
  ChevronUp, 
  Trophy, 
  ExternalLink, 
  Zap, 
  AlertCircle, 
  Check,
  Radio,
  Timer,
  Info
} from 'lucide-react';
import { RACE_CALENDAR, CIRCUITS } from '../data/f1Data';
import { RaceEvent, NotificationItem, SessionType } from '../types';
import { playLightsOutChime, playAlertChime, playEngineRevSound } from '../utils/audioAlerts';
import { 
  generateGoogleCalendarUrl, 
  downloadIcsFile, 
  downloadMultiEventIcsFile,
  isNotificationSupported, 
  getNotificationPermission, 
  requestNotificationPermission, 
  triggerBrowserNotification,
  CalendarEventData
} from '../utils/notificationService';

interface RaceCalendarProps {
  isDarkMode: boolean;
  onDispatchNotification: (notification: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void;
  subscribedEvents: string[]; // event IDs subscribed to notifications
  onToggleEventSubscription: (eventId: string) => void;
  pushNotificationsEnabled?: boolean;
  onTogglePushNotifications?: (enabled?: boolean) => Promise<void> | void;
  races?: RaceEvent[];
  loading?: boolean;
}

export const RaceCalendar: React.FC<RaceCalendarProps> = ({
  isDarkMode,
  onDispatchNotification,
  subscribedEvents,
  onToggleEventSubscription,
  pushNotificationsEnabled = false,
  onTogglePushNotifications,
  races,
  loading = false,
}) => {
  // Default to Baku (Round 17) or current live event
  const [expandedEventId, setExpandedEventId] = useState<string | null>('rd-17');
  const [filterMode, setFilterMode] = useState<'all' | 'upcoming' | 'sprint'>('all');
  const [calendarLayout, setCalendarLayout] = useState<'timeline' | 'grid'>('timeline');
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [copiedCalendarId, setCopiedCalendarId] = useState<string | null>(null);
  const [isTestCountdownActive, setIsTestCountdownActive] = useState(false);

  // Synchronize browser notification permission state
  useEffect(() => {
    setNotificationPermission(getNotificationPermission());
  }, []);

  const calendarEvents = (races && races.length > 0) ? races : RACE_CALENDAR;

  // Find next upcoming/live race for countdown - prioritize live/upcoming
  const nextEvent = calendarEvents.find(e => e.status === 'LIVE') || 
                    calendarEvents.find(e => e.status === 'UPCOMING') || 
                    calendarEvents.find(e => e.id === 'rd-17') || 
                    calendarEvents[0];

  // Live countdown state to Azerbaijan GP Main Race
  const [timeLeft, setTimeLeft] = useState({
    days: 1,
    hours: 5,
    minutes: 24,
    seconds: 45,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        
        // When countdown hits zero naturally
        handleCountdownHitsZero();
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter events
  const filteredEvents = calendarEvents.filter(e => {
    if (filterMode === 'upcoming') return e.status === 'UPCOMING' || e.status === 'LIVE';
    if (filterMode === 'sprint') return e.isSprint;
    return true;
  });

  // Helper to construct calendar event data for a specific session
  const buildSessionCalendarData = (
    event: RaceEvent, 
    session: RaceEvent['sessions'][0]
  ): CalendarEventData => {
    const sessionDate = new Date(session.dateTime);
    // 2 hours for main race, 1 hour for practice and qualifying sessions
    const durationHours = session.type === 'RACE' ? 2 : 1;
    const endDate = new Date(sessionDate.getTime() + durationHours * 60 * 60 * 1000);

    const title = `Formula 1 ${event.name} - ${session.name}`;
    const location = `${event.circuit}, ${event.country}`;
    const description = [
      `FIA Formula One World Championship 2026`,
      `Round ${event.round}: ${event.name}`,
      `Session: ${session.name} (${session.type})`,
      `Circuit: ${event.circuit}, ${event.country}`,
      `Start Time: ${sessionDate.toUTCString()}`,
      '',
      `Live timing, telemetry, active sector flags, and driver radio available on F1 Fan Hub Apex.Live.`,
    ].join('\n');

    return {
      title,
      description,
      location,
      startDate: sessionDate,
      endDate,
    };
  };

  // Helper to open Google Calendar in new tab
  const handleAddToGoogleCalendar = (
    event: RaceEvent, 
    session: RaceEvent['sessions'][0], 
    e?: React.MouseEvent
  ) => {
    if (e) e.stopPropagation();
    const calData = buildSessionCalendarData(event, session);
    const gcalUrl = generateGoogleCalendarUrl(calData);
    window.open(gcalUrl, '_blank', 'noopener,noreferrer');

    setCopiedCalendarId(`${event.id}-${session.name}`);
    setTimeout(() => setCopiedCalendarId(null), 2500);

    onDispatchNotification({
      type: 'SYSTEM_ALERT',
      title: 'Google Calendar Event Created',
      message: `Added ${event.name} (${session.name}) to Google Calendar with start time and Baku circuit details.`,
      eventId: event.id,
    });
  };

  // Helper to download single session .ics
  const handleDownloadSessionIcs = (
    event: RaceEvent, 
    session: RaceEvent['sessions'][0], 
    e?: React.MouseEvent
  ) => {
    if (e) e.stopPropagation();
    const calData = buildSessionCalendarData(event, session);
    downloadIcsFile(calData);

    onDispatchNotification({
      type: 'SYSTEM_ALERT',
      title: 'iCalendar File Downloaded',
      message: `Downloaded .ics reminder file for ${event.name} - ${session.name} with 15-minute sound alert.`,
      eventId: event.id,
    });
  };

  // Helper to download entire weekend sessions into a single multi-event .ics file
  const handleDownloadEntireWeekendIcs = (event: RaceEvent, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const allSessionsData = event.sessions.map(s => buildSessionCalendarData(event, s));
    downloadMultiEventIcsFile(`${event.name}_2026`, allSessionsData);

    onDispatchNotification({
      type: 'SYSTEM_ALERT',
      title: `Weekend Calendar Synced (${event.name})`,
      message: `All 5 sessions (Practice, Qualifying, Race) exported in a unified .ics calendar file.`,
      eventId: event.id,
    });
  };

  // Toggle push notifications and request permission
  const handleTogglePushNotificationsClick = async () => {
    if (onTogglePushNotifications) {
      await onTogglePushNotifications();
      setNotificationPermission(getNotificationPermission());
      return;
    }

    if (!isNotificationSupported()) {
      alert('Browser Web Notifications are not supported in your current browser environment.');
      return;
    }

    const currentPerm = getNotificationPermission();
    if (currentPerm !== 'granted') {
      const newPerm = await requestNotificationPermission();
      setNotificationPermission(newPerm);

      if (newPerm === 'granted') {
        playAlertChime();
        triggerBrowserNotification('🏎️ F1 Fan Hub: Push Notifications Enabled', {
          body: 'You will receive real-time alerts 10 minutes before lights-out and when countdowns hit zero!',
        });
        onDispatchNotification({
          type: 'SYSTEM_ALERT',
          title: 'Push Notifications Active',
          message: 'Browser push notifications successfully connected for Baku GP and all 2026 calendar sessions.',
        });
      }
    }
  };

  // Trigger simulated push notification: 10 minutes before lights-out
  const handleSimulateTenMinutesToLightsOut = () => {
    playAlertChime();
    
    // Trigger native browser notification
    triggerBrowserNotification('⚠️ 10 MINUTES TO LIGHTS OUT: Azerbaijan GP', {
      body: 'Pit lane entry is closing! Grid formation underway at Baku City Circuit. Track 41.2°C, Air 27.5°C. Kimi Antonelli starts P1!',
    });

    onDispatchNotification({
      type: 'SESSION_START',
      title: '10 MINUTES TO LIGHTS OUT: Azerbaijan Grand Prix (Baku)',
      message: 'Pit lane exit closes in 10 minutes. Formation lap commencing shortly. Grid: P1 Kimi Antonelli (MER), P2 Max Verstappen (RBR), P3 Lando Norris (MCL).',
      eventId: 'rd-17',
    });
  };

  // Trigger simulated push notification: countdown hits zero / lights out
  const handleCountdownHitsZero = () => {
    playLightsOutChime();
    playEngineRevSound();

    // Trigger native browser desktop notification
    triggerBrowserNotification('🟢 GREEN LIGHT: Azerbaijan Grand Prix - LIGHTS OUT!', {
      body: '5 Red Lights Extinguished! Round 17 of the 2026 World Championship is GO at Baku City Circuit! Kimi Antonelli leads into Turn 1!',
    });

    onDispatchNotification({
      type: 'SESSION_START',
      title: 'LIGHTS OUT & AWAY WE GO: Azerbaijan Grand Prix!',
      message: '5 red lights out at Baku City Circuit! Antonelli gets a flying launch defending against Verstappen into Turn 1. Race is underway!',
      eventId: 'rd-17',
    });
  };

  // Run a fast 5-second interactive test countdown to demonstrate zero-hit notification
  const handleStartFastTestCountdown = () => {
    if (isTestCountdownActive) return;
    setIsTestCountdownActive(true);
    setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 5 });

    let count = 5;
    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: count });
        playAlertChime();
      } else {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsTestCountdownActive(false);
        handleCountdownHitsZero();
      }
    }, 1000);
  };

  const handleTestPodiumPush = (event: RaceEvent) => {
    playAlertChime();
    triggerBrowserNotification(`🏁 CHECKERED FLAG: ${event.name}`, {
      body: `P1 Kimi Antonelli (Mercedes) • P2 Max Verstappen (Red Bull) • P3 Lando Norris (McLaren). Full telemetry live on Apex.Live!`,
    });

    onDispatchNotification({
      type: 'PODIUM_RESULT',
      title: `CHECKERED FLAG: ${event.name}`,
      message: `P1 Kimi Antonelli (MER) • P2 Max Verstappen (RBR) • P3 Lando Norris (MCL). Antonelli extends championship lead!`,
      eventId: event.id,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Countdown Banner to Next Scheduled Event (Baku GP) */}
      <div className={`p-6 rounded-2xl border relative overflow-hidden shadow-xl ${
        isDarkMode 
          ? 'bg-gradient-to-r from-slate-950 via-slate-900 to-red-950/50 border-red-900/40' 
          : 'bg-gradient-to-r from-red-50 via-white to-amber-50 border-red-200'
      }`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping inline-block" />
              <span className="text-xs font-mono font-bold text-red-500 uppercase tracking-widest">
                ROUND {nextEvent.round} • LIVE RACE COUNTDOWN
              </span>
              {nextEvent.status === 'LIVE' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-600 text-white animate-pulse">
                  ACTIVE RACE WEEKEND
                </span>
              )}
            </div>
            
            <h2 className="text-2xl sm:text-4xl font-racing font-extrabold text-slate-100 mt-1">
              {nextEvent.flagEmoji} {nextEvent.name}
            </h2>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-slate-400 mt-2">
              <span className="flex items-center gap-1.5 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-red-500" />
                {nextEvent.circuit}
              </span>
              <span>•</span>
              <span className="text-slate-300">{nextEvent.date}</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">Baku City Street Circuit (6.003 km)</span>
            </div>

            {/* Quick Baku Calendar Sync Actions */}
            <div className="flex flex-wrap items-center gap-2.5 mt-4">
              <button
                id="baku-add-google-cal-btn"
                onClick={() => handleAddToGoogleCalendar(nextEvent, nextEvent.sessions[4] || nextEvent.sessions[0])}
                className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold font-mono transition flex items-center gap-2 shadow-lg shadow-red-600/30"
                title="Add Baku Grand Prix Main Race to Google Calendar"
              >
                <CalendarPlus className="w-4 h-4" />
                <span>Add Baku GP to Google Calendar</span>
              </button>

              <button
                id="baku-download-ics-btn"
                onClick={() => handleDownloadEntireWeekendIcs(nextEvent)}
                className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold font-mono transition flex items-center gap-2 ${
                  isDarkMode 
                    ? 'border-slate-700 bg-slate-900/90 text-slate-200 hover:bg-slate-800' 
                    : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
                }`}
                title="Download .ics file containing all 5 Baku sessions"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Download Weekend .ics</span>
              </button>
            </div>
          </div>

          {/* Countdown Clock Digits & Test Simulation Controls */}
          <div className="flex flex-col items-center lg:items-end gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2 sm:gap-3 font-mono">
              {[
                { val: timeLeft.days, label: 'DAYS' },
                { val: timeLeft.hours, label: 'HOURS' },
                { val: timeLeft.minutes, label: 'MINS' },
                { val: timeLeft.seconds, label: 'SECS' },
              ].map((unit, i) => (
                <div key={i} className="text-center">
                  <div className={`w-14 sm:w-16 py-2 sm:py-2.5 rounded-xl border text-xl sm:text-2xl font-bold font-racing ${
                    isDarkMode 
                      ? 'bg-slate-950/90 border-slate-800 text-slate-100 shadow-inner' 
                      : 'bg-white border-slate-200 text-slate-900 shadow-sm'
                  } ${isTestCountdownActive ? 'border-red-500 animate-pulse' : ''}`}>
                    {String(unit.val).padStart(2, '0')}
                  </div>
                  <div className="text-[9px] text-slate-400 font-bold mt-1 tracking-widest">
                    {unit.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Interactive Countdown Push Simulation Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
              <button
                id="simulate-ten-min-push-btn"
                onClick={handleSimulateTenMinutesToLightsOut}
                className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold bg-amber-500/15 border border-amber-500/40 text-amber-400 hover:bg-amber-500 hover:text-black transition flex items-center gap-1.5 shadow-sm"
                title="Trigger simulated push alert for 10 minutes before lights-out"
              >
                <Timer className="w-3.5 h-3.5" />
                <span>Simulate 10m to Lights-Out</span>
              </button>

              <button
                id="simulate-zero-countdown-btn"
                onClick={handleCountdownHitsZero}
                className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500 hover:text-black transition flex items-center gap-1.5 shadow-sm"
                title="Trigger simulated push alert when countdown reaches zero"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Trigger Zero / Green Light Alert</span>
              </button>

              <button
                id="fast-countdown-test-btn"
                onClick={handleStartFastTestCountdown}
                disabled={isTestCountdownActive}
                className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold bg-red-600/20 border border-red-500/40 text-red-400 hover:bg-red-600 hover:text-white transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                title="Set timer to 5s and watch countdown hit zero to trigger alert"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>{isTestCountdownActive ? 'Counting Down...' : 'Fast 5s Test to 0'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Web Push Notifications & Google Calendar Sync Control Center */}
      <div className={`p-4 sm:p-5 rounded-2xl border ${
        isDarkMode 
          ? 'bg-slate-900/90 border-slate-800' 
          : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${
              pushNotificationsEnabled || notificationPermission === 'granted'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {pushNotificationsEnabled || notificationPermission === 'granted' ? (
                <BellRing className="w-6 h-6 animate-bounce" />
              ) : (
                <BellOff className="w-6 h-6" />
              )}
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-racing font-bold text-slate-100">
                  Interactive Web Push Notifications & Calendar Sync
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                  notificationPermission === 'granted'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : notificationPermission === 'denied'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {notificationPermission === 'granted' ? 'Browser Push Granted' : notificationPermission === 'denied' ? 'Permission Denied' : 'Prompt Pending'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Receive browser desktop alerts 10 minutes before lights-out, countdown completions, and sync all sessions to Google Calendar or iCal.
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center gap-3 self-end md:self-center">
            <span className="text-xs font-mono font-semibold text-slate-300">
              {pushNotificationsEnabled || notificationPermission === 'granted' ? 'Push Alerts ON' : 'Enable Push'}
            </span>
            <button
              id="enable-push-notifications-toggle"
              onClick={handleTogglePushNotificationsClick}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 border ${
                pushNotificationsEnabled || notificationPermission === 'granted'
                  ? 'bg-emerald-600 border-emerald-500'
                  : 'bg-slate-800 border-slate-700'
              }`}
              title="Toggle browser push notifications"
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                pushNotificationsEnabled || notificationPermission === 'granted' ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>

        {/* Warning if blocked */}
        {notificationPermission === 'denied' && (
          <div className="mt-3 p-2.5 rounded-xl bg-rose-950/30 border border-rose-800/50 flex items-center gap-2.5 text-xs font-mono text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>Desktop push notifications are blocked in your browser settings. You can still hear sound chimes and view in-app alerts.</span>
          </div>
        )}
      </div>

      {/* Calendar Filters & Information Bar: LIVE SCHEDULE */}
      <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 carbon-pattern shadow-xl ${
        isDarkMode ? 'border-slate-800' : 'bg-slate-900 border-slate-700 text-white'
      }`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-600/20 text-red-400 border border-red-500/30 uppercase tracking-widest">
              FIA F1 2026 CALENDAR
            </span>
            <span className="text-xs font-mono text-slate-400">OFFICIAL TIMING &amp; SESSIONS</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-motorsport italic font-black text-white uppercase flex items-center gap-2">
            <Calendar className="w-5 h-5 text-red-500" />
            LIVE SCHEDULE
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Every Practice, Qualifying, Sprint, and Main Race with one-click Google Calendar sync and desktop alerts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Layout Mode (Timeline vs Grid) */}
          <div className="flex items-center gap-1 p-1 rounded-xl border border-slate-800 bg-slate-950 text-xs font-mono">
            <button
              id="layout-timeline"
              onClick={() => setCalendarLayout('timeline')}
              className={`px-3 py-1.5 rounded-lg transition font-bold uppercase text-[11px] ${
                calendarLayout === 'timeline' ? 'bg-red-600 text-white shadow-md shadow-red-600/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              Timeline View
            </button>
            <button
              id="layout-grid"
              onClick={() => setCalendarLayout('grid')}
              className={`px-3 py-1.5 rounded-lg transition font-bold uppercase text-[11px] ${
                calendarLayout === 'grid' ? 'bg-red-600 text-white shadow-md shadow-red-600/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              Interactive Grid
            </button>
          </div>

          {/* Filter Mode */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl border border-slate-800 bg-slate-950 text-xs font-mono">
            <button
              id="filter-cal-all"
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 rounded-lg transition ${
                filterMode === 'all' ? 'bg-red-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All 10 Rounds
            </button>
            <button
              id="filter-cal-upcoming"
              onClick={() => setFilterMode('upcoming')}
              className={`px-3 py-1 rounded-lg transition ${
                filterMode === 'upcoming' ? 'bg-red-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Upcoming Only
            </button>
            <button
              id="filter-cal-sprint"
              onClick={() => setFilterMode('sprint')}
              className={`px-3 py-1 rounded-lg transition ${
                filterMode === 'sprint' ? 'bg-red-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sprint Races
            </button>
          </div>
        </div>
      </div>

      {/* Grand Prix Cards List (Timeline or Grid Layout) */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(idx => (
            <div key={idx} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse h-32 flex items-center justify-between">
              <div className="space-y-3">
                <div className="w-36 h-5 bg-slate-800 rounded" />
                <div className="w-56 h-8 bg-slate-800 rounded" />
              </div>
              <div className="w-24 h-10 bg-slate-800 rounded-xl" />
            </div>
          ))}
        </div>
      ) : (
        <div className={
          calendarLayout === 'grid'
            ? 'grid grid-cols-1 lg:grid-cols-2 gap-4'
            : 'space-y-4'
        }>
          {filteredEvents.map((event) => {
          const isSubscribed = subscribedEvents.includes(event.id);
          const isExpanded = expandedEventId === event.id;
          const circuit = CIRCUITS.find(c => c.id === event.circuitId) || CIRCUITS[0];

          return (
            <div 
              key={event.id}
              id={`gp-card-${event.id}`}
              className={`group relative rounded-2xl cyber-cut-card border transition-all overflow-hidden ${
                isDarkMode ? 'bg-[#0A0E17] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              } ${event.status === 'LIVE' ? 'ring-2 ring-red-600/60 shadow-xl shadow-red-950/30' : ''}`}
            >
              {/* Background Styling: Faint Circuit Track Outline Map in Background of Each Race Card */}
              <div className="absolute right-0 top-0 bottom-0 w-72 md:w-96 opacity-[0.06] group-hover:opacity-[0.14] transition-opacity duration-300 pointer-events-none flex items-center justify-center p-3 overflow-hidden">
                <svg 
                  viewBox={circuit?.viewBox || "0 0 600 480"} 
                  className="w-full h-full stroke-cyan-400 fill-none" 
                  strokeWidth="8"
                >
                  <path d={circuit?.svgPath} />
                </svg>
              </div>

              {/* Event Header Card */}
              <div 
                className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer relative z-10"
                onClick={() => setExpandedEventId(isExpanded ? null : event.id)}
              >
                <div className="flex items-start sm:items-center gap-4">
                  {/* Round Tag (e.g., "ROUND 01", "ROUND 17") */}
                  <div className={`px-3 py-2 rounded-xl flex flex-col items-center justify-center font-racing border shrink-0 ${
                    event.status === 'LIVE'
                      ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30'
                      : 'bg-slate-900 border-slate-800 text-slate-200'
                  }`}>
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      ROUND
                    </span>
                    <span className="text-lg font-bold leading-none mt-0.5">
                      {String(event.round).padStart(2, '0')}
                    </span>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xl">{event.flagEmoji}</span>
                      <h4 className="text-base sm:text-lg font-racing font-bold text-white">
                        {event.name}
                      </h4>

                      {/* Status Badges: UPCOMING, LIVE, COMPLETED */}
                      {event.status === 'LIVE' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-600 text-white animate-pulse flex items-center gap-1 shadow-md shadow-red-600/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                          LIVE NOW
                        </span>
                      )}
                      {event.status === 'UPCOMING' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                          UPCOMING
                        </span>
                      )}
                      {event.status === 'COMPLETED' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800/80 text-slate-400 border border-slate-700">
                          COMPLETED
                        </span>
                      )}

                      {/* Sprint Race Badge */}
                      {event.isSprint && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-400" />
                          SPRINT WEEKEND
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-400 font-mono mt-1 flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-red-500" />
                        <span>{event.circuit}</span>
                      </span>
                      <span>•</span>
                      <span>{event.date}</span>

                      {/* Session Countdown Timer Component */}
                      {event.status === 'LIVE' && (
                        <span className="px-2 py-0.5 rounded bg-red-950/60 border border-red-500/30 text-red-300 text-[10px] font-mono font-bold">
                          Q3 SESSION ACTIVE
                        </span>
                      )}
                      {event.status === 'UPCOMING' && (
                        <span className="px-2 py-0.5 rounded bg-slate-900/90 border border-slate-800 text-cyan-300 text-[10px] font-mono flex items-center gap-1">
                          <Timer className="w-2.5 h-2.5 text-cyan-400" />
                          <span>T-MINUS {timeLeft.days}D {timeLeft.hours}H {timeLeft.minutes}M</span>
                        </span>
                      )}
                    </div>

                    {/* Circuit Specs: Laps, Length, Turns */}
                    {circuit && (
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-400">
                        <span className="px-2 py-0.5 rounded bg-slate-950/70 border border-slate-800/80">
                          <strong className="text-white">{circuit.laps}</strong> Laps
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-950/70 border border-slate-800/80">
                          <strong className="text-white">{circuit.lengthKm}</strong> km Length
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-950/70 border border-slate-800/80">
                          <strong className="text-white">{circuit.turns}</strong> Turns
                        </span>
                        {circuit.lapRecord && (
                          <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-slate-950/70 border border-slate-800/80 text-amber-400">
                            Lap Record: {circuit.lapRecord.time} ({circuit.lapRecord.driver})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Notification Controls & Expand */}
                <div className="flex flex-wrap items-center gap-2 self-end md:self-center" onClick={e => e.stopPropagation()}>
                  {/* Quick Add Main Race to Google Calendar */}
                  <button
                    id={`add-gcal-btn-${event.id}`}
                    onClick={(e) => handleAddToGoogleCalendar(event, event.sessions[event.sessions.length - 1], e)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold border border-red-500/30 bg-red-600/15 hover:bg-red-600 text-red-300 hover:text-white transition flex items-center gap-1.5 shadow-sm"
                    title="Add Main Grand Prix Race to Google Calendar"
                  >
                    <CalendarPlus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Add to GCal</span>
                  </button>

                  {/* Download Weekend .ics */}
                  <button
                    id={`download-weekend-ics-${event.id}`}
                    onClick={(e) => handleDownloadEntireWeekendIcs(event, e)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-mono border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition flex items-center gap-1.5 shadow-sm"
                    title="Download .ics file containing all 5 sessions"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">Weekend .ics</span>
                  </button>

                  {/* Alert Subscription Toggle */}
                  <button
                    id={`toggle-alert-${event.id}`}
                    onClick={() => onToggleEventSubscription(event.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 border transition ${
                      isSubscribed
                        ? 'bg-red-600/20 text-red-400 border-red-500/40'
                        : 'text-slate-400 border-slate-800 hover:bg-slate-800/60'
                    }`}
                    title={isSubscribed ? 'Subscribed to session alerts' : 'Subscribe to session alerts'}
                  >
                    {isSubscribed ? <BellRing className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5 opacity-60" />}
                    <span>{isSubscribed ? 'Alerts ON' : 'Alerts OFF'}</span>
                  </button>

                  {/* Test Session Start Push */}
                  <button
                    onClick={() => {
                      playLightsOutChime();
                      triggerBrowserNotification(`🏎️ SESSION START: ${event.name}`, {
                        body: 'Green light at pit lane exit! Track temperature 38.4°C. Practice and qualifying underway!',
                      });
                      onDispatchNotification({
                        type: 'SESSION_START',
                        title: `GREEN LIGHT: ${event.name}`,
                        message: `Lights out in 15 minutes! Track temperature 38.4°C. Air temperature 24.1°C. Pit lane open.`,
                        eventId: event.id,
                      });
                    }}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-mono border border-slate-800 bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1"
                    title="Simulate 15-minute Session Start Push Notification"
                  >
                    <Send className="w-3 h-3 text-red-400" />
                    <span className="hidden xl:inline">Test Alert</span>
                  </button>

                  {/* Expand / Collapse Button */}
                  <button
                    onClick={() => setExpandedEventId(isExpanded ? null : event.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800/60 transition"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Collapsible Session Schedule Details with Add to Calendar for EACH Session */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-3 border-t border-slate-800/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-red-400" />
                      <span>Full Grand Prix Session Timetable & Calendar Sync</span>
                    </div>
                    
                    <span className="text-[11px] font-mono text-slate-400">
                      Times shown in your local timezone ({Intl.DateTimeFormat().resolvedOptions().timeZone})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {event.sessions.map((session, sIdx) => {
                      const sessionDate = new Date(session.dateTime);
                      const isCopied = copiedCalendarId === `${event.id}-${session.name}`;

                      return (
                        <div 
                          key={sIdx} 
                          id={`session-card-${event.id}-${session.type.toLowerCase()}-${sIdx}`}
                          className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                            session.completed 
                              ? 'bg-slate-950/50 border-slate-800/70' 
                              : event.status === 'LIVE' && sIdx === 3
                              ? 'bg-red-950/20 border-red-500/40 ring-1 ring-red-500/30'
                              : 'bg-slate-900/60 border-slate-800'
                          }`}
                        >
                          <div>
                            {/* Session Header */}
                            <div className="flex items-center justify-between text-[11px] font-mono">
                              <span className="font-bold text-slate-200">{session.name}</span>
                              {session.completed ? (
                                <span className="flex items-center gap-1 text-emerald-400 text-[10px]">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Done</span>
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-amber-400 text-[10px]">
                                  <Clock className="w-3 h-3" />
                                  <span>Upcoming</span>
                                </span>
                              )}
                            </div>

                            {/* Session Date & Local Time */}
                            <div className="mt-2 space-y-0.5 font-mono">
                              <div className="text-xs font-bold text-slate-100">
                                {sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {sessionDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                              </div>
                            </div>

                            {/* Podium for completed races */}
                            {session.podium && (
                              <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] font-mono text-amber-400">
                                <span className="font-bold">Podium:</span> P1 {session.podium.p1} • P2 {session.podium.p2} • P3 {session.podium.p3}
                              </div>
                            )}
                          </div>

                          {/* Action Buttons for this specific session */}
                          <div className="mt-3 pt-2.5 border-t border-slate-800/70 space-y-1.5">
                            {/* Add to Google Calendar Button */}
                            <button
                              id={`btn-add-gcal-${event.id}-${sIdx}`}
                              onClick={(e) => handleAddToGoogleCalendar(event, session, e)}
                              className="w-full py-1 px-2 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 text-[11px] font-mono font-semibold transition flex items-center justify-center gap-1.5 shadow-sm"
                              title={`Add ${session.name} to Google Calendar`}
                            >
                              <CalendarPlus className="w-3 h-3" />
                              <span>{isCopied ? 'Opened GCal!' : 'Add to Google Cal'}</span>
                            </button>

                            {/* Download .ics Button */}
                            <button
                              id={`btn-dl-ics-${event.id}-${sIdx}`}
                              onClick={(e) => handleDownloadSessionIcs(event, session, e)}
                              className="w-full py-1 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[10px] font-mono transition flex items-center justify-center gap-1.5"
                              title={`Download .ics file for ${session.name}`}
                            >
                              <Download className="w-2.5 h-2.5 text-amber-400" />
                              <span>iCal / .ics File</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
          })}
        </div>
      )}
    </div>
  );
};
