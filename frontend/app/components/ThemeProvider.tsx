'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { defaultSettings, SettingsState } from '../settings/types';

interface ThemeContextType {
  settings: SettingsState;
  loading: boolean;
  updateSettings: (newSettings: Partial<SettingsState>) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(theme: 'light' | 'dark' | 'system'): 'light' | 'dark' {
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch('/api/settings', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.data.settings) {
          const fetchedSettings = data.data.settings;
          const merged = {
            ...defaultSettings,
            ...fetchedSettings,
            notifications: { ...defaultSettings.notifications, ...(fetchedSettings.notifications || {}) },
            fileOrganization: { ...defaultSettings.fileOrganization, ...(fetchedSettings.fileOrganization || {}) },
            folderMonitoring: { ...defaultSettings.folderMonitoring, ...(fetchedSettings.folderMonitoring || {}) },
            searchPreferences: { ...defaultSettings.searchPreferences, ...(fetchedSettings.searchPreferences || {}) },
            privacy: { ...defaultSettings.privacy, ...(fetchedSettings.privacy || {}) },
            backup: { ...defaultSettings.backup, ...(fetchedSettings.backup || {}) },
            performance: { ...defaultSettings.performance, ...(fetchedSettings.performance || {}) },
          };
          setSettings(merged);
          localStorage.setItem('userSettings', JSON.stringify(merged));
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        const cached = localStorage.getItem('userSettings');
        if (cached) {
          try {
            setSettings(JSON.parse(cached));
          } catch {
            // ignore
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  useEffect(() => {
    const resolved = resolveTheme(settings.theme);
    const root = document.documentElement;

    root.classList.remove('light', 'dark');

    if (settings.theme === 'system') {
      root.classList.add(getSystemTheme());
    } else {
      root.classList.add(resolved);
    }
  }, [settings.theme]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('userSettings', JSON.stringify(settings));
    }
  }, [settings, loading]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (settings.theme === 'system') {
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(getSystemTheme());
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [settings.theme]);

  const updateSettings = async (newSettings: Partial<SettingsState>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/settings/update', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ settings: newSettings })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        console.error('Failed to save settings:', data.message);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ settings, loading, updateSettings }}>
      {children}
    </ThemeContext.Provider>
  );
}