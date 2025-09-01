/* File: src/utils/badge-system.ts */

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  category: 'learning' | 'achievement' | 'milestone' | 'special' | 'community';
  unlockedAt?: Date;
  progress?: {
    current: number;
    total: number;
    description: string;
  };
  requirement: BadgeRequirement;
  xpReward: number;
}

export interface BadgeRequirement {
  type: 'complete_lessons' | 'quiz_streak' | 'perfect_score' | 'time_spent' | 'projects_completed' | 'help_others' | 'daily_streak' | 'skill_mastery' | 'code_lines' | 'error_free_sessions';
  target: number;
  skillId?: string;
  additionalConditions?: {
    timeframe?: 'daily' | 'weekly' | 'monthly';
    consecutive?: boolean;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    scoreThreshold?: number;
  };
}

export interface UserProgress {
  userId: string;
  stats: {
    lessonsCompleted: number;
    quizzesCompleted: number;
    perfectScores: number;
    currentStreak: number;
    longestStreak: number;
    totalTimeSpent: number; // in minutes
    projectsCompleted: number;
    linesOfCode: number;
    errorFreeSessions: number;
    lastActiveDate: Date;
  };
  skillProgress: Record<string, {
    level: number;
    xp: number;
    lessonsCompleted: number;
  }>;
}

export interface BadgeUnlockEvent {
  badgeId: string;
  userId: string;
  unlockedAt: Date;
  progress: UserProgress;
  xpGained: number;
}

class BadgeSystem {
  private badges: Map<string, Badge> = new Map();
  private userBadges: Map<string, Set<string>> = new Map(); // userId -> Set of badgeIds
  private eventListeners: Array<(event: BadgeUnlockEvent) => void> = [];

  constructor() {
    this.initializeDefaultBadges();
  }

