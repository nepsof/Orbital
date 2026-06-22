export interface FolderMonitoringSettings {
  monitoringEnabled: boolean;
  organizationRules: {
    autoOrganize: boolean;
    autoCreateFolders: boolean;
    detectDuplicates: boolean;
    compressionSuggestions: boolean;
    askBeforeMove: boolean;
    safeMode: boolean;
  };
  performance: {
    realtimeMonitoring: boolean;
    backgroundScanning: boolean;
    scanInterval: string;
    cpuOptimization: boolean;
  };
}

export interface MonitoredFolder {
  id: string;
  name: string;
  path: string;
  status: 'active' | 'paused';
  lastScan: string;
  files: number;
  type: string;
  storage: string;
  icon: string;
  rules?: {
    autoOrganize: boolean;
    detectDuplicates: boolean;
    compressionSuggestions: boolean;
  };
}

export interface CategoryMapping {
  id: string;
  title: string;
  icon: string;
  exts: string;
  dest: string;
  enabled: boolean;
}

export interface RecentActivity {
  id: string;
  title: string;
  time: string;
  desc: string;
  type: 'organize' | 'duplicate' | 'add' | 'compress' | 'remove' | 'pause' | 'settings';
}

export const DEFAULT_FM_SETTINGS: FolderMonitoringSettings = {
  monitoringEnabled: true,
  organizationRules: {
    autoOrganize: true,
    autoCreateFolders: true,
    detectDuplicates: true,
    compressionSuggestions: true,
    askBeforeMove: true,
    safeMode: true
  },
  performance: {
    realtimeMonitoring: true,
    backgroundScanning: true,
    scanInterval: "30s",
    cpuOptimization: false
  }
};
