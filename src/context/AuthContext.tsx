import React, { createContext, useContext, useState, useEffect } from 'react';
import { GoogleUser, AuthContextType } from '../types/auth';
import { AlertPreferences } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_ALERT_PREFERENCES: AlertPreferences = {
  sessionStart: true,
  safetyCar: true,
  fastestLap: true,
  teamRadio: true,
  pitWindow: true,
  overtakeAlerts: true,
  soundEffects: true,
};

const DEFAULT_GOOGLE_USER: GoogleUser = {
  id: 'google-uid-108849204918239012',
  name: 'Anne Dillevsky',
  email: 'anne.dillevsky@gmail.com',
  picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  given_name: 'Anne',
  family_name: 'Dillevsky',
  verified_email: true,
  authProvider: 'google',
  lastLogin: new Date().toISOString(),
  favoriteDrivers: ['nor', 'lec', 'ver'],
  alertPreferences: DEFAULT_ALERT_PREFERENCES,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<GoogleUser | null>(() => {
    try {
      const hasSession = sessionStorage.getItem('f1_auth_session');
      if (hasSession === 'active') {
        const saved = localStorage.getItem('f1_google_user');
        if (saved) {
          return JSON.parse(saved);
        }
      }
    } catch {
      // Fallback
    }
    return null;
  });

  // Favorite drivers persisted across sessions
  const [favoriteDriverIds, setFavoriteDriverIdsState] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('f1_favorite_drivers');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return user?.favoriteDrivers || ['nor', 'lec', 'ver'];
  });

  // Alert preferences persisted across sessions
  const [alertPreferences, setAlertPreferences] = useState<AlertPreferences>(() => {
    try {
      const saved = localStorage.getItem('f1_alert_preferences');
      if (saved) {
        return { ...DEFAULT_ALERT_PREFERENCES, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
    return user?.alertPreferences || DEFAULT_ALERT_PREFERENCES;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Sync user and preferences to local storage
  useEffect(() => {
    if (user) {
      const updatedUser = {
        ...user,
        favoriteDrivers: favoriteDriverIds,
        alertPreferences,
      };
      localStorage.setItem('f1_google_user', JSON.stringify(updatedUser));
    } else {
      localStorage.removeItem('f1_google_user');
    }
  }, [user, favoriteDriverIds, alertPreferences]);

  // Persist favorite drivers
  useEffect(() => {
    try {
      localStorage.setItem('f1_favorite_drivers', JSON.stringify(favoriteDriverIds));
    } catch {
      // ignore
    }
  }, [favoriteDriverIds]);

  // Persist alert preferences
  useEffect(() => {
    try {
      localStorage.setItem('f1_alert_preferences', JSON.stringify(alertPreferences));
    } catch {
      // ignore
    }
  }, [alertPreferences]);

  // Toggle favorite driver helper
  const toggleFavoriteDriver = (id: string) => {
    setFavoriteDriverIdsState(prev => {
      const exists = prev.includes(id);
      const updated = exists ? prev.filter(dId => dId !== id) : [...prev, id];
      return updated;
    });
  };

  const setFavoriteDriverIds = (ids: string[]) => {
    setFavoriteDriverIdsState(ids);
  };

  const updateAlertPreference = (key: keyof AlertPreferences, val: boolean) => {
    setAlertPreferences(prev => ({
      ...prev,
      [key]: val,
    }));
  };

  // Load Google Identity Services script dynamically if not present
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!document.getElementById('google-gsi-client')) {
      const script = document.createElement('script');
      script.id = 'google-gsi-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  const loginWithGoogle = async (customEmail?: string, customName?: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 600));

    const email = customEmail || 'anne.dillevsky@gmail.com';
    const name = customName || (email === 'anne.dillevsky@gmail.com' ? 'Anne Dillevsky' : email.split('@')[0]);

    const newUser: GoogleUser = {
      id: `google-uid-${Math.floor(Math.random() * 100000000000000)}`,
      name,
      email,
      picture: email === 'anne.dillevsky@gmail.com' 
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=dc2626,2563eb,059669`,
      given_name: name.split(' ')[0],
      family_name: name.split(' ').slice(1).join(' ') || '',
      verified_email: true,
      authProvider: 'google',
      lastLogin: new Date().toISOString(),
      favoriteDrivers: favoriteDriverIds,
      alertPreferences,
    };

    try {
      sessionStorage.setItem('f1_auth_session', 'active');
      localStorage.setItem('f1_google_user', JSON.stringify(newUser));
    } catch {
      // ignore
    }

    setUser(newUser);
    setIsLoading(false);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    try {
      sessionStorage.removeItem('f1_auth_session');
      localStorage.removeItem('f1_google_user');
    } catch {
      // ignore
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        loginWithGoogle,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
        favoriteDriverIds,
        toggleFavoriteDriver,
        setFavoriteDriverIds,
        alertPreferences,
        updateAlertPreference,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

