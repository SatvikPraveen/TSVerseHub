// File: src/pages/MiniProjects.tsx

import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Code2, 
  Search, 
  Filter,
  ChevronRight,
  Star,
  Clock,
  Users,
  Play,
  CheckCircle,
  ArrowRight,
  Github,
  ExternalLink,
  FileCode,
  Database,
  Palette,
  Cog,
  Layers,
  Zap,
  Target,
  Award,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, ProjectCard } from '@/components/ui/Card';
import { useDebounce } from '@/hooks/useDebounce';
import clsx from 'clsx';

interface ProjectData {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  category: 'frontend' | 'backend' | 'fullstack' | 'utility' | 'game';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // estimated hours
  status: 'planned' | 'in-progress' | 'completed';
  progress: number; // 0-100
  technologies: string[];
  concepts: string[];
  learners: number;
  rating: number;
  image: string;
  demoUrl?: string;
  sourceUrl?: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
  prerequisites: string[];
  learningOutcomes: string[];
}

const projectsData: ProjectData[] = [
  {
    id: 'form-validation',
    title: 'Type-Safe Form Validation',
    description: 'Build a comprehensive form validation library with custom validators and error handling.',
    longDescription: 'Learn to create a powerful, type-safe form validation system using TypeScript generics, utility types, and advanced type manipulation. This project covers schema validation, custom validators, error handling, and integration with popular form libraries.',
    category: 'utility',
    difficulty: 'intermediate',
    duration: 6,
    status: 'completed',
    progress: 100,
    technologies: ['TypeScript', 'Generics', 'Utility Types', 'React Hook Form'],
    concepts: ['Generics', 'Utility Types', 'Type Guards', 'Mapped Types'],
    learners: 1234,
    rating: 4.8,
    image: '/images/banners/basics-banner.png',
    demoUrl: '/mini-projects/form-validation/demo',
    sourceUrl: 'https://github.com/tsversehub/form-validation',
    icon: FileCode,
    features: [
      'Schema-based validation',
      'Custom validator functions',
      'Type-safe error messages',
      'React integration',
      'Async validation support'
    ],
    prerequisites: [
      'Basic TypeScript knowledge',
      'Understanding of generics',
      'React fundamentals'
    ],
    learningOutcomes: [
      'Master advanced TypeScript generics',
      'Understand utility type patterns',
      'Build reusable validation logic',
      'Create type-safe APIs'
    ]
  },
  {
    id: 'drag-drop-dashboard',
    title: 'Drag & Drop Dashboard',
    description: 'Create an interactive dashboard with drag-and-drop functionality and state management.',
    longDescription: 'Build a sophisticated dashboard with drag-and-drop widgets, real-time data updates, and complex state management. This project demonstrates advanced TypeScript patterns, custom hooks, and component composition.',
    category: 'frontend',
    difficulty: 'advanced',
    duration: 12,
    status: 'in-progress',
    progress: 65,
    technologies: ['React', 'TypeScript', 'Custom Hooks', 'HTML5 Drag API'],
    concepts: ['Advanced Types', 'Custom Hooks', 'State Management', 'Component Patterns'],
    learners: 876,
    rating: 4.7,
    image: '/images/banners/advanced-banner.png',
    demoUrl: '/mini-projects/drag-drop-dashboard/demo',
    icon: Layers,
    features: [
      'Drag and drop interface',
      'Customizable widgets',
      'Responsive grid layout',
      'Real-time data updates',
      'Persistent user preferences'
    ],
    prerequisites: [
      'Intermediate TypeScript',
      'React hooks knowledge',
      'CSS Grid/Flexbox'
    ],
    learningOutcomes: [
      'Master complex state management',
      'Understand advanced React patterns',
      'Build reusable drag-drop components',
      'Handle complex type relationships'
    ]
  },
  {
    id: 'event-bus',
    title: 'Type-Safe Event Bus',
    description: 'Implement a type-safe event system with decorators and advanced TypeScript patterns.',
    longDescription: 'Create a powerful event bus system using TypeScript decorators, advanced type manipulation, and observer patterns. This project showcases enterprise-level architecture and design patterns.',
    category: 'utility',
    difficulty: 'advanced',
    duration: 8,
    status: 'completed',
    progress: 100,
    technologies: ['TypeScript', 'Decorators', 'Observer Pattern', 'Reflection'],
    concepts: ['Decorators', 'Advanced Types', 'Design Patterns', 'Metadata'],
    learners: 654,
    rating: 4.9,
    image: '/images/banners/oop-banner.png',
    demoUrl: '/mini-projects/event-bus/demo',
    sourceUrl: 'https://github.com/tsversehub/event-bus',
    icon: Zap,
    features: [
      'Type-safe event handling',
      'Decorator-based subscriptions',
      'Event filtering and middleware',
      'Async event processing',
      'Memory leak prevention'
    ],
    prerequisites: [
      'Advanced TypeScript knowledge',
      'Understanding of decorators',
      'Design pattern familiarity'
    ],
    learningOutcomes: [
      'Master decorator patterns',
      'Understand event-driven architecture',
      'Build scalable notification systems',
      'Apply enterprise design patterns'
    ]
  },
  {
    id: 'compiler-playground',
    title: 'TypeScript Compiler Playground',
    description: 'Build a mini TypeScript compiler with AST visualization and code transformation.',
    longDescription: 'Dive deep into the TypeScript compiler API to build your own code analysis and transformation tools. This advanced project covers AST manipulation, type checking, and code generation.',
    category: 'utility',
    difficulty: 'advanced',
    duration: 16,
    status: 'in-progress',
    progress: 30,
    technologies: ['TypeScript Compiler API', 'AST Manipulation', 'Code Analysis'],
    concepts: ['Compiler API', 'AST', 'Type Checking', 'Code Generation'],
    learners: 432,
    rating: 4.6,
    image: '/images/banners/advanced-banner.png',
    icon: Cog,
    features: [
      'AST visualization',
      'Custom type checkers',
      'Code transformations',
      'Plugin architecture',
      'Real-time compilation'
    ],
    prerequisites: [
      'Expert TypeScript knowledge',
      'Understanding of compilers',
      'AST concepts'
    ],
    learningOutcomes: [
      'Master compiler API usage',
      'Build custom linting tools',
      'Understand TypeScript internals',
      'Create code transformation tools'
    ]
  },
  {
    id: 'decorator-driven-di',
    title: 'Dependency Injection Container',
    description: 'Create a decorator-driven dependency injection system with IoC principles.',
    longDescription: 'Build a sophisticated dependency injection container using TypeScript decorators and reflection. Learn IoC principles, service lifetimes, and enterprise-level architecture patterns.',
    category: 'backend',
    difficulty: 'advanced',
    duration: 10,
    status: 'planned',
    progress: 0,
    technologies: ['Decorators', 'Reflection', 'IoC Container', 'Metadata API'],
    concepts: ['Decorators', 'Dependency Injection', 'IoC', 'Enterprise Patterns'],
    learners: 321,
    rating: 4.5,
    image: '/images/banners/oop-banner.png',
    icon: Database,
    features: [
      'Decorator-based injection',
      'Service lifetime management',
      'Circular dependency detection',
      'Module system',
      'Configuration providers'
    ],
    prerequisites: [
      'Advanced TypeScript',
      'Decorator expertise',
      'Architecture pattern knowledge'
    ],
    learningOutcomes: [
      'Master dependency injection',
      'Understand IoC principles',
      'Build enterprise architectures',
      'Create decorator-based APIs'
    ]
  }
];

