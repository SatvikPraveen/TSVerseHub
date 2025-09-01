// File: src/pages/Home.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  BookOpen, 
  Code2, 
  Play, 
  Layers,
  Users,
  Trophy,
  Zap,
  Star,
  Github,
  ChevronRight,
  Target,
  Lightbulb,
  Rocket
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, ConceptCard, ProjectCard, StatsCard } from '@/components/ui/Card';
import clsx from 'clsx';

interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: string;
}

interface Testimonial {
  name: string;
  role: string;
  avatar: string;
  content: string;
  rating: number;
}

const features: Feature[] = [
  {
    icon: BookOpen,
    title: 'Comprehensive Learning',
    description: 'From TypeScript basics to advanced patterns, covering every concept you need to master.',
    color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
  },
  {
    icon: Code2,
    title: 'Hands-on Projects',
    description: 'Build real-world mini-projects that demonstrate practical TypeScript usage.',
    color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
  },
  {
    icon: Play,
    title: 'Interactive Playground',
    description: 'Experiment with TypeScript code in our Monaco-powered online editor.',
    color: 'text-green-600 bg-green-100 dark:bg-green-900/30',
  },
  {
    icon: Layers,
    title: 'Progress Tracking',
    description: 'Monitor your learning journey with detailed progress analytics and achievements.',
    color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30',
  },
];

const popularConcepts = [
  {
    title: 'TypeScript Basics',
    description: 'Learn variables, functions, types, and interfaces to get started with TypeScript.',
    difficulty: 'beginner' as const,
    progress: 85,
    tags: ['Variables', 'Functions', 'Types'],
    icon: <Target className="w-6 h-6 text-blue-600" />,
  },
  {
    title: 'Advanced Types',
    description: 'Master union types, conditional types, mapped types, and template literals.',
    difficulty: 'advanced' as const,
    progress: 32,
    tags: ['Union Types', 'Conditional', 'Mapped'],
    icon: <Zap className="w-6 h-6 text-purple-600" />,
  },
  {
    title: 'Generics',
    description: 'Build reusable, type-safe components with generic functions and classes.',
    difficulty: 'intermediate' as const,
    progress: 65,
    tags: ['Functions', 'Classes', 'Constraints'],
    icon: <Lightbulb className="w-6 h-6 text-green-600" />,
  },
];

const featuredProjects = [
  {
    title: 'Form Validation System',
    description: 'Build a type-safe form validation library with custom validators and error handling.',
    image: '/images/banners/basics-banner.png',
    technologies: ['TypeScript', 'Generics', 'Utility Types'],
    status: 'completed' as const,
  },
  {
    title: 'Drag & Drop Dashboard',
    description: 'Create an interactive dashboard with drag-and-drop functionality and state management.',
    image: '/images/banners/advanced-banner.png',
    technologies: ['React', 'TypeScript', 'Custom Hooks'],
    status: 'in-progress' as const,
  },
  {
    title: 'Event Bus System',
    description: 'Implement a type-safe event system with decorators and advanced TypeScript patterns.',
    image: '/images/banners/oop-banner.png',
    technologies: ['Decorators', 'Observer Pattern', 'Types'],
    status: 'planned' as const,
  },
];

const testimonials: Testimonial[] = [
  {
    name: 'Sarah Chen',
    role: 'Frontend Developer',
    avatar: '/images/icons/typescript.png',
    content: 'TSVerseHub helped me transition from JavaScript to TypeScript seamlessly. The interactive examples and real projects made all the difference!',
    rating: 5,
  },
  {
    name: 'Alex Johnson',
    role: 'Full Stack Engineer',
    avatar: '/images/icons/dashboard.png',
    content: 'The depth of content here is incredible. From basics to compiler API - everything is covered with practical examples.',
    rating: 5,
  },
  {
    name: 'Maria Garcia',
    role: 'Tech Lead',
    avatar: '/images/icons/playground.png',
    content: 'I use TSVerseHub as a reference for my team. The playground feature is perfect for testing type definitions quickly.',
    rating: 5,
  },
];

