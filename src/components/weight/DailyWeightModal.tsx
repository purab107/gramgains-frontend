'use client';

import React, { useState, useEffect } from 'react';
import { 
  Scale, 
  X, 
  Plus, 
  Minus, 
  Sparkles, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ApiService } from '@/services/api';

interface DailyWeightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogged?: (weightKg: number) => void;
  initialWeight?: number;
  date?: string;
}

export const DailyWeightModal: React.FC<DailyWeightModalProps> = ({
  isOpen,
  onClose,
  onLogged,
  initialWeight = 70.0,
  date = new Date().toISOString().split('T')[0],
}) => {
  const [weight, setWeight] = useState<number>(initialWeight);
  const [note, setNote] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (initialWeight > 0) {
      setWeight(initialWeight);
    }
  }, [initialWeight]);

  if (!isOpen) return null;

  const handleAdjust = (delta: number) => {
    setWeight((prev) => Math.round((Math.max(30, Math.min(250, prev + delta))) * 10) / 10);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight || weight <= 0) {
      setError('Please enter a valid weight');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await ApiService.logWeight({
        date,
        weightKg: Number(weight),
        note: note.trim() || undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onLogged?.(Number(weight));
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err?.message || 'Failed to log weight');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Record dismissal for today in localStorage
    const todayStr = new Date().toISOString().split('T')[0];
    localStorage.setItem(`gramgains_weight_dismissed_${todayStr}`, 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl p-6 relative overflow-hidden text-foreground animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-1.5">
              <span>Today&apos;s Weigh-In</span>
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
            </h2>
            <p className="text-xs text-muted-foreground">
              Fasted morning scale reading for adaptive calculation.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Main Stepper Weight Control */}
          <div className="flex items-center justify-center gap-4 bg-muted/30 border border-border rounded-2xl p-4">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => handleAdjust(-0.1)}
              className="h-11 w-11 rounded-xl text-foreground hover:border-primary shrink-0"
              aria-label="Decrease 0.1 kg"
            >
              <Minus className="w-5 h-5" />
            </Button>

            <div className="flex flex-col items-center">
              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  step="0.1"
                  min="30"
                  max="250"
                  value={weight}
                  onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                  className="w-28 text-center text-4xl font-extrabold tracking-tight bg-transparent text-foreground focus:outline-none focus:ring-1 focus:ring-primary rounded-lg"
                />
                <span className="text-sm font-semibold text-muted-foreground">kg</span>
              </div>
              <span className="text-[11px] text-muted-foreground mt-0.5">Scale weight</span>
            </div>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => handleAdjust(0.1)}
              className="h-11 w-11 rounded-xl text-foreground hover:border-primary shrink-0"
              aria-label="Increase 0.1 kg"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>

          {/* Quick Step Pills */}
          <div className="flex items-center justify-center gap-2">
            {[-0.5, -0.2, 0.2, 0.5].map((step) => (
              <button
                key={step}
                type="button"
                onClick={() => handleAdjust(step)}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
              >
                {step > 0 ? `+${step}` : step} kg
              </button>
            ))}
          </div>

          {/* Optional Note */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Quick Note (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Salty dinner yesterday, leg day soreness"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              maxLength={100}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleSkip}
              className="flex-1 rounded-xl text-muted-foreground hover:text-foreground"
            >
              Skip for Today
            </Button>

            <Button
              type="submit"
              disabled={loading || success}
              className="flex-1 rounded-xl gap-2 font-semibold shadow-md"
            >
              {success ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Logged!</span>
                </>
              ) : loading ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Scale className="w-4 h-4" />
                  <span>Log {weight} kg</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
