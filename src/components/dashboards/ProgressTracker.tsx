/* File: src/components/dashboards/ProgressTracker.tsx */

import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface SkillProgress {
  id: string;
  name: string;
  category: string;
  currentLevel: number;
  maxLevel: number;
  xp: number;
  xpToNextLevel: number;
  description: string;
  icon: string;
  lastUpdated: Date;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  requirement: {
    type: 'skill_level' | 'total_xp' | 'quiz_score' | 'project_complete' | 'streak';
    target: number;
    skillId?: string;
  };
}

interface LearningStreak {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date;
}

interface ProgressTrackerProps {
  skills?: SkillProgress[];
  achievements?: Achievement[];
  onSkillLevelUp?: (skillId: string, newLevel: number) => void;
  onAchievementUnlocked?: (achievementId: string) => void;
  className?: string;
}

const DEFAULT_SKILLS: SkillProgress[] = [
  {
    id: 'basics',
    name: 'TypeScript Basics',
    category: 'fundamentals',
    currentLevel: 1,
    maxLevel: 10,
    xp: 150,
    xpToNextLevel: 200,
    description: 'Variables, types, interfaces, and basic syntax',
    icon: '🔤',
    lastUpdated: new Date()
  },
  {
    id: 'advanced-types',
    name: 'Advanced Types',
    category: 'intermediate',
    currentLevel: 0,
    maxLevel: 8,
    xp: 0,
    xpToNextLevel: 100,
    description: 'Union types, intersection types, and conditional types',
    icon: '🎯',
    lastUpdated: new Date()
  },
  {
    id: 'generics',
    name: 'Generics',
    category: 'intermediate',
    currentLevel: 0,
    maxLevel: 7,
    xp: 50,
    xpToNextLevel: 150,
    description: 'Generic functions, classes, and constraints',
    icon: '🔧',
    lastUpdated: new Date()
  },
  {
    id: 'decorators',
    name: 'Decorators',
    category: 'advanced',
    currentLevel: 0,
    maxLevel: 5,
    xp: 0,
    xpToNextLevel: 200,
    description: 'Class decorators, method decorators, and metadata',
    icon: '✨',
    lastUpdated: new Date()
  }
];

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Complete your first TypeScript lesson',
    icon: '👶',
    requirement: { type: 'skill_level', target: 1, skillId: 'basics' }
  },
  {
    id: 'type-master',
    name: 'Type Master',
    description: 'Reach level 5 in TypeScript Basics',
    icon: '🎓',
    requirement: { type: 'skill_level', target: 5, skillId: 'basics' }
  },
  {
    id: 'xp-collector',
    name: 'XP Collector',
    description: 'Earn 1000 total experience points',
    icon: '💎',
    requirement: { type: 'total_xp', target: 1000 }
  },
  {
    id: 'quiz-ace',
    name: 'Quiz Ace',
    description: 'Score 100% on a quiz',
    icon: '🏆',
    requirement: { type: 'quiz_score', target: 100 }
  },
  {
    id: 'week-warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day learning streak',
    icon: '🔥',
    requirement: { type: 'streak', target: 7 }
  }
];

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  skills: propSkills,
  achievements: propAchievements,
  onSkillLevelUp,
  onAchievementUnlocked,
  className = '',
}) => {
  const [skills, setSkills] = useLocalStorage<SkillProgress[]>('user-skills', propSkills || DEFAULT_SKILLS);
  const [achievements, setAchievements] = useLocalStorage<Achievement[]>('user-achievements', propAchievements || DEFAULT_ACHIEVEMENTS);
  const [streak, setStreak] = useLocalStorage<LearningStreak>('learning-streak', {
    currentStreak: 1,
    longestStreak: 1,
    lastActiveDate: new Date()
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'fundamentals', 'intermediate', 'advanced'];

  // Calculate total XP
  const totalXP = skills.reduce((sum, skill) => sum + skill.xp, 0);

  // Filter skills by category
  const filteredSkills = selectedCategory === 'all' 
    ? skills 
    : skills.filter(skill => skill.category === selectedCategory);

  // Get unlocked achievements
  const unlockedAchievements = achievements.filter(achievement => achievement.unlockedAt);
  const lockedAchievements = achievements.filter(achievement => !achievement.unlockedAt);

  // Add XP to a skill
  const addXP = (skillId: string, xpGain: number) => {
    setSkills(prevSkills => 
      prevSkills.map(skill => {
        if (skill.id !== skillId) return skill;

        let newXP = skill.xp + xpGain;
        let newLevel = skill.currentLevel;
        let xpToNext = skill.xpToNextLevel;

        // Level up logic
        while (newXP >= xpToNext && newLevel < skill.maxLevel) {
          newXP -= xpToNext;
          newLevel++;
          xpToNext = Math.floor(xpToNext * 1.2); // Increase XP requirement by 20% each level
          
          onSkillLevelUp?.(skillId, newLevel);
        }

        return {
          ...skill,
          xp: newXP,
          currentLevel: newLevel,
          xpToNextLevel: xpToNext,
          lastUpdated: new Date()
        };
      })
    );

    // Update streak
    updateStreak();
    
    // Check for achievement unlocks
    checkAchievements();
  };

  // Update learning streak
  const updateStreak = () => {
    const today = new Date();
    const lastActive = new Date(streak.lastActiveDate);
    const daysDiff = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) {
      // Same day, no change
      return;
    } else if (daysDiff === 1) {
      // Next day, continue streak
      setStreak(prev => ({
        currentStreak: prev.currentStreak + 1,
        longestStreak: Math.max(prev.longestStreak, prev.currentStreak + 1),
        lastActiveDate: today
      }));
    } else {
      // Streak broken
      setStreak(prev => ({
        currentStreak: 1,
        longestStreak: prev.longestStreak,
        lastActiveDate: today
      }));
    }
  };

  // Check for new achievement unlocks
  const checkAchievements = () => {
    setAchievements(prevAchievements =>
      prevAchievements.map(achievement => {
        if (achievement.unlockedAt) return achievement;

        let shouldUnlock = false;
        const { requirement } = achievement;

        switch (requirement.type) {
          case 'skill_level':
            const targetSkill = skills.find(skill => skill.id === requirement.skillId);
            shouldUnlock = targetSkill ? targetSkill.currentLevel >= requirement.target : false;
            break;
          case 'total_xp':
            shouldUnlock = totalXP >= requirement.target;
            break;
          case 'streak':
            shouldUnlock = streak.currentStreak >= requirement.target;
            break;
          // Add more cases as needed
        }

        if (shouldUnlock) {
          onAchievementUnlocked?.(achievement.id);
          return {
            ...achievement,
            unlockedAt: new Date()
          };
        }

        return achievement;
      })
    );
  };

  // Get level progress percentage
  const getLevelProgress = (skill: SkillProgress) => {
    if (skill.currentLevel >= skill.maxLevel) return 100;
    return Math.round((skill.xp / skill.xpToNextLevel) * 100);
  };

  // Get skill level label
  const getSkillLevelLabel = (level: number) => {
    if (level === 0) return 'Novice';
    if (level <= 2) return 'Beginner';
    if (level <= 4) return 'Intermediate';
    if (level <= 7) return 'Advanced';
    if (level <= 9) return 'Expert';
    return 'Master';
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'fundamentals': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  // Expose addXP function for external use
  React.useImperativeHandle(React.forwardRef(() => null), () => ({
    addXP
  }));

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{totalXP}</div>
              <div className="text-blue-100">Total XP</div>
            </div>
            <div className="text-3xl opacity-80">⭐</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{streak.currentStreak}</div>
              <div className="text-green-100">Day Streak</div>
            </div>
            <div className="text-3xl opacity-80">🔥</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-pink-600 text-white p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{unlockedAchievements.length}</div>
              <div className="text-orange-100">Achievements</div>
            </div>
            <div className="text-3xl opacity-80">🏆</div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors capitalize ${
              selectedCategory === category
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSkills.map(skill => (
          <div key={skill.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{skill.icon}</div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {skill.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(skill.category)}`}>
                      {skill.category}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Level {skill.currentLevel}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {getSkillLevelLabel(skill.currentLevel)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {skill.xp} XP
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {skill.description}
            </p>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Progress to next level</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {getLevelProgress(skill)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 relative overflow-hidden"
                  style={{ width: `${getLevelProgress(skill)}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{skill.xp} XP</span>
                {skill.currentLevel < skill.maxLevel && (
                  <span>{skill.xpToNextLevel} XP to next level</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Achievements Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          🏆 Achievements
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
            ({unlockedAchievements.length}/{achievements.length})
          </span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map(achievement => (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                achievement.unlockedAt
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`text-2xl ${achievement.unlockedAt ? '' : 'grayscale'}`}>
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium ${
                    achievement.unlockedAt 
                      ? 'text-green-800 dark:text-green-200' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {achievement.name}
                  </h4>
                  <p className={`text-sm mt-1 ${
                    achievement.unlockedAt
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {achievement.description}
                  </p>
                  {achievement.unlockedAt && (
                    <div className="text-xs text-green-500 dark:text-green-400 mt-2">
                      Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Debug Controls (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
            Development Controls
          </h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => addXP('basics', 50)}
              className="px-3 py-1 bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded text-sm"
            >
              +50 XP to Basics
            </button>
            <button
              onClick={() => addXP('advanced-types', 100)}
              className="px-3 py-1 bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded text-sm"
            >
              +100 XP to Advanced Types
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;