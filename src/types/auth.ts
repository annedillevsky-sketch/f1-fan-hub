import { AlertPreferences } from '../types';

export interface GoogleUser {
  id: string;
  name: string;
  email: string;
  picture: string;
  given_name?: string;
  family_name?: string;
  verified_email?: boolean;
  authProvider: 'google';
  lastLogin: string;
  favoriteDrivers?: string[];
  alertPreferences?: AlertPreferences;
}

export interface AuthContextType {
  user: GoogleUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithGoogle: (customEmail?: string, customName?: string) => Promise<void>;
  logout: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  favoriteDriverIds: string[];
  toggleFavoriteDriver: (id: string) => void;
  setFavoriteDriverIds: (ids: string[]) => void;
  alertPreferences: AlertPreferences;
  updateAlertPreference: (key: keyof AlertPreferences, val: boolean) => void;
}

