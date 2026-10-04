// File location: src/components/dashboard/BadgeDisplay.tsx

import { useState } from 'react';

import { useLocalStorage } from '../../hooks/useLocalStorage';

import type React from 'react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  category: 'learning' | 'practice' | 'mastery' | 'community' | 'special';
  unlockedAt?: Date;
  condition: {
    type: 'xp' | 'streak' | 'completion' | 'speed' | 'perfect' | 'milestone';
    value: number;
    description: string;
  };
  progress?: number;
  maxProgress?: number;
}

interface BadgeCollection {
  badges: Badge[];
  featuredBadge?: string;
  totalBadges: number;
  unlockedBadges: number;
}

const DEFAULT_BADGES: Badge[] = [
  // Learning Badges
  {
    id: 'first-concept',
    name: 'First Steps',
    description: 'Complete your first TypeScript concept',
    icon: '👶',
    rarity: 'common',
    category: 'learning',
    condition: { type: 'completion', value: 1, description: 'Complete 1 concept' }
  },
  {
    id: 'knowledge-seeker',
    name: 'Knowledge Seeker',
    description: 'Complete 10 different concepts',
    icon: '🧠',
    rarity: 'uncommon',
    category: 'learning',
    condition: { type: 'completion', value: 10, description: 'Complete 10 concepts' }
  },
  {
    id: 'type-master',
    name: 'Type Master',
    description: 'Master all basic TypeScript types',
    icon: '🎯',
    rarity: 'rare',
    category: 'learning',
    condition: { type: 'completion', value: 100, description: 'Complete all basic type concepts' }
  },
  {
    id: 'scholar',
    name: 'TypeScript Scholar',
    description: 'Accumulate 1000 XP in learning',
    icon: '📚',
    rarity: 'epic',
    category: 'learning',
    condition: { type: 'xp', value: 1000, description: 'Earn 1000 XP from learning activities' }
  },

  // Practice Badges
  {
    id: 'hands-on',
    name: 'Hands On',
    description: 'Complete your first mini project',
    icon: '🛠️',
    rarity: 'common',
    category: 'practice',
    condition: { type: 'completion', value: 1, description: 'Complete 1 mini project' }
  },
  {
    id: 'builder',
    name: 'Builder',
    description: 'Complete 5 mini projects',
    icon: '🏗️',
    rarity: 'uncommon',
    category: 'practice',
    condition: { type: 'completion', value: 5, description: 'Complete 5 mini projects' }
  },
  {
    id: 'architect',
    name: 'Code Architect',
    description: 'Complete all mini projects with perfect scores',
    icon: '🏛️',
    rarity: 'legendary',
    category: 'practice',
    condition: { type: 'perfect', value: 15, description: 'Complete all 15 mini projects perfectly' }
  },

  // Mastery Badges
  {
    id: 'quiz-master',
    name: 'Quiz Master',
    description: 'Score 100% on 10 quizzes',
    icon: '🎓',
    rarity: 'rare',
    category: 'mastery',
    condition: { type: 'perfect', value: 10, description: 'Get perfect scores on 10 quizzes' }
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Complete a quiz in under 30 seconds',
    icon: '⚡',
    rarity: 'epic',
    category: 'mastery',
    condition: { type: 'speed', value: 30, description: 'Complete a quiz in less than 30 seconds' }
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Maintain 100% accuracy across 50 questions',
    icon: '💎',
    rarity: 'legendary',
    category: 'mastery',
    condition: { type: 'perfect', value: 50, description: 'Answer 50 consecutive questions correctly' }
  },

  // Community Badges
  {
    id: 'helpful',
    name: 'Helpful',
    description: 'Share 5 code snippets',
    icon: '🤝',
    rarity: 'uncommon',
    category: 'community',
    condition: { type: 'completion', value: 5, description: 'Share 5 code snippets with the community' }
  },
  {
    id: 'mentor',
    name: 'Mentor',
    description: 'Help 10 other developers',
    icon: '🎖️',
    rarity: 'epic',
    category: 'community',
    condition: { type: 'completion', value: 10, description: 'Provide assistance to 10 community members' }
  },

  // Special Badges
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Complete lessons before 8 AM for 7 days',
    icon: '🌅',
    rarity: 'rare',
    category: 'special',
    condition: { type: 'streak', value: 7, description: 'Study before 8 AM for 7 consecutive days' }
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Complete lessons after 10 PM for 7 days',
    icon: '🦉',
    rarity: 'rare',
    category: 'special',
    condition: { type: 'streak', value: 7, description: 'Study after 10 PM for 7 consecutive days' }
  },
  {
    id: 'dedication',
    name: 'Dedication',
    description: 'Maintain a 30-day learning streak',
    icon: '🔥',
    rarity: 'legendary',
    category: 'special',
    condition: { type: 'streak', value: 30, description: 'Study for 30 consecutive days' }
  },
  {
    id: 'milestone-100',
    name: 'Centurion',
    description: 'Reach 100 total completions',
    icon: '💯',
    rarity: 'epic',
    category: 'special',
    condition: { type: 'milestone', value: 100, description: 'Complete 100 learning activities' }
  }
];

