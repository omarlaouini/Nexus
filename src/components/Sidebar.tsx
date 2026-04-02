import React from 'react';
import { LayoutDashboard, CheckSquare, BrainCircuit, Settings } from 'lucide-react';
import { cn } from '../lib/utils';

export type ViewType = 'dashboard' | 'tasks' | 'learning';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'learning', label: 'Learning Hub', icon: BrainCircuit },
  ] as const;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800">
      <div className="p-6 flex items-center gap-3 text-white">
        <div className="bg-indigo-500 p-2 rounded-lg">
          <BrainCircuit className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight">Nexus</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium",
                isActive 
                  ? "bg-indigo-500/10 text-indigo-400" 
                  : "hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-indigo-400" : "text-slate-400")} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-white transition-colors text-sm font-medium">
          <Settings className="w-5 h-5 text-slate-400" />
          Settings
        </button>
      </div>
    </aside>
  );
}
