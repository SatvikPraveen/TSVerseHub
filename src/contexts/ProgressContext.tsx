// src/contexts/ProgressContext.tsx

import { createContext, useContext, useEffect, useReducer } from 'react';

import { useLocalStorage } from '@/hooks/useLocalStorage';

// Types
export interface ConceptProgress {
  conceptId: string;
  completed: boolean;
  timeSpent: number; // in minutes
  lastAccessed: string; // ISO date string
  score: number; // 0-100
  exercisesCompleted: string[];
  notesCount: number;
}

export interface ProjectProgress {
  projectId: string;
  started: boolean;
  completed: boolean;
  timeSpent: number;
  lastAccessed: string;
  completedSteps: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  score: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
  category: 'learning' | 'project' | 'streak' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface LearningStreak {
  current: number;
  longest: number;
  lastActiveDate: string;
}

export interface ProgressState {
  concepts: Record<string, ConceptProgress>;
  projects: Record<string, ProjectProgress>;
  achievements: Achievement[];
  streak: LearningStreak;
  totalTimeSpent: number;
  level: number;
  experience: number;
  lastSessionDate: string;
  preferences: {
    dailyGoalMinutes: number;
    notifications: boolean;
    trackingEnabled: boolean;
  };
}

// Action Types
type ProgressAction =
  | { type: 'UPDATE_CONCEPT_PROGRESS'; payload: Partial<ConceptProgress> & { conceptId: string } }
  | { type: 'UPDATE_PROJECT_PROGRESS'; payload: Partial<ProjectProgress> & { projectId: string } }
  | { type: 'ADD_ACHIEVEMENT'; payload: Achievement }
  | { type: 'UPDATE_STREAK'; payload: Partial<LearningStreak> }
  | { type: 'ADD_TIME_SPENT'; payload: number }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<ProgressState['preferences']> }
  | { type: 'START_SESSION' }
  | { type: 'RESET_PROGRESS' }
  | { type: 'IMPORT_PROGRESS'; payload: ProgressState };

// Initial State
const initialState: ProgressState = {
  concepts: {},
  projects: {},
  achievements: [],
  streak: {
    current: 0,
    longest: 0,
    lastActiveDate: new Date().toISOString().split('T')[0],
  },
  totalTimeSpent: 0,
  level: 1,
  experience: 0,
  lastSessionDate: new Date().toISOString(),
  preferences: {
    dailyGoalMinutes: 30,
    notifications: true,
    trackingEnabled: true,
  },
};

// Experience thresholds for leveling up
const LEVEL_THRESHOLDS = [
  0,     // Level 1
  100,   // Level 2
  250,   // Level 3
  500,   // Level 4
  1000,  // Level 5
  1750,  // Level 6
  2750,  // Level 7
  4000,  // Level 8
  5500,  // Level 9
  7500,  // Level 10
  10000, // Level 11+
];

