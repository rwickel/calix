import React from 'react';
import { formatTime } from '@/types/timer';
import { Minus, Plus } from 'lucide-react';

interface TimeInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  colorClass?: string;
}

export const TimeInput: React.FC<TimeInputProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 3600,
  step = 5,
  colorClass = 'text-primary',
}) => {
  const handleIncrement = () => {
    onChange(Math.min(max, value + step));
  };

  const handleDecrement = () => {
    onChange(Math.max(min, value - step));
  };

  return (
    <div className="flex flex-col gap-2">
      <label className={`text-sm font-medium ${colorClass}`}>{label}</label>
      <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-2">
        <button
          onClick={handleDecrement}
          className="flex h-10 w-10 items-center justify-center rounded-md bg-background/50 text-foreground transition-colors hover:bg-background active:scale-95"
        >
          <Minus className="h-5 w-5" />
        </button>
        <div className={`flex-1 text-center font-mono text-2xl font-bold ${colorClass}`}>
          {formatTime(value)}
        </div>
        <button
          onClick={handleIncrement}
          className="flex h-10 w-10 items-center justify-center rounded-md bg-background/50 text-foreground transition-colors hover:bg-background active:scale-95"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
