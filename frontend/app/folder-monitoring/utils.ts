export const STORAGE_KEYS = {
  MONITORED_FOLDERS: 'sfm_monitored_folders',
  RECENT_ACTIVITY: 'sfm_recent_activity',
  IGNORED_ITEMS: 'sfm_ignored_items',
  CATEGORY_MAPPINGS: 'sfm_category_mappings',
  RECOVERY_HISTORY: 'sfm_recovery_history',
};

export const getLocalData = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error(`Error parsing localStorage key "${key}":`, e);
    }
  }
  return defaultValue;
};

export const setLocalData = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
};

export const PROTECTED_PATHS = [
  'C:\\Windows',
  'C:\\System32',
  '/System',
  '/Library',
  '/bin',
  '/sbin',
  '/usr/bin',
  '/usr/sbin'
];

export const ROOT_PATHS = [
  '/',
  'C:\\',
  'C:'
];

export const validateFolderPath = (path: string, existingPaths: string[]): { valid: boolean; error?: string } => {
  const trimmedPath = path.trim();
  if (!trimmedPath) return { valid: false, error: 'Path cannot be empty' };

  const lowerPath = trimmedPath.toLowerCase();

  // Check for duplicates
  if (existingPaths.some(p => p.toLowerCase() === lowerPath)) {
    return { valid: false, error: 'This folder is already being monitored' };
  }

  // Check if it's exactly a root path
  if (ROOT_PATHS.some(p => lowerPath === p.toLowerCase())) {
    return { valid: false, error: 'Cannot monitor the root directory' };
  }

  // Check for protected paths
  for (const protectedPath of PROTECTED_PATHS) {
    const lowerProtected = protectedPath.toLowerCase();
    
    // Exact match or inside a protected directory
    if (lowerPath === lowerProtected || lowerPath.startsWith(lowerProtected + '/') || lowerPath.startsWith(lowerProtected + '\\')) {
      return { valid: false, error: 'Cannot monitor protected system directories' };
    }
  }

  // Basic format validation (very loose)
  if (!trimmedPath.includes('/') && !trimmedPath.includes('\\')) {
    return { valid: false, error: 'Invalid path format' };
  }

  return { valid: true };
};
