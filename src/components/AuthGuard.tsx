'use client';

import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Flame } from 'lucide-react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.replace('/login');
    }
  }, [isPending, session, router]);

  // Show loading spinner while checking session
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

  // Not authenticated — return null while redirect happens
  if (!session) {
    return null;
  }

  return <>{children}</>;
}
