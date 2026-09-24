'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Check, 
  ArrowRight, 
  Sliders, 
  Scale, 
  Flame, 
  Activity,
  AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ApiService, AdaptiveCheckInResponse } from '@/services/api';

interface WeeklyCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  checkIn: AdaptiveCheckInResponse | null;
  onApplied?: () => void;
}

export const WeeklyCheckInModal: React.FC<WeeklyCheckInModalProps> = ({
  isOpen,
  onClose,
  checkIn,
  onApplied,
}) => {
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [customCalories, setCustomCalories] = useState<number>(
    checkIn?.suggestedCalories || 2000
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen || !checkIn) return null;

  const handleApply = async (action: 'ACCEPT' | 'ADJUST' | 'DISMISS') => {
    try {
      setLoading(true);
      setError(null);

      await ApiService.applyCheckIn({
        checkInId: checkIn.id,
        action,
        customCalories: action === 'ADJUST' ? customCalories : undefined,
      });

      setSuccessMessage(
        action === 'DISMISS' 
          ? 'Check-in postponed.' 
          : 'New metabolic targets applied successfully!'
      );

      setTimeout(() => {
        setSuccessMessage(null);
        onApplied?.();
        onClose();
      }, 900);
    } catch (err: any) {
      setError(err?.message || 'Failed to process check-in');
    } finally {
      setLoading(false);
    }
  };

  const deltaCalories = Math.round(checkIn.suggestedCalories - checkIn.currentCalories);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl p-6 relative overflow-hidden text-foreground animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <Sparkles className="w-6 h-6 fill-amber-500" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">
              Weekly Metabolic Review
            </span>
            <h2 className="text-xl font-bold tracking-tight text-foreground mt-0.5">
              {checkIn.headline || 'Weekly Target Adjustment'}
            </h2>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-center gap-2 font-semibold">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Rationale & Explanation Card */}
        <div className="p-4 rounded-2xl bg-muted/40 border border-border mb-4 space-y-2">
          <p className="text-xs text-foreground leading-relaxed">
            {checkIn.rationaleText}
          </p>
          <div className="flex items-center gap-4 pt-2 text-[11px] text-muted-foreground border-t border-border/60">
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-primary" />
              <span>Adherence: <strong className="text-foreground">{checkIn.adherenceScore}%</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-primary" />
              <span>Trend Rate: <strong className="text-foreground">{checkIn.trendChangeKg > 0 ? `+${checkIn.trendChangeKg}` : checkIn.trendChangeKg} kg/wk</strong></span>
            </div>
          </div>
        </div>

        {/* Target Comparison: Current vs Recommended */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="p-3.5 rounded-2xl bg-muted/20 border border-border">
            <span className="text-[11px] font-medium text-muted-foreground block mb-1">Current Target</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-muted-foreground">{Math.round(checkIn.currentCalories)}</span>
              <span className="text-xs text-muted-foreground">kcal</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 relative">
            <span className="text-[11px] font-bold text-primary block mb-1">Recommended</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-foreground">
                {isCustomizing ? customCalories : Math.round(checkIn.suggestedCalories)}
              </span>
              <span className="text-xs text-foreground font-semibold">kcal</span>
              {deltaCalories !== 0 && !isCustomizing && (
                <span className={`ml-auto text-xs font-bold ${deltaCalories > 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {deltaCalories > 0 ? `+${deltaCalories}` : deltaCalories}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Custom Calorie Slider (when toggled) */}
        {isCustomizing && (
          <div className="mb-5 p-3.5 rounded-2xl bg-muted/30 border border-border space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">Custom Calorie Target</span>
              <span className="font-bold text-foreground">{customCalories} kcal</span>
            </div>
            <input
              type="range"
              min={1200}
              max={4000}
              step={25}
              value={customCalories}
              onChange={(e) => setCustomCalories(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
          </div>
        )}

        {/* Macro Breakdown Chips */}
        <div className="grid grid-cols-3 gap-2 mb-6 text-center text-xs">
          <div className="p-2.5 rounded-xl bg-muted/30 border border-border">
            <span className="text-[10px] text-muted-foreground block">Protein</span>
            <span className="font-bold text-foreground">{Math.round(checkIn.suggestedProtein)}g</span>
          </div>
          <div className="p-2.5 rounded-xl bg-muted/30 border border-border">
            <span className="text-[10px] text-muted-foreground block">Carbs</span>
            <span className="font-bold text-foreground">{Math.round(checkIn.suggestedCarbs)}g</span>
          </div>
          <div className="p-2.5 rounded-xl bg-muted/30 border border-border">
            <span className="text-[10px] text-muted-foreground block">Fat</span>
            <span className="font-bold text-foreground">{Math.round(checkIn.suggestedFat)}g</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            onClick={() => handleApply(isCustomizing ? 'ADJUST' : 'ACCEPT')}
            disabled={loading}
            className="w-full h-11 rounded-xl font-bold gap-2 text-sm shadow-md"
          >
            {loading ? (
              <span>Updating targets...</span>
            ) : isCustomizing ? (
              <>
                <Check className="w-4 h-4" />
                <span>Apply Custom Target ({customCalories} kcal)</span>
              </>
            ) : (
              <>
                <Flame className="w-4 h-4 fill-primary-foreground" />
                <span>Accept Recommendation ({Math.round(checkIn.suggestedCalories)} kcal)</span>
              </>
            )}
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCustomizing(!isCustomizing)}
              className="flex-1 rounded-xl gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{isCustomizing ? 'Use Suggested' : 'Customize Target'}</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleApply('DISMISS')}
              disabled={loading}
              className="rounded-xl text-xs text-muted-foreground hover:text-foreground"
            >
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
