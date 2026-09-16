'use client';

import React, { useState } from 'react';
import { WaterLogItem, ApiService } from '@/services/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Droplets, 
  Plus, 
  Trash2, 
  Loader2, 
  Sparkles, 
  GlassWater, 
  CheckCircle2 
} from 'lucide-react';

interface WaterTrackerSectionProps {
  selectedDate: string;
  waterLogs: WaterLogItem[];
  waterTotalMl: number;
  targetMl?: number;
  onWaterUpdated: () => void;
}

export function WaterTrackerSection({
  selectedDate,
  waterLogs,
  waterTotalMl,
  targetMl = 3000,
  onWaterUpdated,
}: WaterTrackerSectionProps) {
  const [customMl, setCustomMl] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [logging, setLogging] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const percentage = Math.min(Math.round((waterTotalMl / (targetMl || 1)) * 100), 100);
  const remaining = Math.max(0, targetMl - waterTotalMl);
  const isCompleted = waterTotalMl >= targetMl;

  const handleAddWater = async (amount: number) => {
    if (!amount || amount <= 0) return;
    try {
      setLogging(true);
      await ApiService.logWater({
        date: selectedDate,
        amountMl: amount,
      });
      setShowCustomInput(false);
      setCustomMl('');
      onWaterUpdated();
    } catch (err) {
      console.error('Failed to log water:', err);
      alert('Could not log water. Please try again.');
    } finally {
      setLogging(false);
    }
  };

  const handleDeleteWater = async (id: string) => {
    try {
      setDeletingId(id);
      await ApiService.deleteWater(id);
      onWaterUpdated();
    } catch (err) {
      console.error('Failed to delete water log:', err);
      alert('Could not delete water log.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card className="border border-cyan-100 shadow-sm bg-gradient-to-b from-cyan-50/30 via-white to-white overflow-hidden rounded-2xl">
      <CardHeader className="pb-3 border-b border-cyan-100/60 bg-gradient-to-r from-cyan-50/60 to-white px-5 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-100 text-cyan-700 shadow-2xs">
              <Droplets className="w-5 h-5 fill-cyan-600/30 text-cyan-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-bold text-slate-900 leading-none">
                  Water & Hydration
                </CardTitle>
                {isCompleted ? (
                  <Badge variant="outline" className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Goal Reached!
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] font-bold px-2 py-0.5 bg-cyan-50 text-cyan-700 border-cyan-200">
                    {percentage}%
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Stay hydrated throughout the day</p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs bg-white px-3 py-1.5 rounded-xl border border-cyan-200/80 shadow-2xs self-start sm:self-auto">
            <span className="font-bold text-cyan-900">{waterTotalMl.toLocaleString()} ml</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-500">{targetMl.toLocaleString()} ml</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Visual Progress Bar */}
        <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-cyan-100 shadow-2xs">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <GlassWater className="w-4 h-4 text-cyan-600" />
              Daily Hydration Status
            </span>
            <span className="text-xs font-mono font-bold text-cyan-700">
              {remaining > 0 ? `${remaining.toLocaleString()} ml remaining` : 'Optimal hydration met'}
            </span>
          </div>
          <Progress
            value={percentage}
            max={100}
            className="h-3 bg-cyan-100/50"
            indicatorClassName="bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-500 shadow-sm"
          />
        </div>

        {/* Quick Add Buttons */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
            Quick Add Water
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Button
              onClick={() => handleAddWater(250)}
              disabled={logging}
              variant="outline"
              className="h-9 px-2 bg-white hover:bg-cyan-50 hover:border-cyan-300 border-slate-200 text-slate-800 text-xs font-bold rounded-xl shadow-2xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5 text-cyan-600" />
              <span>+250 ml (Cup)</span>
            </Button>

            <Button
              onClick={() => handleAddWater(500)}
              disabled={logging}
              variant="outline"
              className="h-9 px-2 bg-white hover:bg-cyan-50 hover:border-cyan-300 border-slate-200 text-slate-800 text-xs font-bold rounded-xl shadow-2xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5 text-cyan-600" />
              <span>+500 ml (Bottle)</span>
            </Button>

            <Button
              onClick={() => handleAddWater(750)}
              disabled={logging}
              variant="outline"
              className="h-9 px-2 bg-white hover:bg-cyan-50 hover:border-cyan-300 border-slate-200 text-slate-800 text-xs font-bold rounded-xl shadow-2xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5 text-cyan-600" />
              <span>+750 ml (Flask)</span>
            </Button>

            <Button
              onClick={() => setShowCustomInput(!showCustomInput)}
              variant="outline"
              className={`h-9 px-2 border text-xs font-bold rounded-xl shadow-2xs flex items-center justify-center gap-1.5 active:scale-95 transition-all ${
                showCustomInput
                  ? 'bg-cyan-600 text-white border-cyan-600 hover:bg-cyan-700'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <span>+ Custom ml</span>
            </Button>
          </div>
        </div>

        {/* Custom Input Drawer */}
        {showCustomInput && (
          <div className="p-3 bg-white border border-cyan-200 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
            <input
              type="number"
              placeholder="e.g. 350 ml"
              min="1"
              value={customMl}
              onChange={(e) => setCustomMl(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            <Button
              onClick={() => handleAddWater(parseInt(customMl, 10))}
              disabled={logging || !customMl}
              className="h-8 px-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-lg shadow-sm"
            >
              {logging ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Add'}
            </Button>
          </div>
        )}

        {/* Water Log Entries List */}
        {waterLogs && waterLogs.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Today&apos;s Water Logs ({waterLogs.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {waterLogs.map((log) => {
                const isDeleting = deletingId === log.id;
                return (
                  <div
                    key={log.id}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-cyan-200/80 text-xs font-mono font-semibold text-slate-800 shadow-2xs group hover:border-rose-200 transition-all"
                  >
                    <Droplets className="w-3 h-3 text-cyan-600" />
                    <span>+{log.amountMl}ml</span>
                    <button
                      onClick={() => handleDeleteWater(log.id)}
                      disabled={isDeleting}
                      title="Delete entry"
                      className="ml-1 text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      {isDeleting ? (
                        <Loader2 className="w-3 h-3 animate-spin text-rose-500" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
