import React from 'react';
import { Progress } from './ui/progress';

interface ProgressBarProps {
  value: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

export function ProgressBar({ value, label, showPercentage = true, className }: ProgressBarProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-sm font-medium text-slate-600">
          {label && <span>{label}</span>}
          {showPercentage && <span>{Math.round(value)}%</span>}
        </div>
      )}
      <Progress value={value} className="h-2" />
    </div>
  );
}
