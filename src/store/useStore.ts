import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { 
  Task, 
  LearningPath, 
  Milestone, 
  FocusSession, 
  DailyActivity,
  TaskStatus,
  PriorityLevel,
  PathStatus
} from '../types';

interface NexusState {
  // --- State ---
  tasks: Task[];
  learningPaths: LearningPath[];
  focusSessions: FocusSession[];
  dailyActivities: Record<string, DailyActivity>; // Keyed by YYYY-MM-DD

  // --- Task Actions ---
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'timeSpent'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  // --- Learning Path Actions ---
  addLearningPath: (title: string, description: string, initialMilestones?: {title: string, description: string}[]) => void;
  updateLearningPath: (id: string, updates: Partial<LearningPath>) => void;
  deleteLearningPath: (id: string) => void;
  
  // --- Milestone Actions ---
  addMilestone: (pathId: string, milestone: Omit<Milestone, 'id' | 'pathId' | 'createdAt' | 'updatedAt' | 'timeSpent'>) => void;
  updateMilestone: (pathId: string, milestoneId: string, updates: Partial<Milestone>) => void;
  deleteMilestone: (pathId: string, milestoneId: string) => void;

  // --- Tracking & Analytics Actions ---
  addFocusSession: (session: Omit<FocusSession, 'id'>) => void;
  logDailyActivity: (date: string, updates: Partial<DailyActivity>) => void;
}

export const useStore = create<NexusState>()(
  persist(
    (set, get) => ({
      // Initial State
      tasks: [],
      learningPaths: [],
      focusSessions: [],
      dailyActivities: {},

      // --- Task Actions ---
      addTask: (taskData) => set((state) => ({
        tasks: [
          {
            ...taskData,
            id: uuidv4(),
            timeSpent: 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
          ...state.tasks,
        ],
      })),

      updateTask: (id, updates) => set((state) => {
        const existingTask = state.tasks.find(t => t.id === id);
        const isNewlyCompleted = existingTask?.status !== 'done' && updates.status === 'done';
        
        let newDailyActivities = state.dailyActivities;
        if (isNewlyCompleted) {
          const dateKey = new Date().toISOString().split('T')[0];
          const currentActivity = state.dailyActivities[dateKey] || {
            date: dateKey,
            tasksCompleted: 0,
            learningTime: 0,
            focusSessionsCompleted: 0,
          };
          newDailyActivities = {
            ...state.dailyActivities,
            [dateKey]: {
              ...currentActivity,
              tasksCompleted: currentActivity.tasksCompleted + 1
            }
          };
        }

        return {
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates, updatedAt: Date.now() } : task
          ),
          dailyActivities: newDailyActivities
        };
      }),

      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
      })),

      // --- Learning Path Actions ---
      addLearningPath: (title, description, initialMilestones = []) => set((state) => {
        const pathId = uuidv4();
        return {
          learningPaths: [
            {
              id: pathId,
              title,
              description,
              status: 'active',
              milestones: initialMilestones.map(m => ({
                id: uuidv4(),
                pathId,
                title: m.title,
                description: m.description,
                status: 'todo',
                resources: [],
                notes: '',
                timeSpent: 0,
                createdAt: Date.now(),
                updatedAt: Date.now(),
              })),
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
            ...state.learningPaths,
          ],
        };
      }),

      updateLearningPath: (id, updates) => set((state) => ({
        learningPaths: state.learningPaths.map((path) =>
          path.id === id ? { ...path, ...updates, updatedAt: Date.now() } : path
        ),
      })),

      deleteLearningPath: (id) => set((state) => ({
        learningPaths: state.learningPaths.filter((path) => path.id !== id),
      })),

      // --- Milestone Actions ---
      addMilestone: (pathId, milestoneData) => set((state) => ({
        learningPaths: state.learningPaths.map((path) => {
          if (path.id === pathId) {
            return {
              ...path,
              updatedAt: Date.now(),
              milestones: [
                ...path.milestones,
                {
                  ...milestoneData,
                  id: uuidv4(),
                  pathId,
                  timeSpent: 0,
                  createdAt: Date.now(),
                  updatedAt: Date.now(),
                }
              ]
            };
          }
          return path;
        })
      })),

      updateMilestone: (pathId, milestoneId, updates) => set((state) => ({
        learningPaths: state.learningPaths.map((path) => {
          if (path.id === pathId) {
            return {
              ...path,
              updatedAt: Date.now(),
              milestones: path.milestones.map((m) => 
                m.id === milestoneId ? { ...m, ...updates, updatedAt: Date.now() } : m
              )
            };
          }
          return path;
        })
      })),

      deleteMilestone: (pathId, milestoneId) => set((state) => ({
        learningPaths: state.learningPaths.map((path) => {
          if (path.id === pathId) {
            return {
              ...path,
              updatedAt: Date.now(),
              milestones: path.milestones.filter((m) => m.id !== milestoneId)
            };
          }
          return path;
        })
      })),

      // --- Tracking & Analytics Actions ---
      addFocusSession: (sessionData) => set((state) => {
        const newSession: FocusSession = {
          ...sessionData,
          id: uuidv4(),
        };
        
        // Also update the daily activity automatically
        const dateKey = new Date(sessionData.startTime).toISOString().split('T')[0];
        const currentActivity = state.dailyActivities[dateKey] || {
          date: dateKey,
          tasksCompleted: 0,
          learningTime: 0,
          focusSessionsCompleted: 0,
        };

        const updatedActivity = {
          ...currentActivity,
          focusSessionsCompleted: currentActivity.focusSessionsCompleted + (sessionData.completed ? 1 : 0),
          learningTime: sessionData.type === 'learning' 
            ? currentActivity.learningTime + sessionData.duration 
            : currentActivity.learningTime
        };

        return {
          focusSessions: [...state.focusSessions, newSession],
          dailyActivities: {
            ...state.dailyActivities,
            [dateKey]: updatedActivity
          }
        };
      }),

      logDailyActivity: (date, updates) => set((state) => {
        const currentActivity = state.dailyActivities[date] || {
          date,
          tasksCompleted: 0,
          learningTime: 0,
          focusSessionsCompleted: 0,
        };

        return {
          dailyActivities: {
            ...state.dailyActivities,
            [date]: { ...currentActivity, ...updates }
          }
        };
      }),

    }),
    {
      name: 'nexus-storage', // unique name for localStorage key
    }
  )
);
