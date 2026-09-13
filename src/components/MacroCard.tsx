import React from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

interface MacroCardProps {
  label: string;
  value: number;
  unit: string;
  target?: number;
  color?: string;
}

export const MacroCard: React.FC<MacroCardProps> = ({ label, value, unit, target, color }) => {
  const percentage = target ? Math.min(Math.round((value / target) * 100), 100) : 0;

  const getMacroColor = () => {
    if (color) return color;
    const l = label.toUpperCase();
    if (l.includes('PROTEIN')) return '#2873e5';
    if (l.includes('CARB')) return '#f15359';
    if (l.includes('FAT')) return '#feb111';
    if (l.includes('FIBER')) return '#4cd593';
    return '#0f8651';
  };

  const macroColor = getMacroColor();

  return (
    <Card className="hover:border-primary/40 transition-all flex flex-col justify-between">
      <CardContent className="pt-4 flex flex-col gap-3">
        {/* Header row */}
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: macroColor }} />
            {label}
          </span>
          {target && (
            <Badge 
              variant="secondary" 
              className="normal-case tracking-normal font-mono"
              style={{ backgroundColor: `${macroColor}15`, color: macroColor, borderColor: `${macroColor}40` }}
            >
              {percentage}%
            </Badge>
          )}
        </div>

        {/* Value row */}
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold font-mono text-foreground">
            {value}
          </span>
          <span className="text-xs text-muted-foreground font-medium">{unit}</span>
          {target && (
            <span className="text-xs font-mono text-muted-foreground ml-auto">
              / {target}{unit}
            </span>
          )}
        </div>

        {/* Progress bar */}
        {target && (
          <Progress 
            value={value} 
            max={target} 
            className="h-2 mt-1" 
            indicatorStyle={{ backgroundColor: macroColor }}
          />
        )}
      </CardContent>
    </Card>
  );
};
