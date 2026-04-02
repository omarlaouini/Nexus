import React from 'react';
import { Badge } from './ui/badge';
import { TaskStatus } from '@/src/types';

interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config: Record<TaskStatus, { label: string; className: string }> = {
    'todo': { label: 'To Do', className: 'bg-slate-100 text-slate-700 hover:bg-slate-100' },
    'in-progress': { label: 'In Progress', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
    'blocked': { label: 'Blocked', className: 'bg-rose-100 text-rose-700 hover:bg-rose-100' },
    'done': { label: 'Done', className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' },
  };

  const { label, className: colorClass } = config[status];

  return (
    <Badge variant="outline" className={`${colorClass} border-none font-medium ${className}`}>
      {label}
    </Badge>
  );
}
