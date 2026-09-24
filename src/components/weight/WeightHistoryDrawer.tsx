'use client';

import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  EyeOff, 
  Eye, 
  Scale, 
  AlertCircle, 
  Check 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ApiService, WeightLogEntry } from '@/services/api';

interface WeightHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  logs: WeightLogEntry[];
  onRefresh?: () => void;
}

export const WeightHistoryDrawer: React.FC<WeightHistoryDrawerProps> = ({
  isOpen,
  onClose,
  logs = [],
  onRefresh,
}) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleToggleExclude = async (id?: string) => {
    if (!id) return;
    try {
      setLoadingId(id);
      setError(null);
      await ApiService.toggleWeightExclusion(id);
      onRefresh?.();
    } catch (err: any) {
      setError(err?.message || 'Failed to toggle exclusion');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this weight log?')) return;
    try {
      setLoadingId(id);
      setError(null);
      await ApiService.deleteWeightLog(id);
      onRefresh?.();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete weight log');
    } finally {
      setLoadingId(null);
    }
  };

  const reversedLogs = [...logs].reverse();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md h-full bg-card border-l border-border p-6 flex flex-col justify-between overflow-hidden shadow-2xl animate-in slide-in-from-right duration-200 text-foreground"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Weight History &amp; Outliers</h3>
                <p className="text-xs text-muted-foreground">{logs.length} recorded entries</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="my-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Explanation Tip */}
          <div className="my-3 p-3 rounded-xl bg-muted/40 border border-border text-[11px] text-muted-foreground leading-relaxed">
            💡 <strong>Pro Tip:</strong> Had an unusually salty meal or gastrointestinal flare-up? Click the <strong>Exclude</strong> eye icon to omit temporary water spikes from skewing your adaptive TDEE calculation.
          </div>

          {/* Table / List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {reversedLogs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-xs">
                No weigh-in logs recorded yet.
              </div>
            ) : (
              reversedLogs.map((log) => {
                const isItemLoading = loadingId === log.id;
                const formattedDate = new Date(log.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                });

                return (
                  <div
                    key={log.id || log.date}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      log.isExcluded
                        ? 'bg-muted/20 border-dashed border-border opacity-60'
                        : 'bg-card border-border hover:border-primary/40'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground">{formattedDate}</span>
                        {log.isExcluded && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500/10 text-amber-600">
                            Excluded
                          </span>
                        )}
                      </div>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-base font-extrabold text-foreground">{log.rawWeightKg} kg</span>
                        <span className="text-xs text-emerald-600 font-medium">Trend: {log.trendWeightKg} kg</span>
                      </div>
                      {log.note && (
                        <p className="text-[10px] text-muted-foreground italic truncate mt-0.5">
                          &quot;{log.note}&quot;
                        </p>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={isItemLoading}
                        onClick={() => handleToggleExclude(log.id)}
                        className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                        title={log.isExcluded ? 'Include in trend' : 'Exclude from trend'}
                      >
                        {log.isExcluded ? <Eye className="w-4 h-4 text-primary" /> : <EyeOff className="w-4 h-4" />}
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={isItemLoading}
                        onClick={() => handleDelete(log.id)}
                        className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive"
                        title="Delete log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-border mt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full rounded-xl"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
