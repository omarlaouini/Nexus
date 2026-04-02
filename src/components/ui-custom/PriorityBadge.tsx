import React from 'react';
import { Badge } from '../ui/badge';
import { PriorityLevel } from '../../types';

interface PriorityBadgeProps {
  priority: PriorityLevel;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config: Record<PriorityLevel, { label: string; variant: "default" | "secondary" | "destructive" | "outline", colorClass: string }> = {
    'urgent-important': { label: 'Urgent & Important', variant: 'destructive', colorClass: 'bg-red-500 hover:bg-red-600 text-white' },
    'urgent-not-important': { label: 'Urgent', variant: 'secondary', colorClass: 'bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200' },
    'not-urgent-important': { label: 'Important', variant: 'secondary', colorClass: 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200' },
    'not-urgent-not-important': { label: 'Backlog', variant: 'outline', colorClass: 'text-slate-500 border-slate-200' },
    'none': { label: 'No Priority', variant: 'outline', colorClass: 'text-slate-400 border-slate-200' },
  };

  const { label, colorClass } = config[priority];

  return (
    <Badge variant="outline" className={`${colorClass} ${className || ''}`}>
      {label}
    </Badge>
  );
}
