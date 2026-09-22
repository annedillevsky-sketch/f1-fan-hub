import React, { useState, useEffect } from 'react';
import { 
  INITIAL_DRIVERS, 
  TEAM_RADIO_ARCHIVE, 
  RACE_CALENDAR 
} from './data/f1Data';
import { 
  Driver, 
  FlagStatus, 
  NotificationItem, 
  RadioMessage 
} from './types';
import { Navbar } from './components/Navbar';
import { LiveTiming } from './components/LiveTiming';
import { CircuitMap } from './components/CircuitMap';
import { TelemetryAnalysis } from './components/TelemetryAnalysis';
import { DriverStandings } from './components/DriverStandings';
import { RaceCalendar } from './components/RaceCalendar';
import { PersonalizedDashboard } from './components/PersonalizedDashboard';
import { NewsAndHistory } from './components/NewsAndHistory';
import { TeamsAndCars } from './components/TeamsAndCars';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { NotificationCenter } from './components/NotificationCenter';
import { ActiveToast } from './components/ActiveToast';
import { PitStopStrategyPredictor } from './components/PitStopStrategyPredictor';
import { MotorsportHero } from './components/MotorsportHero';
import { HomeLanding } from './components/HomeLanding';
import { GridLeaders } from './components/GridLeaders';
import { ScheduleAndLive } from './components/ScheduleAndLive';
import { ApiStatusBanner } from './components/ApiStatusBanner';
import { useAuth } from './context/AuthContext';
import { useOpenF1 } from './context/OpenF1Context';
import { 
  requestNotificationPermission, 
  triggerBrowserNotification 
} from './utils/notificationService';
import { playAlertChime } from './utils/audioAlerts';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('f1_dark_mode');
    return saved !== null ? saved === 'true' : true; // default to Night Racing dark mode
  });

  const { user, favoriteDriverIds, toggleFavoriteDriver, loginWithGoogle } = useAuth();
  const { 
    drivers: apiDrivers, 
    constructors: apiConstructors, 
    races: apiRaces, 
    loading: apiLoading 
  } = useOpenF1();

  const [flagStatus, setFlagStatus] = useState<FlagStatus>('GREEN');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);

  // Sync drivers from real-time API when loaded
  useEffect(() => {
    if (apiDrivers && apiDrivers.length > 0) {
      setDrivers(apiDrivers);
    }
  }, [apiDrivers]);
  const [radioMessages] = useState<RadioMessage[]>(TEAM_RADIO_ARCHIVE);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Push notifications enabled state
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('f1_push_notifications_enabled');
    return saved ? saved === 'true' : (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted');
  });

  // Subscribed calendar events for push notifications
  const [subscribedEvents, setSubscribedEvents] = useState<string[]>(() => {
    const saved = localStorage.getItem('f1_subscribed_events');
    return saved ? JSON.parse(saved) : ['rd-17', 'rd-18', 'rd-19'];
  });

  // Notification items
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      type: 'SESSION_START',
      title: 'SESSION GREEN: Azerbaijan Grand Prix (Baku City Circuit)',
      message: 'Live qualifying session underway. Neftchilar main straight speeds clocking 350+ km/h.',
      timestamp: '16:00:00',
      read: false,
      eventId: 'rd-17',
    },
    {
      id: 'notif-2',
      type: 'PODIUM_RESULT',
      title: 'PODIUM RESULT: Italian Grand Prix (Monza)',
      message: 'P1 Charles Leclerc (FER) • P2 Oscar Piastri (MCL) • P3 Lando Norris (MCL).',
      timestamp: 'Sep 6',
      read: true,
      eventId: 'rd-07',
    },
    {
      id: 'notif-3',
      type: 'PODIUM_RESULT',
      title: 'PODIUM RESULT: British Grand Prix (Silverstone)',
      message: 'P1 Lewis Hamilton (MER) • P2 Max Verstappen (RBR) • P3 Lando Norris (MCL). Completed July 5.',
      timestamp: 'Jul 5',
      read: true,
      eventId: 'rd-05',
    },
  ]);


  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [activeToast, setActiveToast] = useState<NotificationItem | null>(null);

  // Persist dark mode
  useEffect(() => {
    localStorage.setItem('f1_dark_mode', String(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Toggle favorite driver via AuthContext
  const handleToggleFavorite = (driverId: string) => {
    toggleFavoriteDriver(driverId);
  };

  // Toggle calendar alerts subscription
  const handleToggleEventSubscription = (eventId: string) => {
    setSubscribedEvents(prev => {
      const exists = prev.includes(eventId);
      const next = exists ? prev.filter(id => id !== eventId) : [...prev, eventId];
      return next;
    });
  };


  // Toggle push notifications permission and preferences
  const handleTogglePushNotifications = async () => {
    if (pushNotificationsEnabled) {
      setPushNotificationsEnabled(false);
      localStorage.setItem('f1_push_notifications_enabled', 'false');
      handleDispatchNotification({
        type: 'SYSTEM_ALERT',
        title: 'Push Notifications Muted',
        message: 'Browser push notifications have been deactivated.',
      });
    } else {
      const perm = await requestNotificationPermission();
      if (perm === 'granted') {
        setPushNotificationsEnabled(true);
        localStorage.setItem('f1_push_notifications_enabled', 'true');
        playAlertChime();
        triggerBrowserNotification('🏎️ F1 Fan Hub: Push Alerts Enabled', {
          body: 'You are now primed for live countdowns, lights-out alerts, and session starts!',
        });
        handleDispatchNotification({
          type: 'SYSTEM_ALERT',
          title: 'Push Notifications Enabled',
          message: 'Browser desktop notifications are now active for Baku GP and 2026 World Championship sessions.',
        });
      } else {
        setPushNotificationsEnabled(false);
        localStorage.setItem('f1_push_notifications_enabled', 'false');
        handleDispatchNotification({
          type: 'SYSTEM_ALERT',
          title: 'Notification Permission Denied',
          message: 'Please allow notification permissions in your browser address bar to enable live desktop push alerts.',
        });
      }
    }
  };

  // Dispatch new push notification
  const handleDispatchNotification = (item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: NotificationItem = {
      ...item,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      read: false,
    };

    setNotifications(prev => [newNotif, ...prev]);
    setActiveToast(newNotif);

    // Also trigger browser desktop notification if push notifications are enabled or permission granted
    if (pushNotificationsEnabled || (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted')) {
      triggerBrowserNotification(newNotif.title, {
        body: newNotif.message,
      });
    }
  };

  const handleSelectDriverForTelemetry = (driverId: string) => {
    setActiveTab('telemetry');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDarkMode ? 'bg-[#080A0F] text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      {/* Top Motorsport App Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        flagStatus={flagStatus}
        setFlagStatus={setFlagStatus}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        notifications={notifications}
        unreadCount={unreadCount}
        onOpenNotifications={() => setIsNotificationCenterOpen(true)}
        favoriteDriversCount={favoriteDriverIds.length}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        pushNotificationsEnabled={pushNotificationsEnabled}
        onTogglePushNotifications={handleTogglePushNotifications}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Real-time OpenF1 Telemetry Status Bar */}
        <ApiStatusBanner isDarkMode={isDarkMode} />

        {/* Clean Page Routing: [Home], [Drivers Grid], [Teams/Cars], [Schedule & Live] */}
        {activeTab === 'home' && (
          <HomeLanding
            onNavigateTab={setActiveTab}
            isDarkMode={isDarkMode}
          />
        )}

        {activeTab === 'drivers' && (
          <div className="space-y-6">
            <GridLeaders
              drivers={drivers}
              isDarkMode={isDarkMode}
              favoriteDriverIds={favoriteDriverIds}
              onToggleFavorite={handleToggleFavorite}
              onSelectDriverForTelemetry={handleSelectDriverForTelemetry}
              loading={apiLoading}
            />
          </div>
        )}

        {activeTab === 'teams' && (
          <TeamsAndCars
            drivers={drivers}
            isDarkMode={isDarkMode}
            favoriteDriverIds={favoriteDriverIds}
            onToggleFavorite={handleToggleFavorite}
            onSelectDriverForTelemetry={handleSelectDriverForTelemetry}
            constructors={apiConstructors}
            loading={apiLoading}
          />
        )}

        {activeTab === 'schedule' && (
          <ScheduleAndLive
            drivers={drivers}
            setDrivers={setDrivers}
            flagStatus={flagStatus}
            isDarkMode={isDarkMode}
            soundEnabled={soundEnabled}
            favoriteDriverIds={favoriteDriverIds}
            onToggleFavorite={handleToggleFavorite}
            onSelectDriverForTelemetry={handleSelectDriverForTelemetry}
            radioMessages={radioMessages}
            onDispatchNotification={handleDispatchNotification}
            subscribedEvents={subscribedEvents}
            onToggleEventSubscription={handleToggleEventSubscription}
            pushNotificationsEnabled={pushNotificationsEnabled}
            onTogglePushNotifications={handleTogglePushNotifications}
            races={apiRaces}
            loading={apiLoading}
          />
        )}

        {/* Fallbacks for sub-views if navigated directly */}
        {activeTab === 'timing' && (
          <LiveTiming
            drivers={drivers}
            setDrivers={setDrivers}
            flagStatus={flagStatus}
            isDarkMode={isDarkMode}
            soundEnabled={soundEnabled}
            favoriteDriverIds={favoriteDriverIds}
            onToggleFavorite={handleToggleFavorite}
            onSelectDriverForTelemetry={handleSelectDriverForTelemetry}
            radioMessages={radioMessages}
          />
        )}

        {activeTab === 'telemetry' && (
          <TelemetryAnalysis
            drivers={drivers}
            isDarkMode={isDarkMode}
          />
        )}
      </main>

      {/* Notification Center Slide-over Drawer */}
      <NotificationCenter
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
        onClearAll={() => setNotifications([])}
        onDismissNotification={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
        isDarkMode={isDarkMode}
      />

      {/* Active In-App Push Alert Banner */}
      <ActiveToast
        notification={activeToast}
        onDismiss={() => setActiveToast(null)}
      />

      {/* Google Authentication Modal */}
      <GoogleAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}

