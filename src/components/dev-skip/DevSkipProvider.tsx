'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  isDevSkip, 
  getActiveStage, 
  getCurrentStageId, 
  setStage, 
  advanceToNextStage, 
  revertToPrevStage,
  getOverrides,
  setOverride,
  clearOverrides,
  isMockDataSeeded,
  seedMockData,
  clearMockData,
  notifyDevSkipChange
} from '@/lib/dev-skip';
import { DEV_SKIP_STAGES, DevSkipStage } from '@/lib/dev-skip-scenarios';

interface DevSkipContextType {
  isPanelOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
  activeStage: DevSkipStage;
  activeStageId: number;
  totalStages: number;
  stages: DevSkipStage[];
  advanceStage: () => void;
  revertStage: () => void;
  jumpToStage: (id: number) => void;
  applyOverride: (key: string, value: string) => void;
  resetAllOverrides: () => void;
  activeOverrides: Record<string, string>;
  isSeeded: boolean;
  seedAll: () => Promise<void>;
  resetToCleanSlate: () => void;
  activeModalTrigger: string | null;
  triggerModal: (name: string | null) => void;
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
  const router = useRouter();
  const pathname = usePathname();

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activeStage, setActiveStageState] = useState<DevSkipStage>(DEV_SKIP_STAGES[2]); // default to Day 1
  const [activeStageId, setActiveStageId] = useState<number>(3);
  const [activeOverrides, setActiveOverrides] = useState<Record<string, string>>({});
  const [isSeeded, setIsSeeded] = useState(false);
  const [activeModalTrigger, setActiveModalTrigger] = useState<string | null>(null);

  const refreshState = useCallback(() => {
    if (!isDevSkip()) return;
    const stage = getActiveStage();
    setActiveStageState(stage);
    setActiveStageId(stage.id);
    setActiveOverrides(getOverrides());
    setIsSeeded(isMockDataSeeded());
  }, []);

  useEffect(() => {
    refreshState();

    const handleCustomChange = () => {
      refreshState();
    };

    window.addEventListener('gramgains:devskip-change', handleCustomChange);
    window.addEventListener('storage', handleCustomChange);

    return () => {
      window.removeEventListener('gramgains:devskip-change', handleCustomChange);
      window.removeEventListener('storage', handleCustomChange);
    };
  }, [refreshState]);

  const openPanel = () => setIsPanelOpen(true);
  const closePanel = () => setIsPanelOpen(false);

  const navigateToStageRoute = (stage: DevSkipStage) => {
    // If target stage is weight modal, trigger the modal state
    if (stage.id === 4) {
      setActiveModalTrigger('weight');
    } else if (stage.id === 10) {
      setActiveModalTrigger('checkin');
    } else {
      setActiveModalTrigger(null);
    }

    if (stage.route && pathname !== stage.route) {
      router.push(stage.route);
    }
  };

  const advanceStage = () => {
    const nextStage = advanceToNextStage();
    setActiveStageState(nextStage);
    setActiveStageId(nextStage.id);
    setActiveOverrides(getOverrides());
    navigateToStageRoute(nextStage);
  };

  const revertStage = () => {
    const prevStage = revertToPrevStage();
    setActiveStageState(prevStage);
    setActiveStageId(prevStage.id);
    setActiveOverrides(getOverrides());
    navigateToStageRoute(prevStage);
  };

  const jumpToStage = (id: number) => {
    const target = setStage(id);
    setActiveStageState(target);
    setActiveStageId(target.id);
    setActiveOverrides(getOverrides());
    navigateToStageRoute(target);
  };

  const applyOverride = (key: string, value: string) => {
    setOverride(key, value);
    setActiveOverrides(getOverrides());
  };

  const resetAllOverrides = () => {
    clearOverrides();
    setActiveOverrides({});
  };

  const seedAll = async () => {
    await seedMockData();
    refreshState();
  };

  const resetToCleanSlate = () => {
    clearMockData();
    jumpToStage(3); // Day 1 Zero state
  };

  const triggerModal = (name: string | null) => {
    setActiveModalTrigger(name);
  };

  const isEnabled = isDevSkip();

  return (
    <DevSkipContext.Provider
      value={{
        isPanelOpen: isEnabled ? isPanelOpen : false,
        openPanel: isEnabled ? openPanel : () => {},
        closePanel: isEnabled ? closePanel : () => {},
        activeStage: isEnabled ? activeStage : DEV_SKIP_STAGES[2],
        activeStageId: isEnabled ? activeStageId : 3,
        totalStages: DEV_SKIP_STAGES.length,
        stages: DEV_SKIP_STAGES,
        advanceStage: isEnabled ? advanceStage : () => {},
        revertStage: isEnabled ? revertStage : () => {},
        jumpToStage: isEnabled ? jumpToStage : () => {},
        applyOverride: isEnabled ? applyOverride : () => {},
        resetAllOverrides: isEnabled ? resetAllOverrides : () => {},
        activeOverrides: isEnabled ? activeOverrides : {},
        isSeeded: isEnabled ? isSeeded : false,
        seedAll: isEnabled ? seedAll : async () => {},
        resetToCleanSlate: isEnabled ? resetToCleanSlate : () => {},
        activeModalTrigger: isEnabled ? activeModalTrigger : null,
        triggerModal: isEnabled ? triggerModal : () => {},
      }}
    >
      {children}
    </DevSkipContext.Provider>
  );
}