const categories = [
  { id: 'all', name: 'All Projects', icon: Code2, count: projectsData.length },
  { id: 'frontend', name: 'Frontend', icon: Palette, count: projectsData.filter(p => p.category === 'frontend').length },
  { id: 'backend', name: 'Backend', icon: Database, count: projectsData.filter(p => p.category === 'backend').length },
  { id: 'fullstack', name: 'Full Stack', icon: Layers, count: projectsData.filter(p => p.category === 'fullstack').length },
  { id: 'utility', name: 'Utility', icon: Cog, count: projectsData.filter(p => p.category === 'utility').length },
  { id: 'game', name: 'Games', icon: Target, count: projectsData.filter(p => p.category === 'game').length }
];

const difficulties = [
  { id: 'all', name: 'All Levels' },
  { id: 'beginner', name: 'Beginner' },
  { id: 'intermediate', name: 'Intermediate' },
  { id: 'advanced', name: 'Advanced' }
];

const statuses = [
  { id: 'all', name: 'All Statuses' },
  { id: 'completed', name: 'Completed' },
  { id: 'in-progress', name: 'In Progress' },
  { id: 'planned', name: 'Planned' }
];

const MiniProjects: React.FC = () => {
  const { projectId } = useParams();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Filter projects based on search and filters
  const filteredProjects = useMemo(() => {
    return projectsData.filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                           project.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                           project.technologies.some(tech => tech.toLowerCase().includes(debouncedSearchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'all' || project.difficulty === selectedDifficulty;
      const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus;
    });
  }, [debouncedSearchQuery, selectedCategory, selectedDifficulty, selectedStatus]);

  // Calculate progress statistics
  const stats = useMemo(() => {
    const total = projectsData.length;
    const completed = projectsData.filter(p => p.status === 'completed').length;
    const inProgress = projectsData.filter(p => p.status === 'in-progress').length;
    const avgProgress = Math.round(projectsData.reduce((sum, p) => sum + p.progress, 0) / total);

    return { total, completed, inProgress, avgProgress };
  }, []);

  // If viewing a specific project, render project detail view
  if (projectId) {
    const project = projectsData.find(p => p.id === projectId);
    if (!project) {
      return <div>Project not found</div>;
    }

    return <ProjectDetailView project={project} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <img
              src="/images/banners/oop-banner.png"
              alt="Mini Projects"
              className="w-32 h-20 object-cover rounded-lg mx-auto mb-6 opacity-90"
            />
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              TypeScript Mini Projects
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Build real-world applications and strengthen your TypeScript skills with hands-on projects. 
              From beginner-friendly utilities to advanced enterprise patterns.
            </p>
          </div>

          {/* Progress Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                {stats.completed}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {stats.inProgress}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                {stats.total}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Total Projects</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-1">
                {stats.avgProgress}%
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Avg Progress</div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Categories and Filters */}
          <div className="lg:w-1/4">
            <Card className="sticky top-8">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Categories
              </h3>
              <div className="space-y-1 mb-6">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={clsx(
                        'w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors',
                        selectedCategory === category.id
                          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
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
                          ? 'bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                      )}>
                        {category.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Filters */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
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

                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                  >
                    {statuses.map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.name}
                      </option>
                    ))}
                  </select>
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
                  placeholder="Search projects, technologies, or concepts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  {filteredProjects.length} projects found
                </h2>
                {(selectedCategory !== 'all' || selectedDifficulty !== 'all' || selectedStatus !== 'all' || searchQuery) && (
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
                    {selectedStatus !== 'all' && (
                      <span className="font-medium ml-2">
                        {statuses.find(s => s.id === selectedStatus)?.name}
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
                  setSelectedStatus('all');
                  setSearchQuery('');
                }}
                className="text-slate-600 dark:text-slate-400"
              >
                Clear Filters
              </Button>
            </div>

            {/* Projects Grid */}
            {filteredProjects.length === 0 ? (
              <Card className="text-center py-12">
                <Code2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  No projects found
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
                    setSelectedStatus('all');
                  }}
                >
                  Show All Projects
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredProjects.map((project, index) => (
                  <ProjectDetailCard
                    key={project.id}
                    project={project}
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Individual Project Card Component
const ProjectDetailCard: React.FC<{ project: ProjectData; index: number }> = ({ project, index }) => {
  const Icon = project.icon;
  
  return (
    <Card
      hover
      className="group relative animate-fadeInUp"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <Link to={`/mini-projects/${project.id}`}>
        {/* Project Image */}
        <div className="aspect-video bg-slate-100 dark:bg-slate-700 rounded-t-lg overflow-hidden mb-4">
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {project.title}
                </h3>
                <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span>{project.duration}h</span>
                  <span>•</span>
                  <span className={clsx(
                    'px-2 py-0.5 rounded-full text-xs font-medium',
                    {
                      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300': project.difficulty === 'beginner',
                      'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300': project.difficulty === 'intermediate',
                      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300': project.difficulty === 'advanced'
                    }
                  )}>
                    {project.difficulty}
                  </span>
                </div>
              </div>
            </div>
            
            <div className={clsx(
              'px-2 py-1 rounded-full text-xs font-medium',
              {
                'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300': project.status === 'completed',
                'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300': project.status === 'in-progress',
                'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300': project.status === 'planned'
              }
            )}>
              {project.status.replace('-', ' ')}
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
            {project.description}
          </p>

          {/* Progress */}
          {project.progress > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Progress</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {project.progress}%
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Technologies */}
          <div className="flex flex-wrap gap-1">
            {project.technologies.slice(0, 4).map((tech) => (
              <span
                key={tech}
                className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded font-medium"
              >
                {tech}
              </span>
            ))}
            {project.technologies.length > 4 && (
              <span className="text-xs text-slate-500 dark:text-slate-400 px-2 py-1">
                +{project.technologies.length - 4} more
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <span>{project.learners.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3" />
                <span>{project.rating}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {project.demoUrl && (
                <Button size="xs" variant="outline">
                  <Play className="w-3 h-3 mr-1" />
                  Demo
                </Button>
              )}
              <Button size="xs" variant={project.progress > 0 ? 'outline' : 'primary'}>
                {project.status === 'completed' ? (
                  'Review'
                ) : project.progress > 0 ? (
                  'Continue'
                ) : (
                  'Start'
                )}
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </Card>
  );
};

// Project Detail View Component
const ProjectDetailView: React.FC<{ project: ProjectData }> = ({ project }) => {
  const Icon = project.icon;
  
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400 mb-8">
          <Link to="/mini-projects" className="hover:text-slate-900 dark:hover:text-slate-100">
            Mini Projects
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-900 dark:text-slate-100">{project.title}</span>
        </nav>

        {/* Project Header */}
        <div className="mb-8">
          <div className="flex items-start space-x-4 mb-6">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <Icon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                {project.title}
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
                {project.longDescription}
              </p>
              
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>{project.duration} hours</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-slate-500" />
                  <span className="capitalize">{project.difficulty}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-slate-500" />
                  <span>{project.learners.toLocaleString()} learners</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  <span>{project.rating}/5</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            <Button size="lg">
              <Play className="w-5 h-5 mr-2" />
              {project.progress > 0 ? 'Continue Project' : 'Start Project'}
            </Button>
            
            {project.demoUrl && (
              <Button variant="outline" size="lg" asChild>
                <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Live Demo
                </a>
              </Button>
            )}
            
            {project.sourceUrl && (
              <Button variant="outline" size="lg" asChild>
                <a href={project.sourceUrl} target="_blank" rel="noopener noreferrer">
                  <Github className="w-4 h-4 mr-2" />
                  View Source
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {project.progress > 0 && (
          <Card className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Your Progress
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {project.progress}%
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </Card>
        )}

        {/* Project Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Features */}
            <Card>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                What You'll Build
              </h3>
              <ul className="space-y-3">
                {project.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-600 dark:text-slate-400">{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Learning Outcomes */}
            <Card>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Learning Outcomes
              </h3>
              <ul className="space-y-3">
                {project.learningOutcomes.map((outcome, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <Award className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-600 dark:text-slate-400">{outcome}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Prerequisites */}
            <Card>
              <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
                Prerequisites
              </h4>
              <ul className="space-y-2">
                {project.prerequisites.map((prereq, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm">
                    <BookOpen className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-600 dark:text-slate-400">{prereq}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Technologies */}
            <Card>
              <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
                Technologies
              </h4>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm rounded-full font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </Card>

            {/* Concepts Covered */}
            <Card>
              <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
                TypeScript Concepts
              </h4>
              <div className="space-y-2">
                {project.concepts.map((concept) => (
                  <Link
                    key={concept}
                    to={`/concepts/${concept.toLowerCase().replace(/\s+/g, '-')}`}
                    className="block px-3 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm rounded-lg transition-colors"
                  >
                    {concept}
                  </Link>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniProjects;