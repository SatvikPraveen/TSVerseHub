// File: src/pages/Dashboard.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Code2, 
  Trophy, 
  Clock, 
  TrendingUp, 
  Star,
  Target,
  Zap,
  CheckCircle,
  ArrowRight,
  Calendar,
  Play,
  Users,
  Award,
  BarChart3,
  Activity
} from 'lucide-react';
import { Card, ConceptCard, ProjectCard, StatsCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import clsx from 'clsx';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  unlocked: boolean;
  progress?: number;
  date?: string;
}

interface RecentActivity {
  id: string;
  type: 'concept' | 'project' | 'achievement';
  title: string;
  description: string;
  timestamp: string;
  progress?: number;
}

interface LearningStreak {
  current: number;
  longest: number;
  lastActivity: string;
}

const mockUserData = {
  name: 'Alex Developer',
  level: 'Intermediate',
  totalProgress: 68,
  conceptsCompleted: 12,
  totalConcepts: 25,
  projectsCompleted: 3,
  totalProjects: 8,
  streak: {
    current: 7,
    longest: 15,
    lastActivity: '2024-08-23'
  } as LearningStreak,
  joinDate: '2024-01-15'
};

const achievements: Achievement[] = [
  {
    id: '1',
    title: 'TypeScript Explorer',
    description: 'Completed your first TypeScript concept',
    icon: Target,
    unlocked: true,
    date: '2024-08-20'
  },
  {
    id: '2',
    title: 'Code Warrior',
    description: 'Finished 5 programming challenges',
    icon: Trophy,
    unlocked: true,
    date: '2024-08-21'
  },
  {
    id: '3',
    title: 'Generic Master',
    description: 'Master all generic concepts',
    icon: Zap,
    unlocked: false,
    progress: 75
  },
  {
    id: '4',
    title: 'Project Builder',
    description: 'Complete 3 mini-projects',
    icon: Code2,
    unlocked: true,
    date: '2024-08-22'
  },
  {
    id: '5',
    title: 'Streak Champion',
    description: 'Maintain a 30-day learning streak',
    icon: Award,
    unlocked: false,
    progress: 23
  }
];

const recentActivity: RecentActivity[] = [
  {
    id: '1',
    type: 'concept',
    title: 'Advanced Types',
    description: 'Completed conditional types lesson',
    timestamp: '2 hours ago',
    progress: 85
  },
  {
    id: '2',
    type: 'project',
    title: 'Form Validation',
    description: 'Added custom validator functions',
    timestamp: '1 day ago',
    progress: 60
  },
  {
    id: '3',
    type: 'achievement',
    title: 'Project Builder',
    description: 'Unlocked by completing 3 mini-projects',
    timestamp: '2 days ago'
  },
  {
    id: '4',
    type: 'concept',
    title: 'Generics',
    description: 'Finished generic constraints chapter',
    timestamp: '3 days ago',
    progress: 100
  }
];

const upcomingConcepts = [
  {
    title: 'Conditional Types',
    description: 'Learn to create types that depend on conditions',
    difficulty: 'advanced' as const,
    progress: 25,
    tags: ['Conditional', 'Utility Types', 'Advanced'],
    icon: <Zap className="w-6 h-6 text-purple-600" />,
  },
  {
    title: 'Template Literal Types',
    description: 'Build powerful string manipulation types',
    difficulty: 'advanced' as const,
    progress: 0,
    tags: ['Templates', 'Strings', 'Advanced'],
    icon: <BookOpen className="w-6 h-6 text-green-600" />,
  },
  {
    title: 'Decorators',
    description: 'Add metadata and modify class behavior',
    difficulty: 'intermediate' as const,
    progress: 0,
    tags: ['Decorators', 'Classes', 'Metadata'],
    icon: <Star className="w-6 h-6 text-amber-600" />,
  }
];

