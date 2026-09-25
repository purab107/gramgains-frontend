'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isDevSkip, isMockDataSeeded } from '@/lib/dev-skip';

interface DevSkipContextType {
  isPanelOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
  isSeeded: boolean;
}

const DevSkipContext = createContext<DevSkipContextType | undefined>(undefined);

export function useDevSkip() {
  const context = useContext(DevSkipContext);
  if (!context) {
    throw new Error('useDevSkip must be used within DevSkipProvider');
  }
  return context;
}

interface DevSkipProviderProps {
  children: ReactNode;
}

export function DevSkipProvider({ children }: DevSkipProviderProps) {
  // Short-circuit if dev skip is not enabled
  if (!isDevSkip()) {
    return <>{children}</>;
  }

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isSeeded, setIsSeeded] = useState(false);

  useEffect(() => {
    setIsSeeded(isMockDataSeeded());
  }, []);

  const openPanel = () => setIsPanelOpen(true);
  const closePanel = () => setIsPanelOpen(false);

  return (
    <DevSkipContext.Provider value={{ isPanelOpen, openPanel, closePanel, isSeeded }}>
      {children}
    </DevSkipContext.Provider>
  );
}