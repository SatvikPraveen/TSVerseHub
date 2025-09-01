// File: src/pages/Concepts.tsx

import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  BookOpen, 
  Code2, 
  Search, 
  Filter, 
  ChevronDown,
  Star,
  Clock,
  Users,
  ArrowRight,
  CheckCircle,
  PlayCircle,
  Target,
  Zap,
  Lightbulb,
  Cpu,
  Layers,
  Settings,
  Puzzle,
  Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, ConceptCard } from '@/components/ui/Card';
import { useDebounce } from '@/hooks/useDebounce';
import clsx from 'clsx';

interface ConceptData {
  id: string;
  title: string;
  description: string;
  category: 'basics' | 'advanced-types' | 'generics' | 'decorators' | 'namespaces-modules' | 'tsconfig' | 'compiler-api' | 'patterns';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // minutes
  progress: number; // 0-100
  isCompleted: boolean;
  isLocked: boolean;
  prerequisites: string[];
  tags: string[];
  learners: number;
  rating: number;
  icon: React.ComponentType<{ className?: string }>;
  image: string;
}

const conceptsData: ConceptData[] = [
  // Basics
  {
    id: 'variables',
    title: 'Variables & Types',
    description: 'Learn about TypeScript\'s basic types, variable declarations, and type annotations.',
    category: 'basics',
    difficulty: 'beginner',
    duration: 15,
    progress: 100,
    isCompleted: true,
    isLocked: false,
    prerequisites: [],
    tags: ['variables', 'types', 'annotations'],
    learners: 2847,
    rating: 4.9,
    icon: Target,
    image: '/images/banners/basics-banner.png'
  },
  {
    id: 'functions',
    title: 'Functions & Methods',
    description: 'Master function types, parameters, return types, and method signatures.',
    category: 'basics',
    difficulty: 'beginner',
    duration: 20,
    progress: 85,
    isCompleted: false,
    isLocked: false,
    prerequisites: ['variables'],
    tags: ['functions', 'parameters', 'return types'],
    learners: 2156,
    rating: 4.8,
    icon: Code2,
    image: '/images/banners/basics-banner.png'
  },
  {
    id: 'interfaces-vs-types',
    title: 'Interfaces vs Types',
    description: 'Understand when to use interfaces versus type aliases in TypeScript.',
    category: 'basics',
    difficulty: 'intermediate',
    duration: 25,
    progress: 45,
    isCompleted: false,
    isLocked: false,
    prerequisites: ['variables', 'functions'],
    tags: ['interfaces', 'types', 'comparison'],
    learners: 1834,
    rating: 4.7,
    icon: Layers,
    image: '/images/banners/basics-banner.png'
  },
  
  // Advanced Types
  {
    id: 'union-intersection',
    title: 'Union & Intersection Types',
    description: 'Learn to combine types using union (|) and intersection (&) operators.',
    category: 'advanced-types',
    difficulty: 'intermediate',
    duration: 30,
    progress: 25,
    isCompleted: false,
    isLocked: false,
    prerequisites: ['interfaces-vs-types'],
    tags: ['union', 'intersection', 'combining types'],
    learners: 1654,
    rating: 4.6,
    icon: Zap,
    image: '/images/banners/advanced-banner.png'
  },
  {
    id: 'conditional-types',
    title: 'Conditional Types',
    description: 'Create types that depend on conditions using TypeScript\'s conditional type syntax.',
    category: 'advanced-types',
    difficulty: 'advanced',
    duration: 45,
    progress: 0,
    isCompleted: false,
    isLocked: false,
    prerequisites: ['union-intersection'],
    tags: ['conditional', 'ternary', 'advanced'],
    learners: 987,
    rating: 4.8,
    icon: Puzzle,
    image: '/images/banners/advanced-banner.png'
  },
  {
    id: 'mapped-types',
    title: 'Mapped Types',
    description: 'Transform existing types by mapping over their properties.',
    category: 'advanced-types',
    difficulty: 'advanced',
    duration: 40,
    progress: 0,
    isCompleted: false,
    isLocked: true,
    prerequisites: ['conditional-types'],
    tags: ['mapped', 'transformation', 'utility'],
    learners: 756,
    rating: 4.9,
    icon: Settings,
    image: '/images/banners/advanced-banner.png'
  },
  
  // Generics
  {
    id: 'generic-functions',
    title: 'Generic Functions',
    description: 'Build reusable functions that work with multiple types using generics.',
    category: 'generics',
    difficulty: 'intermediate',
    duration: 35,
    progress: 65,
    isCompleted: false,
    isLocked: false,
    prerequisites: ['functions'],
    tags: ['generics', 'functions', 'reusable'],
    learners: 1456,
    rating: 4.7,
    icon: Lightbulb,
    image: '/images/banners/basics-banner.png'
  },
  {
    id: 'generic-classes',
    title: 'Generic Classes',
    description: 'Create type-safe classes that can work with different data types.',
    category: 'generics',
    difficulty: 'intermediate',
    duration: 40,
    progress: 30,
    isCompleted: false,
    isLocked: false,
    prerequisites: ['generic-functions'],
    tags: ['generics', 'classes', 'type-safe'],
    learners: 1234,
    rating: 4.6,
    icon: Briefcase,
    image: '/images/banners/basics-banner.png'
  },
  
  // Decorators
  {
    id: 'class-decorators',
    title: 'Class Decorators',
    description: 'Learn to modify and enhance classes using decorator patterns.',
    category: 'decorators',
    difficulty: 'advanced',
    duration: 50,
    progress: 0,
    isCompleted: false,
    isLocked: true,
    prerequisites: ['generic-classes'],
    tags: ['decorators', 'classes', 'metadata'],
    learners: 654,
    rating: 4.8,
    icon: Star,
    image: '/images/banners/oop-banner.png'
  },
  
  // Compiler API
  {
    id: 'ast-explorer',
    title: 'AST Explorer',
    description: 'Explore TypeScript\'s Abstract Syntax Tree and understand code structure.',
    category: 'compiler-api',
    difficulty: 'advanced',
    duration: 60,
    progress: 0,
    isCompleted: false,
    isLocked: true,
    prerequisites: ['class-decorators'],
    tags: ['AST', 'compiler', 'advanced'],
    learners: 432,
    rating: 4.9,
    icon: Cpu,
    image: '/images/banners/advanced-banner.png'
  }
];

