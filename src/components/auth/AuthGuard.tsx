'use client';

import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Flame } from 'lucide-react';
import { isGuestSession } from '@/lib/guest-session';
import { isDevSkip } from '@/lib/dev-skip';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Allow guest sessions and dev skip mode through — no redirect needed
    if (!isPending && !session && !isGuestSession() && !isDevSkip()) {
      router.replace('/login');
    }
  }, [isPending, session, router]);

  // Show loading spinner while checking session (including guest for consistent UX)
  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground animate-pulse">
            <Flame className="h-6 w-6" />
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">Loading GramGains...</p>
        </div>
      </div>
    );
  }

  // Not authenticated and no guest session and no dev skip — return null while redirect happens
  if (!session && !isGuestSession() && !isDevSkip()) {
    return null;
  }

  return <>{children}</>;
}

