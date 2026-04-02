export type PriorityLevel = 
  | 'urgent-important' 
  | 'urgent-not-important' 
  | 'not-urgent-important' 
  | 'not-urgent-not-important' 
  | 'none';

export type TaskStatus = 'todo' | 'in-progress' | 'blocked' | 'done';
export type PathStatus = 'active' | 'completed' | 'paused';

export interface Task {
  id: string;
  title: string;
  description?: string;
  category?: string;
  priority: PriorityLevel;
  status: TaskStatus;
  isRecurring: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly' | 'custom';
  timeSpent: number; // in seconds
  createdAt: number;
  updatedAt: number;
}

export interface Resource {
  id: string;
  title: string;
  url: string;
  type: 'article' | 'video' | 'book' | 'other';
}

export interface Milestone {
  id: string;
  pathId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  resources: Resource[];
  notes: string; // Markdown content
  timeSpent: number; // in seconds
  createdAt: number;
  updatedAt: number;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  status: PathStatus;
  milestones: Milestone[];
  createdAt: number;
  updatedAt: number;
}

export interface FocusSession {
  id: string;
  type: 'task' | 'learning';
  referenceId: string; // Task ID or Milestone ID
  duration: number; // in seconds
  startTime: number;
  endTime: number;
  completed: boolean; // true if pomodoro finished naturally, false if aborted early
}

export interface DailyActivity {
  date: string; // YYYY-MM-DD
  tasksCompleted: number;
  learningTime: number; // in seconds
  focusSessionsCompleted: number;
}
