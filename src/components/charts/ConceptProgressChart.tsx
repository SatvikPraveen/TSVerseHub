// File location: src/components/charts/ConceptProgressChart.tsx

import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { useDarkMode } from '../../hooks/useDarkMode';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface ConceptProgress {
  id: string;
  name: string;
  category: 'basics' | 'advanced' | 'patterns' | 'tools';
  progress: number; // 0-100
  timeSpent: number; // in minutes
  lastStudied: Date;
  difficulty: 1 | 2 | 3 | 4 | 5;
  mastery: number; // 0-100
  quizScore: number; // 0-100
}

interface StudySession {
  date: string;
  conceptId: string;
  duration: number; // minutes
  progressGain: number;
  score?: number;
}

interface ChartProps {
  height?: number;
  showLegend?: boolean;
  animate?: boolean;
  className?: string;
}

// Sample data - in a real app, this would come from props or API
const SAMPLE_CONCEPTS: ConceptProgress[] = [
  {
    id: 'basic-types',
    name: 'Basic Types',
    category: 'basics',
    progress: 95,
    timeSpent: 120,
    lastStudied: new Date('2024-01-15'),
    difficulty: 2,
    mastery: 90,
    quizScore: 95
  },
  {
    id: 'interfaces',
    name: 'Interfaces',
    category: 'basics',
    progress: 85,
    timeSpent: 180,
    lastStudied: new Date('2024-01-14'),
    difficulty: 3,
    mastery: 80,
    quizScore: 88
  },
  {
    id: 'generics',
    name: 'Generics',
    category: 'advanced',
    progress: 65,
    timeSpent: 240,
    lastStudied: new Date('2024-01-13'),
    difficulty: 4,
    mastery: 60,
    quizScore: 72
  },
  {
    id: 'decorators',
    name: 'Decorators',
    category: 'advanced',
    progress: 40,
    timeSpent: 90,
    lastStudied: new Date('2024-01-12'),
    difficulty: 5,
    mastery: 35,
    quizScore: 45
  },
  {
    id: 'design-patterns',
    name: 'Design Patterns',
    category: 'patterns',
    progress: 30,
    timeSpent: 60,
    lastStudied: new Date('2024-01-11'),
    difficulty: 4,
    mastery: 25,
    quizScore: 30
  },
  {
    id: 'compiler-api',
    name: 'Compiler API',
    category: 'tools',
    progress: 15,
    timeSpent: 30,
    lastStudied: new Date('2024-01-10'),
    difficulty: 5,
    mastery: 10,
    quizScore: 20
  }
];

const SAMPLE_SESSIONS: StudySession[] = [
  { date: '2024-01-01', conceptId: 'basic-types', duration: 30, progressGain: 15, score: 85 },
  { date: '2024-01-02', conceptId: 'basic-types', duration: 45, progressGain: 20, score: 90 },
  { date: '2024-01-03', conceptId: 'interfaces', duration: 60, progressGain: 25, score: 88 },
  { date: '2024-01-04', conceptId: 'interfaces', duration: 40, progressGain: 18, score: 85 },
  { date: '2024-01-05', conceptId: 'generics', duration: 75, progressGain: 30, score: 72 },
  { date: '2024-01-06', conceptId: 'generics', duration: 50, progressGain: 15, score: 68 },
  { date: '2024-01-07', conceptId: 'decorators', duration: 45, progressGain: 20, score: 45 },
  { date: '2024-01-08', conceptId: 'decorators', duration: 30, progressGain: 10, score: 50 },
  { date: '2024-01-09', conceptId: 'design-patterns', duration: 40, progressGain: 15, score: 30 },
  { date: '2024-01-10', conceptId: 'compiler-api', duration: 30, progressGain: 8, score: 20 }
];