  /**
   * Initialize the default badge collection
   */
  private initializeDefaultBadges(): void {
    const defaultBadges: Badge[] = [
      // Learning Badges
      {
        id: 'first-lesson',
        name: 'First Steps',
        description: 'Complete your very first TypeScript lesson',
        icon: '👶',
        rarity: 'common',
        category: 'learning',
        requirement: {
          type: 'complete_lessons',
          target: 1
        },
        xpReward: 50
      },
      {
        id: 'dedicated-learner',
        name: 'Dedicated Learner',
        description: 'Complete 10 lessons',
        icon: '📚',
        rarity: 'common',
        category: 'learning',
        requirement: {
          type: 'complete_lessons',
          target: 10
        },
        xpReward: 100
      },
      {
        id: 'knowledge-seeker',
        name: 'Knowledge Seeker',
        description: 'Complete 50 lessons',
        icon: '🔍',
        rarity: 'uncommon',
        category: 'learning',
        requirement: {
          type: 'complete_lessons',
          target: 50
        },
        xpReward: 250
      },
      {
        id: 'typescript-scholar',
        name: 'TypeScript Scholar',
        description: 'Complete 100 lessons',
        icon: '🎓',
        rarity: 'rare',
        category: 'milestone',
        requirement: {
          type: 'complete_lessons',
          target: 100
        },
        xpReward: 500
      },

      // Quiz Achievement Badges
      {
        id: 'quiz-novice',
        name: 'Quiz Novice',
        description: 'Score 100% on your first quiz',
        icon: '🎯',
        rarity: 'common',
        category: 'achievement',
        requirement: {
          type: 'perfect_score',
          target: 1
        },
        xpReward: 75
      },
      {
        id: 'quiz-master',
        name: 'Quiz Master',
        description: 'Score 100% on 10 quizzes',
        icon: '🏆',
        rarity: 'rare',
        category: 'achievement',
        requirement: {
          type: 'perfect_score',
          target: 10
        },
        xpReward: 300
      },
      {
        id: 'perfectionist',
        name: 'Perfectionist',
        description: 'Score 100% on 5 consecutive quizzes',
        icon: '💎',
        rarity: 'epic',
        category: 'achievement',
        requirement: {
          type: 'quiz_streak',
          target: 5,
          additionalConditions: {
            consecutive: true,
            scoreThreshold: 100
          }
        },
        xpReward: 400
      },

      // Streak Badges
      {
        id: 'consistent-learner',
        name: 'Consistent Learner',
        description: 'Maintain a 7-day learning streak',
        icon: '🔥',
        rarity: 'uncommon',
        category: 'milestone',
        requirement: {
          type: 'daily_streak',
          target: 7
        },
        xpReward: 200
      },
      {
        id: 'streak-warrior',
        name: 'Streak Warrior',
        description: 'Maintain a 30-day learning streak',
        icon: '⚡',
        rarity: 'epic',
        category: 'milestone',
        requirement: {
          type: 'daily_streak',
          target: 30
        },
        xpReward: 600
      },
      {
        id: 'unstoppable',
        name: 'Unstoppable',
        description: 'Maintain a 100-day learning streak',
        icon: '🌟',
        rarity: 'legendary',
        category: 'milestone',
        requirement: {
          type: 'daily_streak',
          target: 100
        },
        xpReward: 1000
      },

      // Special Badges
      {
        id: 'night-owl',
        name: 'Night Owl',
        description: 'Complete 5 lessons between 10PM and 6AM',
        icon: '🦉',
        rarity: 'uncommon',
        category: 'special',
        requirement: {
          type: 'complete_lessons',
          target: 5,
          additionalConditions: {
            timeframe: 'daily'
          }
        },
        xpReward: 150
      },
      {
        id: 'early-bird',
        name: 'Early Bird',
        description: 'Complete 5 lessons between 5AM and 8AM',
        icon: '🐦',
        rarity: 'uncommon',
        category: 'special',
        requirement: {
          type: 'complete_lessons',
          target: 5
        },
        xpReward: 150
      },
      {
        id: 'speed-runner',
        name: 'Speed Runner',
        description: 'Complete a lesson in under 5 minutes',
        icon: '💨',
        rarity: 'rare',
        category: 'special',
        requirement: {
          type: 'time_spent',
          target: 5 // less than 5 minutes
        },
        xpReward: 200
      },

      // Project Badges
      {
        id: 'builder',
        name: 'Builder',
        description: 'Complete your first TypeScript project',
        icon: '🏗️',
        rarity: 'uncommon',
        category: 'achievement',
        requirement: {
          type: 'projects_completed',
          target: 1
        },
        xpReward: 200
      },
      {
        id: 'architect',
        name: 'Architect',
        description: 'Complete 5 TypeScript projects',
        icon: '🏛️',
        rarity: 'rare',
        category: 'achievement',
        requirement: {
          type: 'projects_completed',
          target: 5
        },
        xpReward: 400
      },

      // Code Quality Badges
      {
        id: 'clean-coder',
        name: 'Clean Coder',
        description: 'Write 1000 lines of TypeScript code',
        icon: '✨',
        rarity: 'uncommon',
        category: 'achievement',
        requirement: {
          type: 'code_lines',
          target: 1000
        },
        xpReward: 300
      },
      {
        id: 'error-free',
        name: 'Error Free',
        description: 'Complete 10 coding sessions without any errors',
        icon: '✅',
        rarity: 'rare',
        category: 'achievement',
        requirement: {
          type: 'error_free_sessions',
          target: 10
        },
        xpReward: 350
      },

      // Community Badges
      {
        id: 'helper',
        name: 'Helper',
        description: 'Help 5 fellow learners in the community',
        icon: '🤝',
        rarity: 'uncommon',
        category: 'community',
        requirement: {
          type: 'help_others',
          target: 5
        },
        xpReward: 250
      },
      {
        id: 'mentor',
        name: 'Mentor',
        description: 'Help 25 fellow learners in the community',
        icon: '👨‍🏫',
        rarity: 'epic',
        category: 'community',
        requirement: {
          type: 'help_others',
          target: 25
        },
        xpReward: 500
      },

      // Ultimate Achievement
      {
        id: 'typescript-master',
        name: 'TypeScript Master',
        description: 'Achieve mastery in all TypeScript skills',
        icon: '🧙‍♂️',
        rarity: 'legendary',
        category: 'milestone',
        requirement: {
          type: 'skill_mastery',
          target: 100 // 100% mastery across all skills
        },
        xpReward: 1500
      }
    ];

    defaultBadges.forEach(badge => this.badges.set(badge.id, badge));
  }

  /**
   * Add a new badge to the system
   */
  addBadge(badge: Badge): void {
    this.badges.set(badge.id, badge);
  }

  /**
   * Get all available badges
   */
  getAllBadges(): Badge[] {
    return Array.from(this.badges.values());
  }

  /**
   * Get badges by category
   */
  getBadgesByCategory(category: Badge['category']): Badge[] {
    return this.getAllBadges().filter(badge => badge.category === category);
  }

