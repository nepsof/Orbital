'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getRedirectDestination } from '../utils/auth';
import { hasAuthToken } from '../services/guestService';

interface AuthGuardProps {
  children: ReactNode;
  allowGuest?: boolean;
  requireAuth?: boolean;
}

/**
 * AuthGuard Component
 * Protects routes by checking auth/guest status and redirecting as needed
 */
export default function AuthGuard({
  children,
  allowGuest = true,
  requireAuth = false,
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        // Check if we should redirect
        const redirectTo = getRedirectDestination(pathname);

        if (redirectTo) {
          router.push(redirectTo);
          return;
        }

        // If requireAuth is true, check if user is authenticated
        if (requireAuth) {
          const isAuthenticated = hasAuthToken();
          if (!isAuthenticated) {
            router.push('/login');
            return;
          }
        }

        setIsAllowed(true);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAllowed(false);
      } finally {
        setIsChecking(false);
      }
    };

    // Delay check to ensure localStorage is available
    const timer = setTimeout(checkAuth, 0);
    return () => clearTimeout(timer);
  }, [pathname, router, requireAuth]);

  if (isChecking) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAllowed) {
    return null;
  }

  return <>{children}</>;
}
