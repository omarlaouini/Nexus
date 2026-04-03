import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TaskStatus } from '../../types';

interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config: Record<TaskStatus, { label: string; colorClass: string }> = {
    'todo': { label: 'To Do', colorClass: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200' },
    'in-progress': { label: 'In Progress', colorClass: 'bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200' },
    'blocked': { label: 'Blocked', colorClass: 'bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200' },
    'done': { label: 'Done', colorClass: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200' },
  };

  const { label, colorClass } = config[status];

  return (
    <Badge variant="outline" className={`${colorClass} ${className || ''}`}>
      {label}
    </Badge>
  );
}