// Reducer
const progressReducer = (state: ProgressState, action: ProgressAction): ProgressState => {
  switch (action.type) {
    case 'UPDATE_CONCEPT_PROGRESS': {
      const { conceptId, ...updates } = action.payload;
      const currentProgress = state.concepts[conceptId] || {
        conceptId,
        completed: false,
        timeSpent: 0,
        lastAccessed: new Date().toISOString(),
        score: 0,
        exercisesCompleted: [],
        notesCount: 0,
      };

      const updatedProgress = {
        ...currentProgress,
        ...updates,
        lastAccessed: new Date().toISOString(),
      };

      // Calculate experience gain
      let expGain = 0;
      if (!currentProgress.completed && updatedProgress.completed) {
        expGain += 50; // Completion bonus
      }
      expGain += Math.floor((updatedProgress.timeSpent - currentProgress.timeSpent) * 2); // 2 XP per minute

      return {
        ...state,
        concepts: {
          ...state.concepts,
          [conceptId]: updatedProgress,
        },
        experience: state.experience + expGain,
        level: calculateLevel(state.experience + expGain),
      };
    }

    case 'UPDATE_PROJECT_PROGRESS': {
      const { projectId, ...updates } = action.payload;
      const currentProgress = state.projects[projectId] || {
        projectId,
        started: false,
        completed: false,
        timeSpent: 0,
        lastAccessed: new Date().toISOString(),
        completedSteps: [],
        difficulty: 'beginner' as const,
        score: 0,
      };

      const updatedProgress = {
        ...currentProgress,
        ...updates,
        lastAccessed: new Date().toISOString(),
      };

      // Calculate experience gain
      let expGain = 0;
      if (!currentProgress.started && updatedProgress.started) {
        expGain += 25; // Start bonus
      }
      if (!currentProgress.completed && updatedProgress.completed) {
        expGain += updatedProgress.difficulty === 'beginner' ? 100 : 
                  updatedProgress.difficulty === 'intermediate' ? 200 : 300;
      }
      expGain += Math.floor((updatedProgress.timeSpent - currentProgress.timeSpent) * 3); // 3 XP per minute for projects

      return {
        ...state,
        projects: {
          ...state.projects,
          [projectId]: updatedProgress,
        },
        experience: state.experience + expGain,
        level: calculateLevel(state.experience + expGain),
      };
    }

    case 'ADD_ACHIEVEMENT': {
      // Don't add duplicate achievements
      if (state.achievements.some(a => a.id === action.payload.id)) {
        return state;
      }

      return {
        ...state,
        achievements: [...state.achievements, action.payload],
        experience: state.experience + getAchievementXP(action.payload.rarity),
      };
    }

    case 'UPDATE_STREAK': {
      const updatedStreak = { ...state.streak, ...action.payload };
      return {
        ...state,
        streak: updatedStreak,
      };
    }

    case 'ADD_TIME_SPENT': {
      return {
        ...state,
        totalTimeSpent: state.totalTimeSpent + action.payload,
      };
    }

    case 'UPDATE_PREFERENCES': {
      return {
        ...state,
        preferences: { ...state.preferences, ...action.payload },
      };
    }

    case 'START_SESSION': {
      const today = new Date().toISOString().split('T')[0];
      const lastActiveDate = state.streak.lastActiveDate;
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      let newStreak = state.streak.current;
      
      if (today !== lastActiveDate) {
        if (lastActiveDate === yesterday) {
          // Continue streak
          newStreak += 1;
        } else {
          // Reset streak
          newStreak = 1;
        }
      }

      return {
        ...state,
        lastSessionDate: new Date().toISOString(),
        streak: {
          ...state.streak,
          current: newStreak,
          longest: Math.max(state.streak.longest, newStreak),
          lastActiveDate: today,
        },
      };
    }

    case 'RESET_PROGRESS': {
      return initialState;
    }

    case 'IMPORT_PROGRESS': {
      return action.payload;
    }

    default:
      return state;
  }
};