  /**
   * Get badges by rarity
   */
  getBadgesByRarity(rarity: Badge['rarity']): Badge[] {
    return this.getAllBadges().filter(badge => badge.rarity === rarity);
  }

  /**
   * Get user's unlocked badges
   */
  getUserBadges(userId: string): string[] {
    return Array.from(this.userBadges.get(userId) || new Set());
  }

  /**
   * Check if user has a specific badge
   */
  hasUserBadge(userId: string, badgeId: string): boolean {
    return this.userBadges.get(userId)?.has(badgeId) || false;
  }

  /**
   * Award a badge to a user
   */
  awardBadge(userId: string, badgeId: string, progress: UserProgress): BadgeUnlockEvent | null {
    const badge = this.badges.get(badgeId);
    if (!badge) {
      throw new Error(`Badge with id ${badgeId} not found`);
    }

    // Check if user already has this badge
    if (this.hasUserBadge(userId, badgeId)) {
      return null; // Badge already awarded
    }

    // Award the badge
    if (!this.userBadges.has(userId)) {
      this.userBadges.set(userId, new Set());
    }
    this.userBadges.get(userId)!.add(badgeId);

    // Create unlock event
    const unlockEvent: BadgeUnlockEvent = {
      badgeId,
      userId,
      unlockedAt: new Date(),
      progress,
      xpGained: badge.xpReward
    };

    // Notify listeners
    this.eventListeners.forEach(listener => listener(unlockEvent));

    return unlockEvent;
  }

  /**
   * Check for badge unlocks based on user progress
   */
  checkBadgeUnlocks(userId: string, progress: UserProgress): BadgeUnlockEvent[] {
    const unlockedBadges: BadgeUnlockEvent[] = [];
    
    for (const badge of this.badges.values()) {
      // Skip if user already has this badge
      if (this.hasUserBadge(userId, badge.id)) {
        continue;
      }

      // Check if requirements are met
      if (this.checkBadgeRequirement(badge.requirement, progress)) {
        const unlockEvent = this.awardBadge(userId, badge.id, progress);
        if (unlockEvent) {
          unlockedBadges.push(unlockEvent);
        }
      }
    }

    return unlockedBadges;
  }

  /**
   * Calculate badge progress for a user
   */
  calculateBadgeProgress(userId: string, badgeId: string, progress: UserProgress): {
    current: number;
    total: number;
    percentage: number;
    isUnlocked: boolean;
  } {
    const badge = this.badges.get(badgeId);
    if (!badge) {
      throw new Error(`Badge with id ${badgeId} not found`);
    }

    const isUnlocked = this.hasUserBadge(userId, badgeId);
    if (isUnlocked) {
      return {
        current: badge.requirement.target,
        total: badge.requirement.target,
        percentage: 100,
        isUnlocked: true
      };
    }

    const current = this.getCurrentProgressValue(badge.requirement, progress);
    const total = badge.requirement.target;
    const percentage = Math.min(Math.round((current / total) * 100), 100);

    return {
      current,
      total,
      percentage,
      isUnlocked: false
    };
  }

  /**
   * Get user's badge statistics
   */
  getUserBadgeStats(userId: string): {
    total: number;
    unlocked: number;
    byRarity: Record<Badge['rarity'], number>;
    byCategory: Record<Badge['category'], number>;
    totalXpFromBadges: number;
  } {
    const userBadgeIds = this.getUserBadges(userId);
    const userBadges = userBadgeIds.map(id => this.badges.get(id)!).filter(Boolean);
    
    const stats = {
      total: this.badges.size,
      unlocked: userBadges.length,
      byRarity: {
        common: 0,
        uncommon: 0,
        rare: 0,
        epic: 0,
        legendary: 0
      },
      byCategory: {
        learning: 0,
        achievement: 0,
        milestone: 0,
        special: 0,
        community: 0
      },
      totalXpFromBadges: 0
    };

    userBadges.forEach(badge => {
      stats.byRarity[badge.rarity]++;
      stats.byCategory[badge.category]++;
      stats.totalXpFromBadges += badge.xpReward;
    });

    return stats;
  }

  /**
   * Add event listener for badge unlocks
   */
  onBadgeUnlock(listener: (event: BadgeUnlockEvent) => void): void {
    this.eventListeners.push(listener);
  }

  /**
   * Remove event listener
   */
  removeEventListener(listener: (event: BadgeUnlockEvent) => void): void {
    const index = this.eventListeners.indexOf(listener);
    if (index > -1) {
      this.eventListeners.splice(index, 1);
    }
  }

