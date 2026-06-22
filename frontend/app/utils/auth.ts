/**
 * Authentication Utilities
 * Helper functions for auth checks and redirects
 */

import { hasAuthToken, isGuestMode, hasGuestSession } from '../services/guestService';

export interface AuthStatus {
  isAuthenticated: boolean;
  isGuest: boolean;
  hasSession: boolean;
}

/**
 * Get current auth status
 */
export function getAuthStatus(): AuthStatus {
  const isAuthenticated = hasAuthToken();
  const isGuest = isGuestMode() && hasGuestSession();
  const hasSession = isAuthenticated || isGuest;

  return {
    isAuthenticated,
    isGuest,
    hasSession,
  };
}

/**
 * Check if user should be redirected from login page
 * Returns true if user is authenticated and not guest
 */
export function shouldRedirectFromLogin(): boolean {
  const isAuthenticated = hasAuthToken();
  const isGuest = isGuestMode();

  // Redirect if authenticated user (not guest)
  return isAuthenticated && !isGuest;
}

/**
 * Check if user should be redirected to login
 * Returns true if user has no auth token and no guest session
 */
export function shouldRedirectToLogin(): boolean {
  const isAuthenticated = hasAuthToken();
  const isGuest = isGuestMode() && hasGuestSession();

  return !isAuthenticated && !isGuest;
}

/**
 * Get redirect destination based on current auth state
 */
export function getRedirectDestination(currentPath: string): string | null {
  // If on login page
  if (currentPath === '/login') {
    if (shouldRedirectFromLogin()) {
      return '/';
    }
    // Guest users are allowed on login page
    return null;
  }

  // If on protected pages (everything except login)
  if (shouldRedirectToLogin()) {
    return '/login';
  }

  return null;
}
