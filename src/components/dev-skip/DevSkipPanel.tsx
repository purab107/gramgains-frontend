'use client';

import React, { useState } from 'react';
import { useDevSkip } from './DevSkipProvider';
import { isDevSkip } from '@/lib/dev-skip';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Bug,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Scale,
  Calendar,
  Layers,
  UtensilsCrossed,
  BarChart3,
  SlidersHorizontal,
  Flame,
  RotateCcw,
  Zap,
  Bookmark,
  ExternalLink,
  Plus
} from 'lucide-react';

export function DevSkipPanel() {
  if (!isDevSkip()) {
    return null;
  }

  const {
    isPanelOpen,
    closePanel,
    activeStage,
    activeStageId,
    totalStages,
    stages,
    advanceStage,
    revertStage,
    jumpToStage,
    applyOverride,
    resetAllOverrides,
    activeOverrides,
    seedAll,
    resetToCleanSlate,
    triggerModal,
  } = useDevSkip();

  const [activeTab, setActiveTab] = useState<'journey' | 'matrix' | 'tools'>('journey');

  return (
    <Sheet open={isPanelOpen} onOpenChange={closePanel}>
      <SheetContent side="right" className="w-[420px] sm:w-[480px] p-0 flex flex-col bg-card border-border">
        {/* Header */}
        <SheetHeader className="p-5 pb-3 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-500 border border-amber-500/30">
                <Bug className="h-4 w-4" />
              </div>
              <div>
                <SheetTitle className="text-base font-bold flex items-center gap-2">
                  Dev Skip Simulator
                  <Badge variant="outline" className="text-[10px] text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-mono">
                    UI MODE
                  </Badge>
                </SheetTitle>
                <SheetDescription className="text-xs">
                  Inspect pages & states in exact user lifecycle sequence
                </SheetDescription>
              </div>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="grid grid-cols-3 gap-1 p-1 mt-3 bg-muted/60 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setActiveTab('journey')}
              className={`py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'journey'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Journey ({activeStageId}/{totalStages})
            </button>
            <button
              onClick={() => setActiveTab('matrix')}
              className={`py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'matrix'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-blue-500" />
              State Matrix
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'tools'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Zap className="h-3.5 w-3.5 text-emerald-500" />
              Modals & Data
            </button>
          </div>
        </SheetHeader>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* TAB 1: JOURNEY ROADMAP */}
          {activeTab === 'journey' && (
            <div className="space-y-4">
              {/* Active Stage Card Highlight */}
              <div className="p-4 rounded-xl bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 tracking-wide uppercase">
                    CURRENT STAGE
                  </span>
                  <Badge variant="secondary" className="text-[10px] font-mono">
                    {activeStage.route}
                  </Badge>
                </div>
                <h4 className="text-sm font-bold text-foreground">{activeStage.name}</h4>
                <p className="text-xs text-muted-foreground">{activeStage.description}</p>

                <div className="pt-2 flex flex-wrap gap-1.5">
                  {activeStage.uiHighlights.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-background/80 text-foreground border border-border"
                    >
                      <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />
                      {item}
                    </span>
                  ))}
                </div>

                <div className="pt-3 flex gap-2">
                  <Button
                    onClick={revertStage}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    disabled={!activeStage.prevStageId}
                  >
                    <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                    Previous
                  </Button>
                  <Button
                    onClick={advanceStage}
                    size="sm"
                    className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                  >
                    DEV SKIP: {activeStage.actionButtonLabel}
                    <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              </div>

              {/* 12 Stages Sequential Roadmap List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Full 12-Step Chronological Journey
                </h4>
                <div className="space-y-1.5">
                  {stages.map((stage) => {
                    const isActive = stage.id === activeStageId;
                    const isPast = stage.id < activeStageId;

                    return (
                      <div
                        key={stage.id}
                        onClick={() => jumpToStage(stage.id)}
                        className={`p-3 rounded-lg border text-left cursor-pointer transition-all flex items-start gap-3 ${
                          isActive
                            ? 'bg-amber-500/10 border-amber-500/60 shadow-sm'
                            : isPast
                            ? 'bg-card/50 border-border/60 hover:bg-muted/40 opacity-85'
                            : 'bg-card border-border hover:bg-muted/40'
                        }`}
                      >
                        <div
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            isActive
                              ? 'bg-amber-500 text-white shadow-sm'
                              : isPast
                              ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/40'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {isPast ? '✓' : stage.id}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-foreground truncate">
                              {stage.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {stage.route}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground line-clamp-1">
                            {stage.subtitle}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STATE MATRIX (CONTEXTUAL OVERRIDES) */}
          {activeTab === 'matrix' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Contextual State Overrides
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Switch specific component states instantly
                  </p>
                </div>
                <Button
                  onClick={resetAllOverrides}
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[11px] text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset Overrides
                </Button>
              </div>

              {/* Dashboard State Overrides */}
              <div className="space-y-2 p-3 rounded-lg border border-border bg-muted/20">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 text-orange-500" />
                  Dashboard Calorie State
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { key: 'empty', label: '0 kcal (Day 1 Empty)' },
                    { key: 'breakfast', label: '460 kcal (Breakfast)' },
                    { key: 'midday', label: '1,180 kcal (Midday)' },
                    { key: 'complete', label: '1,980 kcal (Goal Met)' },
                    { key: 'overbudget', label: '2,550 kcal (Over Budget)' },
                  ].map((s) => (
                    <Button
                      key={s.key}
                      onClick={() => applyOverride('dashboardState', s.key)}
                      variant={
                        (activeOverrides.dashboardState || activeStage.mockState.dashboardState) === s.key
                          ? 'default'
                          : 'outline'
                      }
                      size="sm"
                      className="text-[11px] h-7 justify-start truncate"
                    >
                      {s.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Daily Tracker State Overrides */}
              <div className="space-y-2 p-3 rounded-lg border border-border bg-muted/20">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <UtensilsCrossed className="h-3.5 w-3.5 text-emerald-500" />
                  Tracker Logs State
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { key: 'empty', label: 'Empty Tracker' },
                    { key: 'breakfast', label: 'Breakfast Logged' },
                    { key: 'midday', label: 'Lunch & Snack' },
                    { key: 'complete', label: 'All 4 Meals Logged' },
                  ].map((s) => (
                    <Button
                      key={s.key}
                      onClick={() => applyOverride('trackerState', s.key)}
                      variant={
                        (activeOverrides.trackerState || activeStage.mockState.trackerState) === s.key
                          ? 'default'
                          : 'outline'
                      }
                      size="sm"
                      className="text-[11px] h-7 justify-start truncate"
                    >
                      {s.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Analytics History State */}
              <div className="space-y-2 p-3 rounded-lg border border-border bg-muted/20">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <BarChart3 className="h-3.5 w-3.5 text-blue-500" />
                  Analytics Timeline State
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <Button
                    onClick={() => applyOverride('analyticsState', 'empty')}
                    variant={
                      (activeOverrides.analyticsState || activeStage.mockState.analyticsState) === 'empty'
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    className="text-[11px] h-7 justify-start"
                  >
                    &lt; 7 Days (Uncalibrated)
                  </Button>
                  <Button
                    onClick={() => applyOverride('analyticsState', 'populated_deficit')}
                    variant={
                      (activeOverrides.analyticsState || activeStage.mockState.analyticsState) !== 'empty'
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    className="text-[11px] h-7 justify-start"
                  >
                    30 Days Active Deficit
                  </Button>
                </div>
              </div>

              {/* Saved Meals State */}
              <div className="space-y-2 p-3 rounded-lg border border-border bg-muted/20">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Bookmark className="h-3.5 w-3.5 text-purple-500" />
                  Saved Meals Library State
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <Button
                    onClick={() => applyOverride('savedMealsState', 'empty')}
                    variant={
                      (activeOverrides.savedMealsState || activeStage.mockState.savedMealsState) === 'empty'
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    className="text-[11px] h-7 justify-start"
                  >
                    Empty State (Graphic)
                  </Button>
                  <Button
                    onClick={() => applyOverride('savedMealsState', 'populated')}
                    variant={
                      (activeOverrides.savedMealsState || activeStage.mockState.savedMealsState) === 'populated'
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    className="text-[11px] h-7 justify-start"
                  >
                    3 High-Protein Templates
                  </Button>
                </div>
              </div>

              {/* Notification Banners */}
              <div className="space-y-2 p-3 rounded-lg border border-border bg-muted/20">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-amber-500" />
                  Prompt Banners
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <Button
                    onClick={() =>
                      applyOverride(
                        'hasPendingWeight',
                        activeOverrides.hasPendingWeight === 'true' ? 'false' : 'true'
                      )
                    }
                    variant={activeOverrides.hasPendingWeight === 'true' ? 'default' : 'outline'}
                    size="sm"
                    className="text-[11px] h-7 justify-start"
                  >
                    Weigh-In Banner
                  </Button>
                  <Button
                    onClick={() =>
                      applyOverride(
                        'hasPendingCheckIn',
                        activeOverrides.hasPendingCheckIn === 'true' ? 'false' : 'true'
                      )
                    }
                    variant={activeOverrides.hasPendingCheckIn === 'true' ? 'default' : 'outline'}
                    size="sm"
                    className="text-[11px] h-7 justify-start"
                  >
                    Check-In Banner
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MODALS & DATA CONTROLS */}
          {activeTab === 'tools' && (
            <div className="space-y-5">
              {/* Direct Modal Triggers */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Test Interactive Modals
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    onClick={() => {
                      triggerModal('weight');
                      closePanel();
                    }}
                    variant="outline"
                    className="justify-start text-xs h-9"
                  >
                    <Scale className="h-4 w-4 mr-2 text-emerald-500" />
                    Open Daily Weight Modal
                  </Button>
                  <Button
                    onClick={() => {
                      triggerModal('checkin');
                      closePanel();
                    }}
                    variant="outline"
                    className="justify-start text-xs h-9"
                  >
                    <Sparkles className="h-4 w-4 mr-2 text-amber-500" />
                    Open Weekly Adaptive Check-In Modal
                  </Button>
                  <Button
                    onClick={() => {
                      triggerModal('food');
                      closePanel();
                    }}
                    variant="outline"
                    className="justify-start text-xs h-9"
                  >
                    <Plus className="h-4 w-4 mr-2 text-blue-500" />
                    Open Meal Logger / Food Modal
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Data Presets & Reset */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Global Mock Data Presets
                </h4>
                <div className="space-y-2">
                  <Button
                    onClick={seedAll}
                    variant="outline"
                    className="w-full justify-start text-xs h-9 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500" />
                    Populate Full 30-Day History (Stage 7)
                  </Button>
                  <Button
                    onClick={resetToCleanSlate}
                    variant="outline"
                    className="w-full justify-start text-xs h-9 text-red-500 border-red-500/30"
                  >
                    <RotateCcw className="h-4 w-4 mr-2 text-red-500" />
                    Reset to Clean Slate (Day 1 Zero State)
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-border bg-muted/20 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Active Mode: Mock Frontend UI</span>
          <span>Stage {activeStageId} of {totalStages}</span>
        </div>
      </SheetContent>
    </Sheet>
  );
}