/**
 * Storage key constants
 */
export const STORAGE_KEYS = {
  INDEXED_FILES: 'files_workspace_index',
  FAVORITES: 'files_workspace_favorites',
  ACTIVITY_LOG: 'files_workspace_activity',
  RECOVERY_ITEMS: 'files_workspace_recovery',
  SEARCH_HISTORY: 'files_workspace_search_history',
  WORKSPACE_SETTINGS: 'files_workspace_settings',
};

/**
 * Local Storage Abstraction Layer
 */
export const filesStorage = {
  /**
   * Generic get item from localStorage
   */
  get: <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return defaultValue;
    }
  },

  /**
   * Generic set item to localStorage
   */
  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
    }
  },

  /**
   * Generic remove item from localStorage
   */
  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  },

  /**
   * Clear all workspace related data
   */
  clearAll: (): void => {
    if (typeof window === 'undefined') return;
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
};
