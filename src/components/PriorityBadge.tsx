import React from 'react';
import { Badge } from './ui/badge';
import { PriorityLevel } from '@/src/types';

interface PriorityBadgeProps {
  priority: PriorityLevel;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config: Record<PriorityLevel, { label: string; variant: "destructive" | "default" | "secondary" | "outline" }> = {
    'urgent-important': { label: 'Urgent & Important', variant: 'destructive' },
    'urgent-not-important': { label: 'Urgent', variant: 'default' },
    'not-urgent-important': { label: 'Important', variant: 'secondary' },
    'not-urgent-not-important': { label: 'Backlog', variant: 'outline' },
    'none': { label: 'No Priority', variant: 'outline' },
  };

  const { label, variant } = config[priority];

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}
