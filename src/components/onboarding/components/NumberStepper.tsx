import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface NumberStepperProps {
  label: string;
  sublabel: string;
  value: number;
  min: number;
  max: number;
  stepValue?: number;
  unit?: string;
  onChange: (value: number) => void;
}

export const NumberStepper: React.FC<NumberStepperProps> = ({
  label,
  sublabel,
  value,
  min,
  max,
  stepValue = 1,
  unit,
  onChange,
}) => {
  const handleDecrement = () => {
    onChange(Math.max(min, value - stepValue));
  };

  const handleIncrement = () => {
    onChange(Math.min(max, value + stepValue));
  };

  return (
    <div className="py-3.5 sm:py-4 flex items-center justify-between">
      <div>
        <div className="text-base sm:text-lg font-medium text-white">{label}</div>
        <div className="text-xs sm:text-sm text-zinc-500">{sublabel}</div>
      </div>
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
          className="h-10 w-10 rounded-full border border-zinc-700/80 bg-[#0E1513] flex items-center justify-center text-zinc-300 hover:border-zinc-500 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed transition-all active:scale-90"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-14 text-center text-xl font-bold font-mono text-white">
          {value}
        </span>
        <button
          type="button"
          onClick={handleIncrement}
          disabled={value >= max}
          aria-label={`Increase ${label}`}
          className="h-10 w-10 rounded-full border border-zinc-700/80 bg-[#0E1513] flex items-center justify-center text-zinc-300 hover:border-zinc-500 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed transition-all active:scale-90"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default NumberStepper;