const stats = [
  { title: 'Active Learners', value: '10,000+', icon: <Users className="w-6 h-6" /> },
  { title: 'Concepts Covered', value: '50+', icon: <BookOpen className="w-6 h-6" /> },
  { title: 'Mini Projects', value: '15', icon: <Code2 className="w-6 h-6" /> },
  { title: 'Success Rate', value: '95%', icon: <Trophy className="w-6 h-6" /> },
];

const Home: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-blue-900/20 py-20 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-30">
          <img 
            src="/images/logo.png" 
            alt="" 
            className="absolute top-20 right-20 w-32 h-32 opacity-20 animate-pulse" 
          />
          <img 
            src="/images/icons/typescript.png" 
            alt="" 
            className="absolute bottom-20 left-20 w-24 h-24 opacity-20 animate-bounce" 
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-8">
              <img
                src="/images/logo.png"
                alt="TSVerseHub"
                className="h-20 w-20 rounded-2xl shadow-lg"
              />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-slate-100 mb-6">
              Master{' '}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                TypeScript
              </span>
              {' '}with Confidence
            </h1>
            
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-3xl mx-auto leading-relaxed">
              A comprehensive, interactive platform for learning TypeScript from basics to advanced concepts. 
              Build real projects, experiment in the playground, and track your progress along the way.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Button size="lg" className="group" asChild>
                <Link to="/concepts">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Start Learning
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              
              <Button variant="outline" size="lg" asChild>
                <Link to="/playground">
                  <Play className="w-5 h-5 mr-2" />
                  Try Playground
                </Link>
              </Button>
            </div>
            
            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg mx-auto mb-2">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{stat.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Why Choose TSVerseHub?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              We've designed the most comprehensive TypeScript learning experience, 
              combining theory with hands-on practice.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center group hover:shadow-lg transition-all duration-300" padding="lg">
                  <div className={clsx('w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform', feature.color)}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Concepts */}
      <section className="py-20 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Popular Concepts
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Start with these essential TypeScript concepts
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/concepts">
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularConcepts.map((concept, index) => (
              <ConceptCard
                key={index}
                {...concept}
                onClick={() => {/* Navigate to concept */}}
                className="animate-fadeInUp"
                style={{ animationDelay: `${index * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Build Real Projects
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Apply your TypeScript knowledge with hands-on mini-projects
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/mini-projects">
                View All Projects
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.map((project, index) => (
              <ProjectCard
                key={index}
                {...project}
                onClick={() => {/* Navigate to project */}}
                className="animate-slideInRight"
                style={{ animationDelay: `${index * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              What Developers Say
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Join thousands of developers who've mastered TypeScript with TSVerseHub
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                        {testimonial.name}
                      </h4>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {testimonial.role}
                      </span>
                    </div>
                    <div className="flex items-center mb-3">
                      {Array.from({ length: testimonial.rating }, (_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                      "{testimonial.content}"
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <Rocket className="w-16 h-16 mx-auto mb-6 opacity-90" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Master TypeScript?
            </h2>
            <p className="text-xl opacity-90 mb-8">
              Join thousands of developers who've leveled up their skills with TSVerseHub. 
              Start your journey today and build type-safe applications with confidence.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-slate-50" asChild>
              <Link to="/dashboard">
                <Layers className="w-5 h-5 mr-2" />
                Get Started Free
              </Link>
            </Button>
            
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
              <a href="https://github.com/your-repo/tsversehub" target="_blank" rel="noopener noreferrer">
                <Github className="w-5 h-5 mr-2" />
                View on GitHub
              </a>
            </Button>
          </div>
          
          <p className="text-sm opacity-75 mt-8">
            No credit card required • Free forever • Open source
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;