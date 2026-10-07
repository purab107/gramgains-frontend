'use client';

import React, { createContext, useContext } from 'react';
import { useSession } from '@/lib/auth-client';

type SessionContextValue = ReturnType<typeof useSession>;

const SessionContext = createContext<SessionContextValue | null>(null);

/**
 * Runs useSession() exactly once at root layout level and shares the result
 * via context. All consumers (AuthGuard, etc.) read from here instead of
 * making their own network round-trips on every page mount.
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const session = useSession();
  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSharedSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSharedSession must be used inside <SessionProvider>');
  }
  return ctx;
}