const BadgeDisplay: React.FC = () => {
  const [badgeCollection, setBadgeCollection] = useLocalStorage<BadgeCollection>('tsverse-badges', {
    badges: DEFAULT_BADGES,
    totalBadges: DEFAULT_BADGES.length,
    unlockedBadges: 0
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const getRarityColor = (rarity: Badge['rarity']): string => {
    const colors = {
      common: 'bg-gray-400 border-gray-500',
      uncommon: 'bg-green-400 border-green-500',
      rare: 'bg-blue-400 border-blue-500',
      epic: 'bg-purple-400 border-purple-500',
      legendary: 'bg-yellow-400 border-yellow-500'
    };
    return colors[rarity];
  };

  const getRarityGlow = (rarity: Badge['rarity']): string => {
    const glows = {
      common: '',
      uncommon: 'shadow-green-200',
      rare: 'shadow-blue-200',
      epic: 'shadow-purple-200',
      legendary: 'shadow-yellow-200 animate-pulse'
    };
    return glows[rarity];
  };

  const getCategoryIcon = (category: Badge['category']): string => {
    const icons = {
      learning: '📚',
      practice: '⚡',
      mastery: '🏆',
      community: '👥',
      special: '⭐'
    };
    return icons[category];
  };

  const unlockBadge = (badgeId: string) => {
    setBadgeCollection(prev => ({
      ...prev,
      badges: prev.badges.map(badge =>
        badge.id === badgeId && !badge.unlockedAt
          ? { ...badge, unlockedAt: new Date() }
          : badge
      ),
      unlockedBadges: prev.badges.filter(b => b.unlockedAt || b.id === badgeId).length
    }));
  };

  const setFeaturedBadge = (badgeId: string) => {
    setBadgeCollection(prev => ({
      ...prev,
      featuredBadge: badgeId
    }));
  };

  const filteredBadges = badgeCollection.badges.filter(badge => {
    if (selectedCategory !== 'all' && badge.category !== selectedCategory) return false;
    if (selectedRarity !== 'all' && badge.rarity !== selectedRarity) return false;
    if (showUnlockedOnly && !badge.unlockedAt) return false;
    return true;
  });

  const rarityStats = badgeCollection.badges.reduce<Record<string, { total: number; unlocked: number }>>((acc, badge) => {
    const stats = acc[badge.rarity] ?? { total: 0, unlocked: 0 };
    stats.total++;
    if (badge.unlockedAt) stats.unlocked++;
    acc[badge.rarity] = stats;
    return acc;
  }, {});

  const featuredBadge = badgeCollection.badges.find(b => b.id === badgeCollection.featuredBadge);
  const completionPercentage = Math.round((badgeCollection.unlockedBadges / badgeCollection.totalBadges) * 100);

  return (
    <div className="badge-display bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Badge Collection
          </h2>
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <span>{badgeCollection.unlockedBadges} / {badgeCollection.totalBadges} unlocked</span>
            <span>•</span>
            <span>{completionPercentage}% complete</span>
          </div>
        </div>
        
        <div className="mt-4 lg:mt-0 flex flex-wrap gap-2">
          <button
            onClick={() => unlockBadge('first-concept')}
            className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
          >
            Test Unlock
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Collection Progress
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {completionPercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className="h-3 bg-linear-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Featured Badge */}
      {featuredBadge && (
        <div className="featured-badge mb-6 p-4 bg-linear-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-lg border-2 border-purple-300 dark:border-purple-600">
          <div className="flex items-center space-x-4">
            <div className={`badge-icon w-16 h-16 rounded-full flex items-center justify-center text-2xl ${getRarityColor(featuredBadge.rarity)} ${getRarityGlow(featuredBadge.rarity)}`}>
              {featuredBadge.icon}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Featured: {featuredBadge.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                {featuredBadge.description}
              </p>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-sm text-xs font-medium ${getRarityColor(featuredBadge.rarity)} text-white`}>
                  {featuredBadge.rarity.toUpperCase()}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {getCategoryIcon(featuredBadge.category)} {featuredBadge.category}
                </span>
              </div>
            </div>
            {featuredBadge.unlockedAt && (
              <div className="text-green-500 text-2xl">✓</div>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters mb-6 flex flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <label htmlFor="badge-category-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300">Category:</label>
          <select
            id="badge-category-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="all">All</option>
            <option value="learning">📚 Learning</option>
            <option value="practice">⚡ Practice</option>
            <option value="mastery">🏆 Mastery</option>
            <option value="community">👥 Community</option>
            <option value="special">⭐ Special</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <label htmlFor="badge-rarity-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300">Rarity:</label>
          <select
            id="badge-rarity-filter"
            value={selectedRarity}
            onChange={(e) => setSelectedRarity(e.target.value)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="all">All</option>
            <option value="common">Common</option>
            <option value="uncommon">Uncommon</option>
            <option value="rare">Rare</option>
            <option value="epic">Epic</option>
            <option value="legendary">Legendary</option>
          </select>
        </div>
        
        <label className="flex items-center space-x-2 text-sm">
          <input
            type="checkbox"
            checked={showUnlockedOnly}
            onChange={(e) => setShowUnlockedOnly(e.target.checked)}
            className="rounded-sm border-gray-300 dark:border-gray-600"
          />
          <span className="text-gray-700 dark:text-gray-300">Show unlocked only</span>
        </label>
      </div>

      {/* Rarity Statistics */}
      <div className="rarity-stats mb-6 grid grid-cols-2 lg:grid-cols-5 gap-4">
        {Object.entries(rarityStats).map(([rarity, stats]) => (
          <div
            key={rarity}
            className={`stat-card p-3 rounded-lg border-2 ${getRarityColor(rarity as Badge['rarity'])}`}
          >
            <div className="text-center">
              <div className="text-lg font-bold text-white">
                {stats.unlocked}/{stats.total}
              </div>
              <div className="text-xs text-white opacity-90 capitalize">
                {rarity}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Badge Grid */}
      <div className="badge-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredBadges.map(badge => (
          <div
            key={badge.id}
            role="button"
            tabIndex={0}
            onClick={() => setSelectedBadge(badge)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSelectedBadge(badge);
              }
            }}
            className={`badge-card relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
              badge.unlockedAt
                ? `${getRarityColor(badge.rarity)} ${getRarityGlow(badge.rarity)} shadow-lg`
                : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 opacity-60'
            }`}
          >
            {/* Badge Icon */}
            <div className="badge-icon w-12 h-12 mx-auto mb-2 flex items-center justify-center text-2xl bg-white dark:bg-gray-800 rounded-full">
              {badge.unlockedAt ? badge.icon : '🔒'}
            </div>
            
            {/* Badge Name */}
            <h4 className={`text-sm font-bold text-center mb-1 ${
              badge.unlockedAt ? 'text-white' : 'text-gray-600 dark:text-gray-400'
            }`}>
              {badge.name}
            </h4>
            
            {/* Category Icon */}
            <div className="text-center">
              <span className="text-xs opacity-75">
                {getCategoryIcon(badge.category)}
              </span>
            </div>
            
            {/* Progress Bar (if applicable) */}
            {badge.progress !== undefined && badge.maxProgress && (
              <div className="mt-2">
                <div className="w-full bg-white/20 rounded-full h-1">
                  <div
                    className="h-1 bg-white rounded-full transition-all duration-300"
                    style={{ width: `${(badge.progress / badge.maxProgress) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-white/75 text-center mt-1">
                  {badge.progress}/{badge.maxProgress}
                </div>
              </div>
            )}
            
            {/* Unlock Date */}
            {badge.unlockedAt && (
              <div className="absolute top-2 right-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              </div>
            )}
            
            {/* Featured Badge Indicator */}
            {badgeCollection.featuredBadge === badge.id && (
              <div className="absolute -top-2 -left-2">
                <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs">
                  ⭐
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {selectedBadge.name}
              </h3>
              <button
                onClick={() => setSelectedBadge(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            
            <div className="text-center mb-4">
              <div className={`badge-icon w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center text-4xl ${getRarityColor(selectedBadge.rarity)} ${getRarityGlow(selectedBadge.rarity)}`}>
                {selectedBadge.unlockedAt ? selectedBadge.icon : '🔒'}
              </div>
              
              <div className="flex justify-center space-x-2 mb-4">
                <span className={`px-3 py-1 rounded-sm text-sm font-medium ${getRarityColor(selectedBadge.rarity)} text-white`}>
                  {selectedBadge.rarity.toUpperCase()}
                </span>
                <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-sm text-sm">
                  {getCategoryIcon(selectedBadge.category)} {selectedBadge.category}
                </span>
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
              {selectedBadge.description}
            </p>
            
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Unlock Condition
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedBadge.condition.description}
              </p>
            </div>
            
            {selectedBadge.unlockedAt ? (
              <div className="text-center">
                <div className="text-green-500 text-lg font-semibold mb-2">
                  ✅ Unlocked!
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedBadge.unlockedAt.toLocaleDateString()}
                </div>
                <button
                  onClick={() => setFeaturedBadge(selectedBadge.id)}
                  className="mt-3 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Set as Featured
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-gray-500 dark:text-gray-400 text-lg font-semibold mb-2">
                  🔒 Locked
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Complete the condition above to unlock this badge
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BadgeDisplay;