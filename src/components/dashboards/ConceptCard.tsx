// File: src/components/dashboards/ConceptCard.tsx

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { soundManager } from '../../assets/sounds';

export interface ConceptProgress {
  completed: number;
  total: number;
  percentage: number;
}

export interface ConceptBadge {
  id: string;
  name: string;
  icon: string;
  color: string;
  earned: boolean;
  earnedAt?: Date;
}

export interface ConceptStats {
  timeSpent: number; // in minutes
  exercisesCompleted: number;
  quizzesPassed: number;
  lastAccessed?: Date;
}

export interface ConceptCardProps {
  id: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: string;
  tags: string[];
  progress: ConceptProgress;
  badges: ConceptBadge[];
  stats: ConceptStats;
  isLocked?: boolean;
  prerequisites?: string[];
  estimatedTime: number; // in minutes
  className?: string;
  onStart?: (conceptId: string) => void;
  onContinue?: (conceptId: string) => void;
  onViewDetails?: (conceptId: string) => void;
  onBookmark?: (conceptId: string, bookmarked: boolean) => void;
  isBookmarked?: boolean;
  showQuickPreview?: boolean;
  previewContent?: React.ReactNode;
}

const ConceptCard: React.FC<ConceptCardProps> = ({
  id,
  title,
  description,
  icon,
  difficulty,
  category,
  tags,
  progress,
  badges,
  stats,
  isLocked = false,
  prerequisites = [],
  estimatedTime,
  className = '',
  onStart,
  onContinue,
  onViewDetails,
  onBookmark,
  isBookmarked = false,
  showQuickPreview = false,
  previewContent
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Difficulty configurations
  const difficultyConfig = {
    beginner: {
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      label: 'Beginner'
    },
    intermediate: {
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      label: 'Intermediate'
    },
    advanced: {
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
      borderColor: 'border-orange-200 dark:border-orange-800',
      label: 'Advanced'
    },
    expert: {
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      label: 'Expert'
    }
  };

  const config = difficultyConfig[difficulty];
  const isStarted = progress.completed > 0;
  const isCompleted = progress.percentage === 100;
  const earnedBadges = badges.filter(badge => badge.earned);

  // Format time display
  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Handle action clicks
  const handleStart = () => {
    soundManager.playClick();
    onStart?.(id);
  };

  const handleContinue = () => {
    soundManager.playClick();
    onContinue?.(id);
  };

  const handleViewDetails = () => {
    soundManager.playClick();
    onViewDetails?.(id);
  };

  const handleBookmark = () => {
    soundManager.playClick();
    onBookmark?.(id, !isBookmarked);
  };

  const toggleExpanded = () => {
    soundManager.playClick();
    setIsExpanded(!isExpanded);
  };

  const togglePreview = () => {
    soundManager.playClick();
    setShowPreview(!showPreview);
  };

  return (
    <Card
      className={`
        relative overflow-hidden transition-all duration-300
        ${isLocked ? 'opacity-60' : 'hover:shadow-lg hover:-translate-y-1'}
        ${config.borderColor}
        ${className}
      `}
      variant={isCompleted ? 'success' : isStarted ? 'primary' : 'default'}
    >
      {/* Lock overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-gray-500/10 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 bg-gray-400 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Complete prerequisites to unlock
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3">
          {icon && (
            <div className={`
              p-2 rounded-lg ${config.bgColor}
              flex-shrink-0
            `}>
              {icon}
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {title}
              </h3>
              
              {isCompleted && (
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
              <span className={`px-2 py-1 rounded-full ${config.bgColor} ${config.color} font-medium`}>
                {config.label}
              </span>
              
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatTime(estimatedTime)}
              </span>
              
              <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                {category}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={handleBookmark}
            className={`
              p-2 rounded-lg transition-colors
              ${isBookmarked 
                ? 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20' 
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }
            `}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
          >
            <svg className="w-5 h-5" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>

          <button
            onClick={toggleExpanded}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
          >
            <svg className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
        {description}
      </p>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Progress
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {progress.completed}/{progress.total} ({progress.percentage}%)
          </span>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              isCompleted ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, isExpanded ? tags.length : 3).map(tag => (
              <span 
                key={tag}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                {tag}
              </span>
            ))}
            
            {!isExpanded && tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-gray-500 dark:text-gray-400">
                +{tags.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Expanded Content */}
      {isExpanded && (
        <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatTime(stats.timeSpent)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Time Spent</div>
            </div>
            
            <div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats.exercisesCompleted}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Exercises</div>
            </div>
            
            <div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats.quizzesPassed}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Quizzes</div>
            </div>
          </div>

          {/* Badges */}
          {earnedBadges.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Earned Badges ({earnedBadges.length})
              </h4>
              
              <div className="flex flex-wrap gap-2">
                {earnedBadges.map(badge => (
                  <div 
                    key={badge.id}
                    className="flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200"
                  >
                    <span>{badge.icon}</span>
                    <span>{badge.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prerequisites */}
          {prerequisites.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Prerequisites
              </h4>
              
              <div className="flex flex-wrap gap-1">
                {prerequisites.map(prereq => (
                  <span 
                    key={prereq}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                  >
                    {prereq}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quick Preview */}
          {showQuickPreview && previewContent && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Quick Preview
                </h4>
                
                <button
                  onClick={togglePreview}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {showPreview ? 'Hide' : 'Show'} Preview
                </button>
              </div>
              
              {showPreview && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                  {previewContent}
                </div>
              )}
            </div>
          )}

          {/* Last Accessed */}
          {stats.lastAccessed && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Last accessed: {stats.lastAccessed.toLocaleDateString()}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-2 pt-4">
        {!isLocked && (
          <>
            {!isStarted ? (
              <button
                onClick={handleStart}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Start Learning
              </button>
            ) : !isCompleted ? (
              <button
                onClick={handleContinue}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Continue ({progress.percentage}%)
              </button>
            ) : (
              <button
                onClick={handleViewDetails}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Review Completed
              </button>
            )}

            <button
              onClick={handleViewDetails}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Details
            </button>
          </>
        )}
        
        {isLocked && (
          <div className="flex-1 text-center text-sm text-gray-500 dark:text-gray-400 py-2">
            Complete {prerequisites.length} prerequisite{prerequisites.length > 1 ? 's' : ''} to unlock
          </div>
        )}
      </div>
    </Card>
  );
};

export default ConceptCard;