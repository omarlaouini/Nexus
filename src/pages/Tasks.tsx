import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { CheckCircle2, Circle, Clock, Trash2, Plus, Edit2, Calendar, Tag, Repeat, Play } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { PriorityBadge } from '../components/ui-custom/PriorityBadge';
import { StatusBadge } from '../components/ui-custom/StatusBadge';
import { PriorityLevel, TaskStatus, Task } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { FocusTimer } from '../components/FocusTimer';

export function TasksView() {
  const { tasks, addTask, updateTask, deleteTask } = useStore();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [timerConfig, setTimerConfig] = useState<{isOpen: boolean, refId: string, title: string} | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('none');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('daily');

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('');
    setPriority('none');
    setStatus('todo');
    setIsRecurring(false);
    setRecurrencePattern('daily');
  };

  const openAddModal = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setCategory(task.category || '');
    setPriority(task.priority);
    setStatus(task.status);
    setIsRecurring(task.isRecurring);
    setRecurrencePattern(task.recurrencePattern || 'daily');
    setIsEditOpen(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingTask) {
      updateTask(editingTask.id, {
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        priority,
        status,
        isRecurring,
        recurrencePattern: isRecurring ? recurrencePattern : undefined,
      });
      setIsEditOpen(false);
    } else {
      addTask({
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        priority,
        status,
        isRecurring,
        recurrencePattern: isRecurring ? recurrencePattern : undefined,
      });
      setIsAddOpen(false);
    }
    resetForm();
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Tasks</h1>
          <p className="text-slate-500 mt-2">Manage your daily tasks, priorities, and recurring habits.</p>
        </div>
        <Button onClick={openAddModal} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
          <Plus className="w-4 h-4" /> Add Task
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {(!tasks || tasks.length === 0) ? (
            <div className="p-12 text-center text-slate-500">
              No tasks yet. Click "Add Task" to get started!
            </div>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="p-4 hover:bg-slate-50 transition-colors flex items-start gap-4 group">
                <button
                  onClick={() => updateTask(task.id, { status: task.status === 'done' ? 'todo' : 'done' })}
                  className="mt-1 text-slate-400 hover:text-indigo-600 transition-colors flex-shrink-0"
                >
                  {task.status === 'done' ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  ) : (
                    <Circle className="w-6 h-6" />
                  )}
                </button>
                
                <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-slate-900 font-medium transition-all",
                      task.status === 'done' && "text-slate-400 line-through"
                    )}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">{task.description}</p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {format(task.createdAt, 'MMM d')}
                      </div>
                      {task.category && (
                        <div className="flex items-center gap-1 text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md font-medium">
                          <Tag className="w-3 h-3" />
                          {task.category}
                        </div>
                      )}
                      {task.isRecurring && (
                        <div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md font-medium">
                          <Repeat className="w-3 h-3" />
                          {task.recurrencePattern}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={task.status} />
                      {task.priority !== 'none' && <PriorityBadge priority={task.priority} />}
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setTimerConfig({ isOpen: true, refId: task.id, title: task.title })}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors rounded-md hover:bg-indigo-50"
                        title="Focus Timer"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(task)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors rounded-md hover:bg-indigo-50"
                        title="Edit Task"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors rounded-md hover:bg-rose-50"
                        title="Delete Task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add/Edit Task Dialog */}
      <Dialog open={isAddOpen || isEditOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddOpen(false);
          setIsEditOpen(false);
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditOpen ? 'Edit Task' : 'Add New Task'}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSaveTask} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Task Title *</label>
              <Input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="What needs to be done?" 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Description</label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Add details..." 
                className="w-full min-h-[80px] p-3 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-y"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Category</label>
                <Input 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)} 
                  placeholder="e.g. Work, Personal" 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Status</label>
                <select 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  className="w-full h-9 px-3 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="blocked">Blocked</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Priority (Eisenhower Matrix)</label>
              <select 
                value={priority} 
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full h-9 px-3 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="none">No Priority</option>
                <option value="urgent-important">Urgent & Important (Do First)</option>
                <option value="not-urgent-important">Important, Not Urgent (Schedule)</option>
                <option value="urgent-not-important">Urgent, Not Important (Delegate)</option>
                <option value="not-urgent-not-important">Neither (Eliminate)</option>
              </select>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isRecurring} 
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                Recurring Task
              </label>
              
              {isRecurring && (
                <select 
                  value={recurrencePattern} 
                  onChange={(e) => setRecurrencePattern(e.target.value as any)}
                  className="h-8 px-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              )}
            </div>

            <DialogFooter className="mt-6">
              <DialogClose render={<Button type="button" variant="outline" />}>
                Cancel
              </DialogClose>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {isEditOpen ? 'Save Changes' : 'Create Task'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {timerConfig && (
        <FocusTimer
          isOpen={timerConfig.isOpen}
          onClose={() => setTimerConfig(null)}
          referenceId={timerConfig.refId}
          type="task"
          title={timerConfig.title}
        />
      )}
    </div>
  );
}