  /**
   * Check if a badge requirement is met
   */
  private checkBadgeRequirement(requirement: BadgeRequirement, progress: UserProgress): boolean {
    switch (requirement.type) {
      case 'complete_lessons':
        return progress.stats.lessonsCompleted >= requirement.target;
      
      case 'quiz_streak':
        // This would need additional logic to track quiz streaks
        return progress.stats.currentStreak >= requirement.target;
      
      case 'perfect_score':
        return progress.stats.perfectScores >= requirement.target;
      
      case 'time_spent':
        return progress.stats.totalTimeSpent >= requirement.target;
      
      case 'projects_completed':
        return progress.stats.projectsCompleted >= requirement.target;
      
      case 'help_others':
        // This would be tracked separately in community features
        return false; // Placeholder
      
      case 'daily_streak':
        return progress.stats.currentStreak >= requirement.target;
      
      case 'skill_mastery':
        // Check if all skills are at target level
        const skillLevels = Object.values(progress.skillProgress);
        if (skillLevels.length === 0) return false;
        const averageLevel = skillLevels.reduce((sum, skill) => sum + skill.level, 0) / skillLevels.length;
        return averageLevel >= requirement.target;
      
      case 'code_lines':
        return progress.stats.linesOfCode >= requirement.target;
      
      case 'error_free_sessions':
        return progress.stats.errorFreeSessions >= requirement.target;
      
      default:
        return false;
    }
  }

  /**
   * Get current progress value for a requirement
   */
  private getCurrentProgressValue(requirement: BadgeRequirement, progress: UserProgress): number {
    switch (requirement.type) {
      case 'complete_lessons':
        return progress.stats.lessonsCompleted;
      case 'quiz_streak':
        return progress.stats.currentStreak;
      case 'perfect_score':
        return progress.stats.perfectScores;
      case 'time_spent':
        return progress.stats.totalTimeSpent;
      case 'projects_completed':
        return progress.stats.projectsCompleted;
      case 'daily_streak':
        return progress.stats.currentStreak;
      case 'skill_mastery':
        const skillLevels = Object.values(progress.skillProgress);
        if (skillLevels.length === 0) return 0;
        return skillLevels.reduce((sum, skill) => sum + skill.level, 0) / skillLevels.length;
      case 'code_lines':
        return progress.stats.linesOfCode;
      case 'error_free_sessions':
        return progress.stats.errorFreeSessions;
      case 'help_others':
        return 0; // Placeholder
      default:
        return 0;
    }
  }

  /**
   * Export user badge data
   */
  exportUserData(userId: string): {
    badges: string[];
    stats: ReturnType<typeof this.getUserBadgeStats>;
  } {
    return {
      badges: this.getUserBadges(userId),
      stats: this.getUserBadgeStats(userId)
    };
  }

  /**
   * Import user badge data
   */
  importUserData(userId: string, data: { badges: string[] }): void {
    this.userBadges.set(userId, new Set(data.badges));
  }

  /**
   * Reset user progress (for testing or admin purposes)
   */
  resetUserBadges(userId: string): void {
    this.userBadges.delete(userId);
  }
}

// Export singleton instance
export const badgeSystem = new BadgeSystem();

// Export utility functions
export const BadgeUtils = {
  /**
   * Get rarity color class
   */
  getRarityColor: (rarity: Badge['rarity']): string => {
    const colors = {
      common: 'text-gray-600 bg-gray-100',
      uncommon: 'text-green-600 bg-green-100',
      rare: 'text-blue-600 bg-blue-100',
      epic: 'text-purple-600 bg-purple-100',
      legendary: 'text-yellow-600 bg-yellow-100'
    };
    return colors[rarity] || colors.common;
  },

  /**
   * Get category color class
   */
  getCategoryColor: (category: Badge['category']): string => {
    const colors = {
      learning: 'text-blue-600 bg-blue-100',
      achievement: 'text-green-600 bg-green-100',
      milestone: 'text-purple-600 bg-purple-100',
      special: 'text-orange-600 bg-orange-100',
      community: 'text-pink-600 bg-pink-100'
    };
    return colors[category] || colors.learning;
  },

  /**
   * Format time for time-based requirements
   */
  formatTime: (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  },

  /**
   * Get rarity weight for sorting
   */
  getRarityWeight: (rarity: Badge['rarity']): number => {
    const weights = {
      common: 1,
      uncommon: 2,
      rare: 3,
      epic: 4,
      legendary: 5
    };
    return weights[rarity] || 0;
  }
};

export default badgeSystem;