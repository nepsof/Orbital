import api from './api';

export interface SummaryData {
  totalFiles: number;
  totalFilesDisplay: string;
  totalFilesTrend: number;
  totalFilesFooter: string;
  storageUsed: number;
  storageUsedDisplay: string;
  storageUsedTrend: number;
  storageUsedFooter: string;
  storageSaved: number;
  storageSavedDisplay: string;
  storageSavedTrend: number;
  storageSavedFooter: string;
  duplicateCount: number;
  duplicateCountDisplay: string;
  duplicateTrend: number;
  duplicateFooter: string;
  searchCount: number;
  searchCountDisplay: string;
  searchTrend: number;
  searchFooter: string;
  activeFolders: number;
  activeFoldersDisplay: string;
  folderTrend: number;
  folderFooter: string;
}

export interface StorageDistribution {
  labels: string[];
  values: number[];
  colors: string[];
  total: number;
}

export interface ActivityTrend {
  date: string;
  label: string;
  organized: number;
  detected: number;
  compressed: number;
  size: number;
}

export interface ProductivityData {
  organizedToday: number;
  organizedTodayDisplay: string;
  automationRate: number;
  automationRateDisplay: string;
  avgSearchSpeed: number;
  avgSearchSpeedDisplay: string;
  timeSaved: number;
  timeSavedDisplay: string;
  activeFolders: { name: string; activity: string }[];
}

export interface SearchVolumeDay {
  day: string;
  count: number;
}

export interface TopSearch {
  name: string;
  category: string;
  count: number;
}

export interface RecoveryData {
  filesRestored: number;
  filesRestoredDisplay: string;
  undoActions: number;
  undoActionsDisplay: string;
  riskyBlocked: number;
  riskyBlockedDisplay: string;
  protectedFolders: number;
  protectedFoldersDisplay: string;
  weeklyData: { day: string; count: number }[];
}

export interface ActivityLogEntry {
  id: string;
  title: string;
  description: string;
  time: string;
  type: string;
  color: string;
}

export interface Recommendation {
  id: number;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  action: string;
  color: string;
  icon?: string;
}

export interface CategoryBreakdownItem {
  name: string;
  count: number;
  percentage: number;
  color: string;
  icon: string;
}

export interface MonitoringData {
  scanData: { time: string; events: number }[];
  filesScanned1h: number;
  filesScanned1hDisplay: string;
  changesDetected: number;
  changesDetectedDisplay: string;
  avgCpuUsage: number;
  avgCpuUsageDisplay: string;
  healthStatus: string;
  folderCount: number;
  folderCountDisplay: string;
  fileCountDisplay: string;
  events: { type: string; label: string; detail: string; time: string }[];
}

export const analyticsService = {
  getSummary: () => api.get<SummaryData>('/api/analytics/summary'),

  getStorageDistribution: () => api.get<StorageDistribution>('/api/analytics/storage-distribution'),

  getActivityTrends: (days: number = 30) =>
    api.get<ActivityTrend[]>(`/api/analytics/activity-trends?days=${days}`),

  getProductivity: () => api.get<ProductivityData>('/api/analytics/productivity'),

  getSearchVolume: (days: number = 7) =>
    api.get<SearchVolumeDay[]>(`/api/analytics/search-volume?days=${days}`),

  getTopSearches: () => api.get<TopSearch[]>('/api/analytics/top-searches'),

  getRecovery: () => api.get<RecoveryData>('/api/analytics/recovery'),

  getActivityLog: (limit: number = 5) =>
    api.get<ActivityLogEntry[]>(`/api/analytics/activity-log?limit=${limit}`),

  getRecommendations: () => api.get<Recommendation[]>('/api/analytics/recommendations'),

  getCategoryBreakdown: () => api.get<{ categories: CategoryBreakdownItem[]; total: number }>('/api/analytics/category-breakdown'),

  getMonitoring: () => api.get<MonitoringData>('/api/analytics/monitoring'),

  getDuplicateAnalysis: () => api.get<any>('/api/analytics/duplicates'),

  getCompressionStats: () => api.get<any>('/api/analytics/compression'),
};

export default analyticsService;