// Helper functions
const calculateLevel = (experience: number): number => {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (experience >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
};

const getAchievementXP = (rarity: Achievement['rarity']): number => {
  switch (rarity) {
    case 'common': return 10;
    case 'rare': return 25;
    case 'epic': return 50;
    case 'legendary': return 100;
  }
};

// Context
interface ProgressContextType {
  state: ProgressState;
  updateConceptProgress: (conceptId: string, updates: Partial<ConceptProgress>) => void;
  updateProjectProgress: (projectId: string, updates: Partial<ProjectProgress>) => void;
  addAchievement: (achievement: Achievement) => void;
  updateStreak: (updates: Partial<LearningStreak>) => void;
  addTimeSpent: (minutes: number) => void;
  updatePreferences: (preferences: Partial<ProgressState['preferences']>) => void;
  startSession: () => void;
  resetProgress: () => void;
  exportProgress: () => string;
  importProgress: (data: string) => boolean;
  
  // Computed values
  completedConcepts: number;
  totalConcepts: number;
  completedProjects: number;
  totalProjects: number;
  progressPercentage: number;
  nextLevelXP: number;
  currentLevelXP: number;
  dailyGoalProgress: number;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

// Provider
interface ProgressProviderProps {
  children: React.ReactNode;
}

export const ProgressProvider = ({ children }: ProgressProviderProps) => {
  const [storedState, setStoredState] = useLocalStorage<ProgressState>('tsversehub-progress', initialState);
  const [state, dispatch] = useReducer(progressReducer, storedState);

  // Save to localStorage whenever state changes
  useEffect(() => {
    setStoredState(state);
  }, [state, setStoredState]);

  // Auto-check for achievements
  useEffect(() => {
    checkForNewAchievements(state, dispatch);
  }, [state.concepts, state.projects, state.streak, state.totalTimeSpent, state.level]);

  // Action creators
  const updateConceptProgress = (conceptId: string, updates: Partial<ConceptProgress>) => {
    dispatch({ type: 'UPDATE_CONCEPT_PROGRESS', payload: { conceptId, ...updates } });
  };

  const updateProjectProgress = (projectId: string, updates: Partial<ProjectProgress>) => {
    dispatch({ type: 'UPDATE_PROJECT_PROGRESS', payload: { projectId, ...updates } });
  };

  const addAchievement = (achievement: Achievement) => {
    dispatch({ type: 'ADD_ACHIEVEMENT', payload: achievement });
  };

  const updateStreak = (updates: Partial<LearningStreak>) => {
    dispatch({ type: 'UPDATE_STREAK', payload: updates });
  };

  const addTimeSpent = (minutes: number) => {
    dispatch({ type: 'ADD_TIME_SPENT', payload: minutes });
  };

  const updatePreferences = (preferences: Partial<ProgressState['preferences']>) => {
    dispatch({ type: 'UPDATE_PREFERENCES', payload: preferences });
  };

  const startSession = () => {
    dispatch({ type: 'START_SESSION' });
  };

  const resetProgress = () => {
    dispatch({ type: 'RESET_PROGRESS' });
  };

  const exportProgress = (): string => {
    return JSON.stringify(state, null, 2);
  };

  const importProgress = (data: string): boolean => {
    try {
      const importedState = JSON.parse(data) as ProgressState;
      dispatch({ type: 'IMPORT_PROGRESS', payload: importedState });
      return true;
    } catch {
      return false;
    }
  };

  // Computed values
  const completedConcepts = Object.values(state.concepts).filter(c => c.completed).length;
  const totalConcepts = Object.keys(state.concepts).length || 1; // Avoid division by zero
  const completedProjects = Object.values(state.projects).filter(p => p.completed).length;
  const totalProjects = Object.keys(state.projects).length || 1;
  const progressPercentage = Math.round(((completedConcepts + completedProjects) / (totalConcepts + totalProjects)) * 100);
  
  const currentLevelIndex = state.level - 1;
  const currentLevelXP = LEVEL_THRESHOLDS[currentLevelIndex] || 0;
  const nextLevelXP = LEVEL_THRESHOLDS[currentLevelIndex + 1] || (LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + 1000);
  
  // Daily goal progress (time spent today vs daily goal)
  const today = new Date().toISOString().split('T')[0];
  const todayTimeSpent = Object.values({ ...state.concepts, ...state.projects })
    .filter(item => item.lastAccessed.startsWith(today))
    .reduce((total, item) => total + item.timeSpent, 0);
  const dailyGoalProgress = Math.min((todayTimeSpent / state.preferences.dailyGoalMinutes) * 100, 100);

  const value: ProgressContextType = {
    state,
    updateConceptProgress,
    updateProjectProgress,
    addAchievement,
    updateStreak,
    addTimeSpent,
    updatePreferences,
    startSession,
    resetProgress,
    exportProgress,
    importProgress,
    completedConcepts,
    totalConcepts,
    completedProjects,
    totalProjects,
    progressPercentage,
    nextLevelXP,
    currentLevelXP,
    dailyGoalProgress,
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};

// Achievement checking logic
const checkForNewAchievements = (state: ProgressState, dispatch: React.Dispatch<ProgressAction>) => {
  const existingAchievementIds = new Set(state.achievements.map(a => a.id));
  const newAchievements: Achievement[] = [];

  // First Concept Achievement
  if (Object.values(state.concepts).some(c => c.completed) && !existingAchievementIds.has('first-concept')) {
    newAchievements.push({
      id: 'first-concept',
      name: 'First Steps',
      description: 'Complete your first TypeScript concept',
      icon: '🎯',
      unlockedAt: new Date().toISOString(),
      category: 'learning',
      rarity: 'common',
    });
  }

  // Concept Master Achievements
  const completedConceptCount = Object.values(state.concepts).filter(c => c.completed).length;
  const conceptMilestones = [
    { count: 5, id: 'concept-explorer', name: 'Concept Explorer', description: 'Complete 5 concepts', icon: '📚' },
    { count: 10, id: 'concept-student', name: 'Dedicated Student', description: 'Complete 10 concepts', icon: '🎓' },
    { count: 20, id: 'concept-master', name: 'Concept Master', description: 'Complete 20 concepts', icon: '🏆' },
  ];

  conceptMilestones.forEach(milestone => {
    if (completedConceptCount >= milestone.count && !existingAchievementIds.has(milestone.id)) {
      newAchievements.push({
        id: milestone.id,
        name: milestone.name,
        description: milestone.description,
        icon: milestone.icon,
        unlockedAt: new Date().toISOString(),
        category: 'learning',
        rarity: milestone.count >= 20 ? 'epic' : milestone.count >= 10 ? 'rare' : 'common',
      });
    }
  });

  // Project Achievements
  const completedProjectCount = Object.values(state.projects).filter(p => p.completed).length;
  if (completedProjectCount >= 1 && !existingAchievementIds.has('first-project')) {
    newAchievements.push({
      id: 'first-project',
      name: 'Builder',
      description: 'Complete your first mini-project',
      icon: '🔧',
      unlockedAt: new Date().toISOString(),
      category: 'project',
      rarity: 'rare',
    });
  }

  if (completedProjectCount >= 3 && !existingAchievementIds.has('project-enthusiast')) {
    newAchievements.push({
      id: 'project-enthusiast',
      name: 'Project Enthusiast',
      description: 'Complete 3 mini-projects',
      icon: '🚀',
      unlockedAt: new Date().toISOString(),
      category: 'project',
      rarity: 'epic',
    });
  }

  // Streak Achievements
  const streakMilestones = [
    { days: 3, id: 'streak-3', name: 'Getting Started', description: '3 day learning streak', icon: '🔥' },
    { days: 7, id: 'streak-7', name: 'Week Warrior', description: '7 day learning streak', icon: '⚡' },
    { days: 30, id: 'streak-30', name: 'Consistency Champion', description: '30 day learning streak', icon: '💎' },
  ];

  streakMilestones.forEach(milestone => {
    if (state.streak.current >= milestone.days && !existingAchievementIds.has(milestone.id)) {
      newAchievements.push({
        id: milestone.id,
        name: milestone.name,
        description: milestone.description,
        icon: milestone.icon,
        unlockedAt: new Date().toISOString(),
        category: 'streak',
        rarity: milestone.days >= 30 ? 'legendary' : milestone.days >= 7 ? 'epic' : 'rare',
      });
    }
  });

  // Time-based Achievements
  const timeMilestones = [
    { hours: 5, id: 'time-5h', name: 'Dedicated Learner', description: 'Spend 5 hours learning', icon: '⏰' },
    { hours: 25, id: 'time-25h', name: 'Time Investment', description: 'Spend 25 hours learning', icon: '📖' },
    { hours: 50, id: 'time-50h', name: 'Scholar', description: 'Spend 50 hours learning', icon: '🎓' },
  ];

  timeMilestones.forEach(milestone => {
    const totalHours = state.totalTimeSpent / 60;
    if (totalHours >= milestone.hours && !existingAchievementIds.has(milestone.id)) {
      newAchievements.push({
        id: milestone.id,
        name: milestone.name,
        description: milestone.description,
        icon: milestone.icon,
        unlockedAt: new Date().toISOString(),
        category: 'learning',
        rarity: milestone.hours >= 50 ? 'legendary' : milestone.hours >= 25 ? 'epic' : 'rare',
      });
    }
  });

  // Level Achievements
  const levelMilestones = [
    { level: 5, id: 'level-5', name: 'Rising Star', description: 'Reach level 5', icon: '⭐' },
    { level: 10, id: 'level-10', name: 'Expert', description: 'Reach level 10', icon: '🌟' },
    { level: 20, id: 'level-20', name: 'TypeScript Guru', description: 'Reach level 20', icon: '✨' },
  ];

  levelMilestones.forEach(milestone => {
    if (state.level >= milestone.level && !existingAchievementIds.has(milestone.id)) {
      newAchievements.push({
        id: milestone.id,
        name: milestone.name,
        description: milestone.description,
        icon: milestone.icon,
        unlockedAt: new Date().toISOString(),
        category: 'learning',
        rarity: milestone.level >= 20 ? 'legendary' : milestone.level >= 10 ? 'epic' : 'rare',
      });
    }
  });

  // Special Achievements
  const perfectScoreCount = Object.values(state.concepts).filter(c => c.score === 100).length;
  if (perfectScoreCount >= 5 && !existingAchievementIds.has('perfectionist')) {
    newAchievements.push({
      id: 'perfectionist',
      name: 'Perfectionist',
      description: 'Get perfect scores on 5 concepts',
      icon: '💯',
      unlockedAt: new Date().toISOString(),
      category: 'special',
      rarity: 'epic',
    });
  }

  // Add all new achievements
  newAchievements.forEach(achievement => {
    dispatch({ type: 'ADD_ACHIEVEMENT', payload: achievement });
  });
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};