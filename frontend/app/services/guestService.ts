/**
 * Guest Session Service
 * Manages guest user sessions with local storage
 */

export interface GuestProfile {
  guestId: string;
  sessionType: 'guest';
  createdAt: string;
  monitoredFolders?: unknown[];
  automationRules?: unknown[];
  ignoreRules?: unknown[];
  analytics?: unknown[];
  searchHistory?: unknown[];
  undoHistory?: unknown[];
}

export interface GuestSession {
  profile: GuestProfile;
  isGuest: boolean;
}

const GUEST_SESSION_KEY = 'guestSession';
const SESSION_TYPE_KEY = 'sessionType';

/**
 * Generate a unique guest ID
 */
export function generateGuestId(): string {
  return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new guest session
 */
export function createGuestSession(): GuestProfile {
  const profile: GuestProfile = {
    guestId: generateGuestId(),
    sessionType: 'guest',
    createdAt: new Date().toISOString(),
    monitoredFolders: [],
    automationRules: [],
    ignoreRules: [],
    analytics: [],
    searchHistory: [],
    undoHistory: [],
  };

  localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(profile));
  localStorage.setItem(SESSION_TYPE_KEY, 'guest');

  return profile;
}

/**
 * Get current guest session (if exists)
 */
export function getGuestSession(): GuestProfile | null {
  try {
    const session = localStorage.getItem(GUEST_SESSION_KEY);
    if (!session) return null;
    return JSON.parse(session) as GuestProfile;
  } catch (error) {
    console.error('Error parsing guest session:', error);
    return null;
  }
}

/**
 * Check if user is in guest mode
 */
export function isGuestMode(): boolean {
  return localStorage.getItem(SESSION_TYPE_KEY) === 'guest';
}

/**
 * Migrate guest data to authenticated user
 * Called after successful registration or login
 */
export function migrateGuestData(userId: string): {
  migrated: GuestProfile | null;
  monitoredFolders?: unknown[];
  automationRules?: unknown[];
  ignoreRules?: unknown[];
  analytics?: unknown[];
  searchHistory?: unknown[];
  undoHistory?: unknown[];
} {
  const guestSession = getGuestSession();

  if (!guestSession) {
    return { migrated: null };
  }

  // Prepare guest data for migration
  const migratedData = {
    migrated: guestSession,
    monitoredFolders: guestSession.monitoredFolders || [],
    automationRules: guestSession.automationRules || [],
    ignoreRules: guestSession.ignoreRules || [],
    analytics: guestSession.analytics || [],
    searchHistory: guestSession.searchHistory || [],
    undoHistory: guestSession.undoHistory || [],
  };

  // Remove guest session from storage
  clearGuestSession();

  return migratedData;
}

/**
 * Update guest data for a specific key
 */
export function updateGuestData(key: keyof Omit<GuestProfile, 'guestId' | 'sessionType' | 'createdAt'>, value: unknown): void {
  const session = getGuestSession();
  if (!session) return;

  (session as unknown as Record<string, unknown>)[key] = value;
  localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(session));
}

/**
 * Clear guest session
 */
export function clearGuestSession(): void {
  localStorage.removeItem(GUEST_SESSION_KEY);
  if (isGuestMode()) {
    localStorage.removeItem(SESSION_TYPE_KEY);
  }
}

/**
 * Set session type to authenticated user
 */
export function setAuthenticatedSession(): void {
  localStorage.setItem(SESSION_TYPE_KEY, 'user');
}

/**
 * Get current session type
 */
export function getSessionType(): 'user' | 'guest' | null {
  const type = localStorage.getItem(SESSION_TYPE_KEY);
  if (type === 'guest' || type === 'user') {
    return type;
  }
  return null;
}

/**
 * Check if authenticated session exists
 */
export function hasAuthToken(): boolean {
  return !!localStorage.getItem('token');
}

/**
 * Check if guest session exists
 */
export function hasGuestSession(): boolean {
  return !!getGuestSession();
}
