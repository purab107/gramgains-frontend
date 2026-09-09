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

export const MacroCard: React.FC<MacroCardProps> = ({ label, value, unit, target }) => {
  const percentage = target ? Math.min(Math.round((value / target) * 100), 100) : 0;

  return (
    <Card className="hover:border-primary/40 transition-all flex flex-col justify-between">
      <CardContent className="pt-4 flex flex-col gap-3">
        {/* Header row */}
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
          {target && (
            <Badge variant="secondary" className="normal-case tracking-normal font-mono">
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
          <Progress value={value} max={target} className="h-2 mt-1" />
        )}
      </CardContent>
    </Card>
  );
};
