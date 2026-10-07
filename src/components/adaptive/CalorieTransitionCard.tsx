'use client';

import React, { useState } from 'react';
import { ArrowRight, Sparkles, Scale, FastForward, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CalorieLeadUpSchedule } from '@/utils/calorieTransition';

export interface LeadUpStatus {
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  startDate?: string | null;
  calculatedGoalTarget?: number;
  schedule?: CalorieLeadUpSchedule | null;
  isSuppressed?: boolean;
}

interface CalorieTransitionCardProps {
  leadUpStatus?: LeadUpStatus | null;
  activeTargetCalories?: number;
  onSkipLeadUp?: () => Promise<void> | void;
  onLogWeight?: () => void;
}

export const CalorieTransitionCard: React.FC<CalorieTransitionCardProps> = ({
  leadUpStatus,
  activeTargetCalories,
  onSkipLeadUp,
  onLogWeight,
}) => {
  const [skipping, setSkipping] = useState(false);

  if (!leadUpStatus || !leadUpStatus.isActive) {
    return null;
  }

  const currentStepNum = (leadUpStatus.currentStep ?? 0) + 1;
  const totalSteps = leadUpStatus.totalSteps || 1;
  const progressPercent = Math.min(100, Math.round((currentStepNum / totalSteps) * 100));
  const goalTarget = leadUpStatus.calculatedGoalTarget || leadUpStatus.schedule?.calculatedTarget;
  const scheduleSteps = leadUpStatus.schedule?.steps || [];

  const handleSkip = async () => {
    if (!onSkipLeadUp) return;
    try {
      setSkipping(true);
      await onSkipLeadUp();
    } finally {
      setSkipping(false);
    }
  };

  return (
    <div className="w-full rounded-2xl bg-card border border-emerald-500/30 p-4 sm:p-5 shadow-sm transition-all relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Calorie Transition Plan</span>
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Step {currentStepNum} of {totalSteps}
            </span>
            {leadUpStatus.schedule?.gapClass && (
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono bg-zinc-800/80 px-2 py-0.2 rounded-full border border-zinc-700/50">
                {leadUpStatus.schedule.gapClass} GAP
              </span>
            )}
          </div>

          <h3 className="text-base sm:text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
            <span>Current target: {activeTargetCalories ?? leadUpStatus.schedule?.steps[leadUpStatus.currentStep]?.targetCalories} kcal</span>
            {goalTarget && (
              <span className="text-xs font-normal text-muted-foreground flex items-center gap-1 font-mono">
                <ArrowRight className="w-3 h-3 text-emerald-400" />
                Goal: {goalTarget} kcal
              </span>
            )}
          </h3>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Your daily target is stepping gradually toward your goal target to ease metabolic and dietary adaptation. GramGains calibrates your true expenditure simultaneously.
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
          {onLogWeight && (
            <Button
              size="sm"
              variant="outline"
              onClick={onLogWeight}
              className="text-xs h-9 gap-1.5 rounded-xl border-border hover:bg-accent"
            >
              <Scale className="w-3.5 h-3.5 text-emerald-400" />
              <span>Log Weight</span>
            </Button>
          )}

          {onSkipLeadUp && (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleSkip}
              disabled={skipping}
              className="text-xs h-9 gap-1.5 rounded-xl bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>{skipping ? 'Skipping...' : 'Skip to Goal'}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Visual Step Progress Bar & Step Indicators */}
      <div className="mt-4 pt-3 border-t border-border/50 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
          <span>Transition Progress</span>
          <span className="text-emerald-400 font-semibold">{progressPercent}% Complete</span>
        </div>

        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Step pills if schedule steps available */}
        {scheduleSteps.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1">
            {scheduleSteps.map((step, idx) => {
              const isPast = idx < leadUpStatus.currentStep;
              const isCurrent = idx === leadUpStatus.currentStep;
              return (
                <div
                  key={step.weekNumber}
                  className={`text-[10px] sm:text-[11px] px-2 py-1 rounded-lg border flex items-center justify-between ${
                    isCurrent
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300 font-semibold'
                      : isPast
                      ? 'bg-zinc-900/60 border-zinc-800 text-zinc-400'
                      : 'bg-zinc-900/30 border-zinc-800/40 text-zinc-500'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    {isPast && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                    Week {step.weekNumber}
                  </span>
                  <span className="font-mono">{step.targetCalories} kcal</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalorieTransitionCard;
