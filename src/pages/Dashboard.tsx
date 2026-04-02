import React from 'react';
import { useStore } from '../store/useStore';
import { CheckCircle2, BrainCircuit, ListTodo, Flame, Activity } from 'lucide-react';
import { subDays, format, eachDayOfInterval, startOfToday } from 'date-fns';
import { cn } from '../lib/utils';

export function DashboardView() {
  const { tasks, learningPaths, dailyActivities } = useStore();
  
  const completedTasks = tasks?.filter(t => t.status === 'done').length || 0;
  const totalTasks = tasks?.length || 0;
  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  // Calculate Streak
  const today = startOfToday();
  let currentStreak = 0;
  for (let i = 0; i <= 365; i++) {
    const d = format(subDays(today, i), 'yyyy-MM-dd');
    const act = dailyActivities[d];
    const score = act ? act.tasksCompleted + act.focusSessionsCompleted : 0;
    if (score > 0) {
      currentStreak++;
    } else if (i === 0) {
      // If today has no activity, we don't break the streak yet, 
      // but we don't increment it either.
      continue;
    } else {
      break;
    }
  }

  // 30-Day Heatmap Data
  const last30Days = eachDayOfInterval({
    start: subDays(today, 29),
    end: today
  });

  const getActivityLevel = (dateStr: string) => {
    const activity = dailyActivities[dateStr];
    if (!activity) return 0;
    const score = activity.tasksCompleted + (activity.focusSessionsCompleted * 2);
    if (score === 0) return 0;
    if (score <= 2) return 1;
    if (score <= 4) return 2;
    if (score <= 6) return 3;
    return 4;
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back!</h1>
        <p className="text-slate-500 mt-2">Here's an overview of your tasks and learning progress.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
            <ListTodo className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Tasks</p>
            <p className="text-2xl font-bold text-slate-900">{totalTasks}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Completed</p>
            <p className="text-2xl font-bold text-slate-900">{completedTasks}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Learning Paths</p>
            <p className="text-2xl font-bold text-slate-900">{learningPaths?.length || 0}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Current Streak</p>
            <p className="text-2xl font-bold text-slate-900">{currentStreak} <span className="text-sm font-normal text-slate-500">days</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Task Progress</h2>
          <div className="flex items-center gap-4 mb-2">
            <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm font-medium text-slate-600 w-12 text-right">{progress}%</span>
          </div>
          <p className="text-sm text-slate-500">
            {completedTasks} of {totalTasks} tasks completed
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" />
              30-Day Activity
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-sm bg-slate-100"></div>
                <div className="w-3 h-3 rounded-sm bg-indigo-200"></div>
                <div className="w-3 h-3 rounded-sm bg-indigo-400"></div>
                <div className="w-3 h-3 rounded-sm bg-indigo-600"></div>
                <div className="w-3 h-3 rounded-sm bg-indigo-800"></div>
              </div>
              <span>More</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1.5">
            {last30Days.map(day => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const level = getActivityLevel(dateStr);
              return (
                <div
                  key={dateStr}
                  title={`${format(day, 'MMM d, yyyy')}: Level ${level}`}
                  className={cn(
                    "w-4 h-4 sm:w-5 sm:h-5 rounded-sm transition-colors cursor-help hover:ring-2 hover:ring-offset-1 hover:ring-indigo-400",
                    level === 0 && "bg-slate-100",
                    level === 1 && "bg-indigo-200",
                    level === 2 && "bg-indigo-400",
                    level === 3 && "bg-indigo-600",
                    level === 4 && "bg-indigo-800"
                  )}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
