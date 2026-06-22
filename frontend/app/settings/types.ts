export interface SettingsState {
  theme: 'light' | 'dark' | 'system';
  language: string;
  dateFormat: string;
  launchOnStartup: boolean;
  startMinimized: boolean;
  minimizeToTray: boolean;
  desktopNotifications: boolean;
  performanceMode: 'balanced' | 'high' | 'battery';
  fontSize: 'small' | 'default' | 'large';
  reducedMotion: boolean;
  notifications: {
    email: boolean;
    desktop: boolean;
    sound: boolean;
  };
  fileOrganization: {
    autoOrganize: boolean;
    duplicateDetection: boolean;
    compressionEnabled: boolean;
  };
  folderMonitoring: {
    enabled: boolean;
    scanInterval: string;
    excludeHidden: boolean;
  };
  searchPreferences: {
    includeContent: boolean;
    caseSensitive: boolean;
    fuzzySearch: boolean;
  };
  privacy: {
    shareAnalytics: boolean;
    crashReports: boolean;
  };
  backup: {
    autoBackup: boolean;
    backupInterval: string;
    retentionDays: number;
  };
  performance: {
    maxMemoryUsage: number;
    enableCaching: boolean;
    optimizeForLargeFiles: boolean;
  };
}

export const defaultSettings: SettingsState = {
  theme: 'dark',
  language: 'en',
  dateFormat: 'MM/DD/YYYY',
  launchOnStartup: false,
  startMinimized: false,
  minimizeToTray: true,
  desktopNotifications: true,
  performanceMode: 'balanced',
  fontSize: 'default',
  reducedMotion: false,
  notifications: {
    email: true,
    desktop: true,
    sound: false
  },
  fileOrganization: {
    autoOrganize: false,
    duplicateDetection: true,
    compressionEnabled: true
  },
  folderMonitoring: {
    enabled: true,
    scanInterval: 'hourly',
    excludeHidden: true
  },
  searchPreferences: {
    includeContent: true,
    caseSensitive: false,
    fuzzySearch: true
  },
  privacy: {
    shareAnalytics: false,
    crashReports: true
  },
  backup: {
    autoBackup: false,
    backupInterval: 'daily',
    retentionDays: 30
  },
  performance: {
    maxMemoryUsage: 1024,
    enableCaching: true,
    optimizeForLargeFiles: true
  }
};

export interface SettingsProps {
  settings: SettingsState;
  saveSettings: (newSettings: Partial<SettingsState>) => void;
  loading: boolean;
}

