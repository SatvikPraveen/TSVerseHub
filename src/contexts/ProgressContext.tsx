// src/contexts/ProgressContext.tsx

import { createContext, useContext } from 'react';

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

export interface ProgressContextType {
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

export const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

// Provider

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};