const Dashboard: React.FC = () => {
  const progressPercentage = Math.round(
    (mockUserData.conceptsCompleted / mockUserData.totalConcepts) * 100
  );

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'concept': return <BookOpen className="w-4 h-4" />;
      case 'project': return <Code2 className="w-4 h-4" />;
      case 'achievement': return <Trophy className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'concept': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case 'project': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30';
      case 'achievement': return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30';
      default: return 'text-slate-600 bg-slate-100 dark:bg-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Welcome back, {mockUserData.name}! 👋
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Ready to continue your TypeScript journey? Let's build something amazing today.
              </p>
            </div>
            <img
              src="/images/banners/basics-banner.png"
              alt="Learning Progress"
              className="hidden md:block w-32 h-20 object-cover rounded-lg opacity-80"
            />
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Overall Progress"
            value={`${progressPercentage}%`}
            change={{ value: 12, type: 'increase', period: 'last week' }}
            icon={<TrendingUp className="w-6 h-6 text-blue-600" />}
          />
          <StatsCard
            title="Concepts Mastered"
            value={`${mockUserData.conceptsCompleted}/${mockUserData.totalConcepts}`}
            change={{ value: 2, type: 'increase', period: 'last week' }}
            icon={<BookOpen className="w-6 h-6 text-green-600" />}
          />
          <StatsCard
            title="Projects Built"
            value={`${mockUserData.projectsCompleted}/${mockUserData.totalProjects}`}
            change={{ value: 1, type: 'increase', period: 'last week' }}
            icon={<Code2 className="w-6 h-6 text-purple-600" />}
          />
          <StatsCard
            title="Current Streak"
            value={`${mockUserData.streak.current} days`}
            icon={<Trophy className="w-6 h-6 text-amber-600" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Continue Learning */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Continue Learning
                </h2>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/concepts">
                    View All
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcomingConcepts.slice(0, 2).map((concept, index) => (
                  <ConceptCard
                    key={index}
                    {...concept}
                    onClick={() => {/* Navigate to concept */}}
                    className="animate-fadeInUp"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  />
                ))}
              </div>
            </section>

            {/* Recent Activity */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Recent Activity
                </h2>
                <Button variant="ghost" size="sm">
                  View History
                </Button>
              </div>

              <Card>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors">
                      <div className={clsx(
                        'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                        getActivityColor(activity.type)
                      )}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {activity.title}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                          {activity.description}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-500">
                          {activity.timestamp}
                        </p>
                      </div>
                      {activity.progress !== undefined && (
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                              style={{ width: `${activity.progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            {activity.progress}%
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </section>

            {/* Quick Actions */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
                Quick Actions
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto p-6 justify-start" asChild>
                  <Link to="/playground">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <Play className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">Open Playground</div>
                        <div className="text-sm text-slate-500">Try TypeScript online</div>
                      </div>
                    </div>
                  </Link>
                </Button>

                <Button variant="outline" className="h-auto p-6 justify-start" asChild>
                  <Link to="/mini-projects">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <Code2 className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">Start Project</div>
                        <div className="text-sm text-slate-500">Build something new</div>
                      </div>
                    </div>
                  </Link>
                </Button>

                <Button variant="outline" className="h-auto p-6 justify-start" asChild>
                  <Link to="/concepts">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">Learn Concept</div>
                        <div className="text-sm text-slate-500">Master new topics</div>
                      </div>
                    </div>
                  </Link>
                </Button>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Learning Streak */}
            <Card>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Learning Streak
                </h3>
                <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-1">
                  {mockUserData.streak.current}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Current streak • Best: {mockUserData.streak.longest} days
                </p>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 mb-4">
                  <div 
                    className="bg-gradient-to-r from-amber-400 to-orange-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(mockUserData.streak.current / 30) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  {30 - mockUserData.streak.current} days to Streak Master
                </p>
              </div>
            </Card>

            {/* Achievements */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Achievements
                </h3>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {achievements.filter(a => a.unlocked).length}/{achievements.length}
                </span>
              </div>
              
              <div className="space-y-3">
                {achievements.slice(0, 4).map((achievement) => {
                  const Icon = achievement.icon;
                  return (
                    <div 
                      key={achievement.id} 
                      className={clsx(
                        'flex items-center space-x-3 p-3 rounded-lg transition-all',
                        achievement.unlocked 
                          ? 'bg-green-50 dark:bg-green-900/20' 
                          : 'bg-slate-50 dark:bg-slate-800'
                      )}
                    >
                      <div className={clsx(
                        'w-8 h-8 rounded-lg flex items-center justify-center',
                        achievement.unlocked
                          ? 'bg-green-100 dark:bg-green-900/30'
                          : 'bg-slate-200 dark:bg-slate-700'
                      )}>
                        <Icon className={clsx(
                          'w-4 h-4',
                          achievement.unlocked
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-slate-500 dark:text-slate-400'
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={clsx(
                          'text-sm font-medium',
                          achievement.unlocked
                            ? 'text-slate-900 dark:text-slate-100'
                            : 'text-slate-600 dark:text-slate-400'
                        )}>
                          {achievement.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-500">
                          {achievement.description}
                        </p>
                        {achievement.progress !== undefined && !achievement.unlocked && (
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-2">
                            <div
                              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${achievement.progress}%` }}
                            />
                          </div>
                        )}
                      </div>
                      {achievement.unlocked && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                  );
                })}
              </div>
              
              <Button variant="ghost" size="sm" className="w-full mt-3">
                View All Achievements
              </Button>
            </Card>

            {/* Learning Calendar */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  This Week
                </h3>
                <Calendar className="w-5 h-5 text-slate-400" />
              </div>
              
              <div className="space-y-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                  <div key={day} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {day}
                    </span>
                    <div className={clsx(
                      'w-3 h-3 rounded-full',
                      index < 5 ? 'bg-green-400' : 'bg-slate-200 dark:bg-slate-700'
                    )} />
                  </div>
                ))}
              </div>
            </Card>

            {/* Community Stats */}
            <Card>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Community
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">Active Learners</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">2,847</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">Projects Built</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">12,456</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-amber-600" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">GitHub Stars</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">1,234</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;