const categories = [
  { id: 'all', name: 'All Concepts', icon: BookOpen, count: conceptsData.length },
  { id: 'basics', name: 'TypeScript Basics', icon: Target, count: conceptsData.filter(c => c.category === 'basics').length },
  { id: 'advanced-types', name: 'Advanced Types', icon: Zap, count: conceptsData.filter(c => c.category === 'advanced-types').length },
  { id: 'generics', name: 'Generics', icon: Lightbulb, count: conceptsData.filter(c => c.category === 'generics').length },
  { id: 'decorators', name: 'Decorators', icon: Star, count: conceptsData.filter(c => c.category === 'decorators').length },
  { id: 'namespaces-modules', name: 'Modules', icon: Layers, count: 0 },
  { id: 'tsconfig', name: 'Configuration', icon: Settings, count: 0 },
  { id: 'compiler-api', name: 'Compiler API', icon: Cpu, count: conceptsData.filter(c => c.category === 'compiler-api').length },
  { id: 'patterns', name: 'Patterns', icon: Puzzle, count: 0 }
];

const difficulties = [
  { id: 'all', name: 'All Levels' },
  { id: 'beginner', name: 'Beginner' },
  { id: 'intermediate', name: 'Intermediate' },
  { id: 'advanced', name: 'Advanced' }
];

