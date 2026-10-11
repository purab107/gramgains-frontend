'use client';

import { useSharedSession } from '@/components/providers/SessionProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Flame, Loader2 } from 'lucide-react';
import { isGuestSession } from '@/lib/guest-session';
import { isDevSkip } from '@/lib/dev-skip';
import { logLoadingStart, logLoadingEnd, logEvent } from '@/lib/onboarding-logger';

function hasAuthCookie(): boolean {
  if (typeof document === 'undefined') return false;
  return (
    document.cookie.includes('session') ||
    document.cookie.includes('token') ||
    document.cookie.includes('gramgains') ||
    document.cookie.includes('better-auth')
  );
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSharedSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const loadingLoggedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Allow guest sessions and dev skip mode through — no redirect needed
    if (isGuestSession() || isDevSkip()) {
      logEvent('AuthGuard passed (guest or dev-skip session)');
      return;
    }

    // Fast check: If session check is pending but user has no auth cookie in browser,
    // redirect to login immediately instead of hanging on sleeping backend cold start
    if (isPending && !hasAuthCookie()) {
      logEvent('AuthGuard: No auth cookie detected, fast redirecting to /login');
      router.replace('/login');
      return;
    }

    // When session check finishes and user has no active session
    if (!isPending && !session) {
      logEvent('AuthGuard: Session verification failed (no active session), redirecting to /login');
      if (loadingLoggedRef.current) {
        logLoadingEnd('AuthGuardSessionCheck');
        loadingLoggedRef.current = false;
      }
      router.replace('/login');
    } else if (!isPending && session) {
      logEvent('AuthGuard: Session authenticated successfully', { userId: session.user?.id, email: session.user?.email });
      if (loadingLoggedRef.current) {
        logLoadingEnd('AuthGuardSessionCheck');
        loadingLoggedRef.current = false;
      }
    }
  }, [mounted, isPending, session, router]);

  // Track loading screen display
  useEffect(() => {
    if (isPending && hasAuthCookie() && !loadingLoggedRef.current) {
      logLoadingStart('AuthGuardSessionCheck');
      loadingLoggedRef.current = true;
    }
  }, [isPending]);

  // If already authenticated or in guest/dev mode
  if (session || isGuestSession() || isDevSkip()) {
    return <>{children}</>;
  }

  // Fast check: If no auth cookie at all on client, don't show loading screen, redirect immediately
  if (mounted && !hasAuthCookie()) {
    return null;
  }

  // Show loading spinner while verifying session when cookie exists
  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground animate-pulse shadow-lg">
            <Flame className="h-6 w-6" />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span>Connecting to GramGains...</span>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated and no guest session — return null while redirect happens
  return null;
}