const ConceptProgressChart: React.FC<ChartProps> = ({ 
  height = 400, 
  showLegend = true, 
  animate = true, 
  className = '' 
}) => {
  const { isDarkMode } = useDarkMode();
  const [chartType, setChartType] = useState<'overview' | 'progress' | 'mastery' | 'time' | 'radar'>('overview');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  
  const [concepts] = useLocalStorage<ConceptProgress[]>('tsverse-concept-progress', SAMPLE_CONCEPTS);
  const [studySessions] = useLocalStorage<StudySession[]>('tsverse-study-sessions', SAMPLE_SESSIONS);

  // Theme colors
  const colors = {
    primary: isDarkMode ? '#60A5FA' : '#2563EB',
    secondary: isDarkMode ? '#F59E0B' : '#D97706',
    success: isDarkMode ? '#10B981' : '#059669',
    warning: isDarkMode ? '#F59E0B' : '#D97706',
    error: isDarkMode ? '#EF4444' : '#DC2626',
    text: isDarkMode ? '#F3F4F6' : '#374151',
    grid: isDarkMode ? '#374151' : '#E5E7EB',
    background: isDarkMode ? '#1F2937' : '#FFFFFF'
  };

  const categoryColors = {
    basics: '#3B82F6',
    advanced: '#8B5CF6',
    patterns: '#10B981',
    tools: '#F59E0B'
  };

  const filteredConcepts = useMemo(() => {
    return concepts.filter(concept => 
      selectedCategory === 'all' || concept.category === selectedCategory
    );
  }, [concepts, selectedCategory]);

  const filteredSessions = useMemo(() => {
    const now = new Date();
    const cutoff = new Date();
    
    switch (timeRange) {
      case '7d':
        cutoff.setDate(now.getDate() - 7);
        break;
      case '30d':
        cutoff.setDate(now.getDate() - 30);
        break;
      case '90d':
        cutoff.setDate(now.getDate() - 90);
        break;
      default:
        cutoff.setFullYear(2000); // Show all
    }

    return studySessions.filter(session => new Date(session.date) >= cutoff);
  }, [studySessions, timeRange]);

  // Chart data preparations
  const overviewData = filteredConcepts.map(concept => ({
    name: concept.name,
    progress: concept.progress,
    mastery: concept.mastery,
    timeSpent: concept.timeSpent,
    category: concept.category,
    fill: categoryColors[concept.category]
  }));

  const progressOverTimeData = useMemo(() => {
    const grouped = filteredSessions.reduce((acc, session) => {
      if (!acc[session.date]) {
        acc[session.date] = { date: session.date, totalProgress: 0, sessions: 0 };
      }
      acc[session.date].totalProgress += session.progressGain;
      acc[session.date].sessions += 1;
      return acc;
    }, {} as Record<string, { date: string; totalProgress: number; sessions: number }>);

    return Object.values(grouped).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredSessions]);

  const masteryComparisonData = filteredConcepts.map(concept => ({
    name: concept.name.substring(0, 10) + (concept.name.length > 10 ? '...' : ''),
    fullName: concept.name,
    progress: concept.progress,
    mastery: concept.mastery,
    quizScore: concept.quizScore,
    category: concept.category
  }));

  const timeSpentData = filteredConcepts
    .sort((a, b) => b.timeSpent - a.timeSpent)
    .map(concept => ({
      name: concept.name.substring(0, 12) + (concept.name.length > 12 ? '...' : ''),
      fullName: concept.name,
      timeSpent: concept.timeSpent,
      fill: categoryColors[concept.category]
    }));

  const radarData = filteredConcepts.map(concept => ({
    subject: concept.name.substring(0, 8) + (concept.name.length > 8 ? '...' : ''),
    fullName: concept.name,
    progress: concept.progress,
    mastery: concept.mastery,
    difficulty: concept.difficulty * 20, // Scale to 0-100
    timeSpent: Math.min(concept.timeSpent / 3, 100) // Scale and cap at 100
  }));

  const categoryData = useMemo(() => {
    const grouped = concepts.reduce((acc, concept) => {
      if (!acc[concept.category]) {
        acc[concept.category] = { 
          category: concept.category, 
          concepts: 0, 
          totalProgress: 0, 
          totalTime: 0 
        };
      }
      acc[concept.category].concepts += 1;
      acc[concept.category].totalProgress += concept.progress;
      acc[concept.category].totalTime += concept.timeSpent;
      return acc;
    }, {} as Record<string, { category: string; concepts: number; totalProgress: number; totalTime: number }>);

    return Object.values(grouped).map(item => ({
      name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
      value: Math.round(item.totalProgress / item.concepts),
      concepts: item.concepts,
      totalTime: item.totalTime,
      fill: categoryColors[item.category as keyof typeof categoryColors]
    }));
  }, [concepts]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-3">
        <p className="font-medium text-gray-900 dark:text-white">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {`${entry.dataKey}: ${entry.value}${entry.dataKey.includes('time') ? ' min' : entry.dataKey.includes('Score') || entry.dataKey.includes('progress') || entry.dataKey.includes('mastery') ? '%' : ''}`}
          </p>
        ))}
      </div>
    );
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0].payload;

    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-3">
        <p className="font-medium text-gray-900 dark:text-white">{data.name}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Average Progress: {data.value}%
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Concepts: {data.concepts}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Total Time: {data.totalTime} min
        </p>
      </div>
    );
  };

  const renderChart = () => {
    switch (chartType) {
      case 'overview':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={overviewData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis 
                dataKey="name" 
                tick={{ fill: colors.text, fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fill: colors.text, fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend />}
              <Bar dataKey="progress" fill={colors.primary} name="Progress %" />
              <Bar dataKey="mastery" fill={colors.secondary} name="Mastery %" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'progress':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={progressOverTimeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis 
                dataKey="date" 
                tick={{ fill: colors.text, fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis tick={{ fill: colors.text, fontSize: 12 }} />
              <Tooltip 
                content={<CustomTooltip />}
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              {showLegend && <Legend />}
              <Line 
                type="monotone" 
                dataKey="totalProgress" 
                stroke={colors.primary} 
                strokeWidth={2}
                dot={{ fill: colors.primary, strokeWidth: 2, r: 4 }}
                name="Progress Gained %"
                animationDuration={animate ? 1000 : 0}
              />
              <Line 
                type="monotone" 
                dataKey="sessions" 
                stroke={colors.success} 
                strokeWidth={2}
                dot={{ fill: colors.success, strokeWidth: 2, r: 4 }}
                name="Study Sessions"
                animationDuration={animate ? 1000 : 0}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'mastery':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={masteryComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="progressGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.primary} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={colors.primary} stopOpacity={0.2}/>
                </linearGradient>
                <linearGradient id="masteryGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.secondary} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={colors.secondary} stopOpacity={0.2}/>
                </linearGradient>
                <linearGradient id="quizGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.success} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={colors.success} stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis 
                dataKey="name" 
                tick={{ fill: colors.text, fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fill: colors.text, fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend />}
              <Area
                type="monotone"
                dataKey="progress"
                stackId="1"
                stroke={colors.primary}
                fill="url(#progressGrad)"
                name="Progress %"
                animationDuration={animate ? 1000 : 0}
              />
              <Area
                type="monotone"
                dataKey="mastery"
                stackId="2"
                stroke={colors.secondary}
                fill="url(#masteryGrad)"
                name="Mastery %"
                animationDuration={animate ? 1200 : 0}
              />
              <Area
                type="monotone"
                dataKey="quizScore"
                stackId="3"
                stroke={colors.success}
                fill="url(#quizGrad)"
                name="Quiz Score %"
                animationDuration={animate ? 1400 : 0}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'time':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name}: ${value}%`}
                  animationDuration={animate ? 1000 : 0}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                {showLegend && <Legend />}
              </PieChart>
            </ResponsiveContainer>
            
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeSpentData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                <XAxis 
                  type="number" 
                  tick={{ fill: colors.text, fontSize: 12 }}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tick={{ fill: colors.text, fontSize: 12 }}
                  width={100}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="timeSpent" 
                  name="Time Spent (min)"
                  animationDuration={animate ? 1000 : 0}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <RadarChart data={radarData} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
              <PolarGrid stroke={colors.grid} />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: colors.text, fontSize: 12 }}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]}
                tick={{ fill: colors.text, fontSize: 10 }}
              />
              <Radar
                name="Progress"
                dataKey="progress"
                stroke={colors.primary}
                fill={colors.primary}
                fillOpacity={0.3}
                strokeWidth={2}
                animationDuration={animate ? 1000 : 0}
              />
              <Radar
                name="Mastery"
                dataKey="mastery"
                stroke={colors.secondary}
                fill={colors.secondary}
                fillOpacity={0.3}
                strokeWidth={2}
                animationDuration={animate ? 1200 : 0}
              />
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend />}
            </RadarChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`concept-progress-chart bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 lg:mb-0">
          Learning Progress Analytics
        </h2>
        
        <div className="flex flex-wrap gap-3">
          {/* Chart Type Selector */}
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="overview">📊 Overview</option>
            <option value="progress">📈 Progress Trend</option>
            <option value="mastery">🎯 Mastery Comparison</option>
            <option value="time">⏱️ Time & Categories</option>
            <option value="radar">🎪 Skills Radar</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="all">All Categories</option>
            <option value="basics">📚 Basics</option>
            <option value="advanced">🚀 Advanced</option>
            <option value="patterns">🏗️ Patterns</option>
            <option value="tools">🛠️ Tools</option>
          </select>

          {/* Time Range (for progress chart) */}
          {chartType === 'progress' && (
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="all">All time</option>
            </select>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="stat-card bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {Math.round(filteredConcepts.reduce((acc, c) => acc + c.progress, 0) / filteredConcepts.length)}%
          </div>
          <div className="text-sm text-blue-600 dark:text-blue-400">Avg Progress</div>
        </div>
        
        <div className="stat-card bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {Math.round(filteredConcepts.reduce((acc, c) => acc + c.mastery, 0) / filteredConcepts.length)}%
          </div>
          <div className="text-sm text-purple-600 dark:text-purple-400">Avg Mastery</div>
        </div>
        
        <div className="stat-card bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {Math.round(filteredConcepts.reduce((acc, c) => acc + c.timeSpent, 0) / 60)}h
          </div>
          <div className="text-sm text-green-600 dark:text-green-400">Total Time</div>
        </div>
        
        <div className="stat-card bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {filteredConcepts.length}
          </div>
          <div className="text-sm text-orange-600 dark:text-orange-400">Concepts</div>
        </div>
      </div>

      {/* Chart */}
      <div className="chart-container" style={{ height: chartType === 'time' ? height : 'auto' }}>
        {renderChart()}
      </div>

      {/* Chart Description */}
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        {(() => {
          switch (chartType) {
            case 'overview':
              return 'Compare progress and mastery levels across different TypeScript concepts.';
            case 'progress':
              return 'Track your learning progress over time and study session frequency.';
            case 'mastery':
              return 'Detailed comparison of progress, mastery, and quiz performance.';
            case 'time':
              return 'Category-wise progress distribution and time investment analysis.';
            case 'radar':
              return 'Multi-dimensional skill assessment including difficulty and time factors.';
            default:
              return '';
          }
        })()}
      </div>
    </div>
  );
};

export default ConceptProgressChart;