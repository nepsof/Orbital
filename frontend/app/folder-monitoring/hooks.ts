import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  FolderMonitoringSettings, 
  MonitoredFolder, 
  CategoryMapping, 
  RecentActivity,
  DEFAULT_FM_SETTINGS 
} from './types';
import { getLocalData, setLocalData, STORAGE_KEYS, validateFolderPath } from './utils';

const DEFAULT_CATEGORIES: CategoryMapping[] = [
  { id: 'c1', title: 'Images', icon: '🖼️', exts: '.jpg, .png, .gif', dest: '/Images', enabled: true },
  { id: 'c2', title: 'Videos', icon: '🎬', exts: '.mp4, .mov, .mkv', dest: '/Videos', enabled: true },
  { id: 'c3', title: 'PDFs', icon: '📕', exts: '.pdf', dest: '/Documents', enabled: true },
  { id: 'c4', title: 'Archives', icon: '📦', exts: '.zip, .rar, .7z', dest: '/Archives', enabled: true },
];

export function useFolderMonitoring() {
  const [fmSettings, setFmSettings] = useState<FolderMonitoringSettings>(DEFAULT_FM_SETTINGS);
  const [monitoredFolders, setMonitoredFolders] = useState<MonitoredFolder[]>([]);
  const [ignoredItems, setIgnoredItems] = useState<string[]>([]);
  const [categoryMappings, setCategoryMappings] = useState<CategoryMapping[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [recoveryHistory, setRecoveryHistory] = useState<MonitoredFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const cloudSyncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load local data
        setMonitoredFolders(getLocalData(STORAGE_KEYS.MONITORED_FOLDERS, []));
        setIgnoredItems(getLocalData(STORAGE_KEYS.IGNORED_ITEMS, ['node_modules', '.git', 'cache', 'tmp']));
        setCategoryMappings(getLocalData(STORAGE_KEYS.CATEGORY_MAPPINGS, DEFAULT_CATEGORIES));
        setRecentActivity(getLocalData(STORAGE_KEYS.RECENT_ACTIVITY, []));
        setRecoveryHistory(getLocalData(STORAGE_KEYS.RECOVERY_HISTORY, []));

        // Load cloud settings
        const token = localStorage.getItem('token');
        if (token) {
          const response = await fetch('/api/folder-monitoring/settings', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          if (result.success && result.data) {
            const fetchedSettings = result.data;
            setFmSettings({
              ...DEFAULT_FM_SETTINGS,
              ...fetchedSettings,
              organizationRules: {
                ...DEFAULT_FM_SETTINGS.organizationRules,
                ...(fetchedSettings.organizationRules || {})
              },
              performance: {
                ...DEFAULT_FM_SETTINGS.performance,
                ...(fetchedSettings.performance || {})
              }
            });
          }
        }
      } catch (error) {
        console.error('Error loading folder monitoring data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Sync local data to localStorage
  useEffect(() => {
    if (!loading) {
      setLocalData(STORAGE_KEYS.MONITORED_FOLDERS, monitoredFolders);
    }
  }, [monitoredFolders, loading]);

  useEffect(() => {
    if (!loading) {
      setLocalData(STORAGE_KEYS.IGNORED_ITEMS, ignoredItems);
    }
  }, [ignoredItems, loading]);

  useEffect(() => {
    if (!loading) {
      setLocalData(STORAGE_KEYS.CATEGORY_MAPPINGS, categoryMappings);
    }
  }, [categoryMappings, loading]);

  useEffect(() => {
    if (!loading) {
      setLocalData(STORAGE_KEYS.RECENT_ACTIVITY, recentActivity);
    }
  }, [recentActivity, loading]);

  useEffect(() => {
    if (!loading) {
      setLocalData(STORAGE_KEYS.RECOVERY_HISTORY, recoveryHistory);
    }
  }, [recoveryHistory, loading]);

  // Sync monitoredFolders to backend when they change (debounced)
  useEffect(() => {
    if (loading) return;
    if (cloudSyncTimer.current) clearTimeout(cloudSyncTimer.current);
    cloudSyncTimer.current = setTimeout(() => {
      saveSettingsToCloud(fmSettings);
    }, 800);
    return () => {
      if (cloudSyncTimer.current) clearTimeout(cloudSyncTimer.current);
    };
  }, [monitoredFolders, loading]);

  // Actions
  const addActivity = useCallback((activity: Omit<RecentActivity, 'id' | 'time'>) => {
    const newActivity: RecentActivity = {
      ...activity,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      time: new Date().toISOString()
    };
    setRecentActivity(prev => {
      const updated = [newActivity, ...prev].slice(0, 50);
      setLocalData(STORAGE_KEYS.RECENT_ACTIVITY, updated);
      return updated;
    });
  }, []);

  // Simulation Engine
  useEffect(() => {
    if (!fmSettings.monitoringEnabled || monitoredFolders.length === 0 || loading) return;

    const parseInterval = (interval: string) => {
      if (interval === '5s') return 5000;
      if (interval === '10s') return 10000;
      if (interval === '30s') return 30000;
      return null;
    };

    const intervalMs = parseInterval(fmSettings.performance.scanInterval);
    if (!intervalMs) return;

    const timer = setInterval(() => {
      // Pick a random active folder
      const activeFolders = monitoredFolders.filter(f => f.status === 'active');
      if (activeFolders.length === 0) return;
      
      const folder = activeFolders[Math.floor(Math.random() * activeFolders.length)];
      
      // Update folder last scan
      setMonitoredFolders(prev => prev.map(f => 
        f.id === folder.id ? { ...f, lastScan: 'Just now' } : f
      ));

      // Use folder-specific rules if available, otherwise fallback to global
      const globalRules = fmSettings.organizationRules;
      const folderRules = folder.rules || {
        autoOrganize: globalRules.autoOrganize,
        detectDuplicates: globalRules.detectDuplicates,
        compressionSuggestions: globalRules.compressionSuggestions
      };

      const possibleActivities: Array<Omit<RecentActivity, 'id' | 'time'>> = [];

      if (folderRules.autoOrganize && globalRules.autoOrganize) {
        possibleActivities.push({
          title: 'Files Organized',
          desc: `Moved ${Math.floor(Math.random() * 10) + 1} files to category folders in ${folder.name}`,
          type: 'organize'
        });
      }

      if (folderRules.detectDuplicates && globalRules.detectDuplicates) {
        possibleActivities.push({
          title: 'Duplicates Found',
          desc: `Identified ${Math.floor(Math.random() * 5) + 1} duplicate files in ${folder.name}`,
          type: 'duplicate'
        });
      }

      if (folderRules.compressionSuggestions && globalRules.compressionSuggestions && Math.random() > 0.7) {
        possibleActivities.push({
          title: 'Compression Suggestion',
          desc: `Found large old files in ${folder.name} that could be compressed.`,
          type: 'compress'
        });
      }

      // If no rules are on, just a heartbeat scan
      if (possibleActivities.length === 0 || Math.random() > 0.5) {
        addActivity({
          title: 'Folder Scanned',
          desc: `Health check completed for ${folder.name}. No actions needed.`,
          type: 'organize'
        });
      } else {
        const randomActivity = possibleActivities[Math.floor(Math.random() * possibleActivities.length)];
        addActivity(randomActivity);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [fmSettings.monitoringEnabled, fmSettings.performance.scanInterval, fmSettings.organizationRules, monitoredFolders, loading, addActivity]);

  const updateFmSettings = async (newSettings: Partial<FolderMonitoringSettings>) => {
    setFmSettings(prev => {
      const updated = { ...prev, ...newSettings };
      if (newSettings.organizationRules) {
        updated.organizationRules = { ...prev.organizationRules, ...newSettings.organizationRules };
      }
      if (newSettings.performance) {
        updated.performance = { ...prev.performance, ...newSettings.performance };
      }
      
      // Save to cloud asynchronously
      saveSettingsToCloud(updated);
      
      // Add activity log
      if (newSettings.organizationRules) {
        const rules = newSettings.organizationRules;
        const changedRule = Object.keys(rules)[0] as keyof typeof rules;
        const isEnabled = rules[changedRule];
        addActivity({
          title: 'Rule Updated',
          desc: `${changedRule.replace(/([A-Z])/g, ' $1').toLowerCase()} is now ${isEnabled ? 'enabled' : 'disabled'}.`,
          type: 'settings'
        });
      } else if (newSettings.monitoringEnabled !== undefined) {
        addActivity({
          title: 'Monitoring ' + (newSettings.monitoringEnabled ? 'Started' : 'Paused'),
          desc: `Folder monitoring has been ${newSettings.monitoringEnabled ? 'activated' : 'deactivated'}.`,
          type: 'settings'
        });
      } else {
        addActivity({
          title: 'Settings Updated',
          desc: 'Global monitoring preferences saved.',
          type: 'settings'
        });
      }
      
      return updated;
    });
  };

  const saveSettingsToCloud = async (updated: FolderMonitoringSettings) => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await fetch('/api/folder-monitoring/settings', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ ...updated, monitoredFolders })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (!result.success) {
          console.error('Failed to save fm settings:', result.message);
        }
      }
    } catch (error) {
      console.error('Error saving fm settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const addFolder = useCallback((path: string, name: string, stats?: { files: number, storage: string }) => {
    const validation = validateFolderPath(path, monitoredFolders.map(f => f.path));
    if (!validation.valid) return validation;

    const newFolder: MonitoredFolder = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: name || path.split(/[/\\]/).pop() || path,
      path,
      status: 'active',
      lastScan: 'Never',
      files: stats?.files || 0,
      type: 'User',
      storage: stats?.storage || '0 KB',
      icon: '📁',
      rules: {
        autoOrganize: fmSettings.organizationRules.autoOrganize,
        detectDuplicates: fmSettings.organizationRules.detectDuplicates,
        compressionSuggestions: fmSettings.organizationRules.compressionSuggestions
      }
    };

    setMonitoredFolders(prev => [...prev, newFolder]);
    
    // Trigger initial scan activity
    setTimeout(() => {
      addActivity({
        title: 'Initial Scan Completed',
        desc: `Successfully indexed ${stats?.files || 0} files in ${newFolder.name}.`,
        type: 'add'
      });

      // If auto-organize is on, simulate some initial work
      if (fmSettings.organizationRules.autoOrganize) {
        setTimeout(() => {
          addActivity({
            title: 'Auto-Organization Active',
            desc: `Rules applied to ${newFolder.name}. System is now monitoring for new files.`,
            type: 'organize'
          });
        }, 1500);
      }
    }, 800);

    return { valid: true };
  }, [monitoredFolders, addActivity, fmSettings.organizationRules]);

  const updateFolder = useCallback((id: string, updates: Partial<MonitoredFolder>) => {
    setMonitoredFolders(prev => prev.map(f => {
      if (f.id === id) {
        return { ...f, ...updates };
      }
      return f;
    }));
    addActivity({
      title: 'Folder Updated',
      desc: `Settings modified for folder.`,
      type: 'settings'
    });
  }, [addActivity]);

  const removeFolder = useCallback((id: string) => {
    const folder = monitoredFolders.find(f => f.id === id);
    if (folder) {
      setMonitoredFolders(prev => prev.filter(f => f.id !== id));
      setRecoveryHistory(prev => [folder, ...prev].slice(0, 50));
      addActivity({
        title: 'Folder Removed',
        desc: `Stopped monitoring ${folder.path}`,
        type: 'remove'
      });
    }
  }, [monitoredFolders, addActivity]);

  const undoRemoval = useCallback(() => {
    if (recoveryHistory.length === 0) return;
    const [folder, ...rest] = recoveryHistory;
    setMonitoredFolders(prev => [...prev, folder]);
    setRecoveryHistory(rest);
    addActivity({
      title: 'Folder Restored',
      desc: `Recovered ${folder.path} from history`,
      type: 'add'
    });
  }, [recoveryHistory, addActivity]);

  const restoreFolder = useCallback((id: string) => {
    const folder = recoveryHistory.find(f => f.id === id);
    if (folder) {
      setMonitoredFolders(prev => [...prev, folder]);
      setRecoveryHistory(prev => prev.filter(f => f.id !== id));
      addActivity({
        title: 'Folder Restored',
        desc: `Recovered ${folder.path} from history`,
        type: 'add'
      });
    }
  }, [recoveryHistory, addActivity]);

  const toggleFolderStatus = useCallback((id: string) => {
    setMonitoredFolders(prev => prev.map(f => {
      if (f.id === id) {
        const newStatus = f.status === 'active' ? 'paused' : 'active';
        addActivity({
          title: `Folder ${newStatus === 'active' ? 'Activated' : 'Paused'}`,
          desc: `${f.name} monitoring is now ${newStatus}.`,
          type: newStatus === 'active' ? 'add' : 'pause'
        });
        return { ...f, status: newStatus };
      }
      return f;
    }));
  }, [addActivity]);

  const updateFolderStats = useCallback((id: string, stats: { files: number, storage: string }) => {
    setMonitoredFolders(prev => prev.map(f => {
      if (f.id === id) {
        return {
          ...f,
          files: stats.files,
          storage: stats.storage,
          lastScan: 'Just now'
        };
      }
      return f;
    }));
    const folder = monitoredFolders.find(f => f.id === id);
    if (folder) {
      addActivity({
        title: 'Folder Scanned',
        desc: `Updated stats for ${folder.path}`,
        type: 'organize'
      });
    }
  }, [monitoredFolders, addActivity]);

  const addExclusion = useCallback((item: string) => {
    const trimmed = item.trim();
    if (trimmed && !ignoredItems.includes(trimmed)) {
      setIgnoredItems(prev => [...prev, trimmed]);
      addActivity({
        title: 'Exclusion Added',
        desc: `Files matching "${trimmed}" will be skipped during scans.`,
        type: 'settings'
      });
    }
  }, [ignoredItems, addActivity]);

  const removeExclusion = useCallback((item: string) => {
    setIgnoredItems(prev => prev.filter(i => i !== item));
    addActivity({
      title: 'Exclusion Removed',
      desc: `"${item}" is no longer ignored by the monitoring engine.`,
      type: 'settings'
    });
  }, [addActivity]);

  const updateCategoryMapping = useCallback((id: string, updates: Partial<CategoryMapping>) => {
    const category = categoryMappings.find(c => c.id === id);
    setCategoryMappings(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, ...updates };
      }
      return c;
    }));
    
    if (category) {
      addActivity({
        title: 'Category Updated',
        desc: `Updated mapping for ${category.title}. Destination: ${updates.dest || category.dest}`,
        type: 'settings'
      });
    }
  }, [categoryMappings, addActivity]);

  return {
    fmSettings,
    monitoredFolders,
    ignoredItems,
    categoryMappings,
    recentActivity,
    recoveryHistory,
    loading,
    saving,
    updateFmSettings,
    addFolder,
    updateFolder,
    removeFolder,
    undoRemoval,
    restoreFolder,
    toggleFolderStatus,
    updateFolderStats,
    addExclusion,
    removeExclusion,
    updateCategoryMapping
  };
}