const Concepts: React.FC = () => {
  const { conceptId } = useParams();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Filter concepts based on search and filters
  const filteredConcepts = useMemo(() => {
    return conceptsData.filter(concept => {
      const matchesSearch = concept.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                           concept.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                           concept.tags.some(tag => tag.toLowerCase().includes(debouncedSearchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || concept.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'all' || concept.difficulty === selectedDifficulty;
      const matchesCompletion = !showCompleted || concept.isCompleted;

      return matchesSearch && matchesCategory && matchesDifficulty && matchesCompletion;
    });
  }, [debouncedSearchQuery, selectedCategory, selectedDifficulty, showCompleted]);

  // Calculate progress statistics
  const stats = useMemo(() => {
    const total = conceptsData.length;
    const completed = conceptsData.filter(c => c.isCompleted).length;
    const inProgress = conceptsData.filter(c => c.progress > 0 && !c.isCompleted).length;
    const avgProgress = Math.round(conceptsData.reduce((sum, c) => sum + c.progress, 0) / total);

    return { total, completed, inProgress, avgProgress };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <img
              src="/images/banners/basics-banner.png"
              alt="TypeScript Concepts"
              className="w-32 h-20 object-cover rounded-lg mx-auto mb-6 opacity-90"
            />
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              TypeScript Concepts
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Master TypeScript step by step. From basic types to advanced compiler APIs, 
              learn with interactive examples and real-world applications.
            </p>
          </div>

          {/* Progress Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {stats.completed}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-1">
                {stats.inProgress}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                {stats.total}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Total Concepts</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                {stats.avgProgress}%
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Average Progress</div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:w-1/4">
            <Card className="sticky top-8">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Categories
              </h3>
              <div className="space-y-1">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={clsx(
                        'w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors',
                        selectedCategory === category.id
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <span className={clsx(
                        'text-sm px-2 py-1 rounded-full',
                        selectedCategory === category.id
                          ? 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                      )}>
                        {category.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Filters */}
              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                  Filters
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-slate-600 dark:text-slate-400 mb-2">
                      Difficulty
                    </label>
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                      className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                    >
                      {difficulties.map((difficulty) => (
                        <option key={difficulty.id} value={difficulty.id}>
                          {difficulty.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showCompleted"
                      checked={showCompleted}
                      onChange={(e) => setShowCompleted(e.target.checked)}
                      className="rounded border-slate-300 dark:border-slate-600"
                    />
                    <label
                      htmlFor="showCompleted"
                      className="text-sm text-slate-600 dark:text-slate-400"
                    >
                      Show only completed
                    </label>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search concepts, tags, or descriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  {filteredConcepts.length} concepts found
                </h2>
                {(selectedCategory !== 'all' || selectedDifficulty !== 'all' || searchQuery) && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Filtered by:{' '}
                    {selectedCategory !== 'all' && (
                      <span className="font-medium">
                        {categories.find(c => c.id === selectedCategory)?.name}
                      </span>
                    )}
                    {selectedDifficulty !== 'all' && (
                      <span className="font-medium ml-2">
                        {difficulties.find(d => d.id === selectedDifficulty)?.name}
                      </span>
                    )}
                    {searchQuery && (
                      <span className="font-medium ml-2">
                        "{searchQuery}"
                      </span>
                    )}
                  </p>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedDifficulty('all');
                  setSearchQuery('');
                  setShowCompleted(false);
                }}
                className="text-slate-600 dark:text-slate-400"
              >
                Clear Filters
              </Button>
            </div>

            {/* Concepts Grid */}
            {filteredConcepts.length === 0 ? (
              <Card className="text-center py-12">
                <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  No concepts found
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Try adjusting your search terms or filters.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedDifficulty('all');
                  }}
                >
                  Show All Concepts
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredConcepts.map((concept, index) => {
                  const Icon = concept.icon;
                  return (
                    <Card
                      key={concept.id}
                      hover={!concept.isLocked}
                      className={clsx(
                        'group relative',
                        concept.isLocked && 'opacity-60 cursor-not-allowed',
                        'animate-fadeInUp'
                      )}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {/* Lock overlay for locked concepts */}
                      {concept.isLocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/20 rounded-lg z-10">
                          <div className="text-center">
                            <div className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center mx-auto mb-2">
                              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              Complete prerequisites first
                            </p>
                          </div>
                        </div>
                      )}

                      <Link
                        to={concept.isLocked ? '#' : `/concepts/${concept.id}`}
                        className={concept.isLocked ? 'pointer-events-none' : ''}
                      >
                        {/* Concept Image */}
                        <div className="aspect-video bg-slate-100 dark:bg-slate-700 rounded-t-lg overflow-hidden mb-4">
                          <img
                            src={concept.image}
                            alt={concept.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        {/* Content */}
                        <div className="space-y-4">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                  {concept.title}
                                </h3>
                                <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                                  <Clock className="w-3 h-3" />
                                  <span>{concept.duration} min</span>
                                  <span>•</span>
                                  <span className={clsx(
                                    'px-2 py-0.5 rounded-full text-xs font-medium',
                                    {
                                      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300': concept.difficulty === 'beginner',
                                      'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300': concept.difficulty === 'intermediate',
                                      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300': concept.difficulty === 'advanced'
                                    }
                                  )}>
                                    {concept.difficulty}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {concept.isCompleted && (
                              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                            )}
                          </div>

                          {/* Description */}
                          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                            {concept.description}
                          </p>

                          {/* Progress */}
                          {concept.progress > 0 && (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600 dark:text-slate-400">Progress</span>
                                <span className="font-medium text-slate-900 dark:text-slate-100">
                                  {concept.progress}%
                                </span>
                              </div>
                              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${concept.progress}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Tags */}
                          <div className="flex flex-wrap gap-1">
                            {concept.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs rounded"
                              >
                                {tag}
                              </span>
                            ))}
                            {concept.tags.length > 3 && (
                              <span className="text-xs text-slate-500 dark:text-slate-400 px-2 py-1">
                                +{concept.tags.length - 3} more
                              </span>
                            )}
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                            <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
                              <div className="flex items-center space-x-1">
                                <Users className="w-3 h-3" />
                                <span>{concept.learners.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Star className="w-3 h-3" />
                                <span>{concept.rating}</span>
                              </div>
                            </div>
                            
                            {!concept.isLocked && (
                              <Button size="sm" variant={concept.progress > 0 ? 'outline' : 'primary'}>
                                {concept.isCompleted ? (
                                  'Review'
                                ) : concept.progress > 0 ? (
                                  'Continue'
                                ) : (
                                  'Start'
                                )}
                                <ArrowRight className="w-3 h-3 ml-1" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </Link>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Concepts;