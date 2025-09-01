// File: src/components/common/Sidebar.tsx

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  X, 
  Home, 
  BookOpen, 
  Code2, 
  Layers, 
  Play,
  FileText,
  Settings,
  HelpCircle,
  ChevronRight,
  Progress,
  Trophy,
  Clock
} from 'lucide-react';
import clsx from 'clsx';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  isNew?: boolean;
  isComingSoon?: boolean;
  subItems?: Array<{
    name: string;
    path: string;
    completed?: boolean;
  }>;
}

const sidebarSections: SidebarSection[] = [
  {
    title: 'Main',
    items: [
      {
        name: 'Home',
        path: '/',
        icon: Home,
      },
      {
        name: 'Dashboard',
        path: '/dashboard',
        icon: Layers,
        badge: '3',
      },
      {
        name: 'Playground',
        path: '/playground',
        icon: Play,
        isNew: true,
      },
    ],
  },
  {
    title: 'Learning',
    items: [
      {
        name: 'Concepts',
        path: '/concepts',
        icon: BookOpen,
        subItems: [
          { name: 'Basics', path: '/concepts/basics', completed: true },
          { name: 'Advanced Types', path: '/concepts/advanced-types', completed: false },
          { name: 'Generics', path: '/concepts/generics', completed: false },
          { name: 'Decorators', path: '/concepts/decorators', completed: false },
          { name: 'Modules', path: '/concepts/namespaces-modules', completed: false },
          { name: 'Compiler API', path: '/concepts/compiler-api', completed: false },
          { name: 'Patterns', path: '/concepts/patterns', completed: false },
        ],
      },
      {
        name: 'Mini Projects',
        path: '/mini-projects',
        icon: Code2,
        subItems: [
          { name: 'Form Validation', path: '/mini-projects/form-validation' },
          { name: 'Drag & Drop', path: '/mini-projects/drag-drop-dashboard' },
          { name: 'Event Bus', path: '/mini-projects/event-bus' },
          { name: 'Compiler Playground', path: '/mini-projects/compiler-playground' },
          { name: 'DI Container', path: '/mini-projects/decorator-driven-di' },
        ],
      },
    ],
  },
  {
    title: 'Resources',
    items: [
      {
        name: 'Documentation',
        path: '/docs',
        icon: FileText,
        isComingSoon: true,
      },
      {
        name: 'Help & Support',
        path: '/help',
        icon: HelpCircle,
        isComingSoon: true,
      },
      {
        name: 'Settings',
        path: '/settings',
        icon: Settings,
        isComingSoon: true,
      },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = React.useState<string[]>(['/concepts', '/mini-projects']);

  const toggleExpanded = (path: string) => {
    setExpandedItems(prev => 
      prev.includes(path) 
        ? prev.filter(item => item !== path)
        : [...prev, path]
    );
  };

  const isItemActive = (path: string): boolean => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const getProgress = (): number => {
    // Mock progress calculation
    const totalConcepts = 7;
    const completedConcepts = 1; // From mock data above
    return Math.round((completedConcepts / totalConcepts) * 100);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden" 
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-300 ease-in-out overflow-y-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0 lg:static lg:z-0'
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <img
              src="/images/logo.png"
              alt="TSVerseHub"
              className="h-8 w-8 rounded-lg"
            />
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                TSVerseHub
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                TypeScript Mastery
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Card */}
        <div className="p-4">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-blue-200/50 dark:border-blue-800/50">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Trophy className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  Your Progress
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Keep it up! 🚀
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Overall</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {getProgress()}%
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${getProgress()}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center space-x-1">
                  <Progress className="h-3 w-3" />
                  <span>1 of 7 completed</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>~2h left</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-4 pb-4">
          {sidebarSections.map((section) => (
            <div key={section.title} className="mb-6">
              <h3 className="px-2 mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                {section.title}
              </h3>
              
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = isItemActive(item.path);
                  const isExpanded = expandedItems.includes(item.path);
                  const hasSubItems = item.subItems && item.subItems.length > 0;

                  return (
                    <li key={item.path}>
                      <div className="relative">
                        <Link
                          to={item.isComingSoon ? '#' : item.path}
                          onClick={(e) => {
                            if (item.isComingSoon) {
                              e.preventDefault();
                              return;
                            }
                            if (hasSubItems) {
                              toggleExpanded(item.path);
                            }
                          }}
                          className={clsx(
                            'flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group',
                            isActive
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                              : item.isComingSoon
                              ? 'text-slate-400 dark:text-slate-500 cursor-not-allowed'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                          )}
                        >
                          <div className="flex items-center space-x-3">
                            <Icon className={clsx(
                              'h-5 w-5 transition-colors',
                              isActive 
                                ? 'text-blue-600 dark:text-blue-400' 
                                : item.isComingSoon
                                ? 'text-slate-400 dark:text-slate-500'
                                : 'text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                            )} />
                            <span>{item.name}</span>
                          </div>

                          <div className="flex items-center space-x-2">
                            {item.isNew && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                                New
                              </span>
                            )}
                            {item.isComingSoon && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full">
                                Soon
                              </span>
                            )}
                            {item.badge && !item.isComingSoon && (
                              <span className="flex items-center justify-center w-5 h-5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                                {item.badge}
                              </span>
                            )}
                            {hasSubItems && (
                              <ChevronRight className={clsx(
                                'h-4 w-4 transition-transform duration-200',
                                isExpanded ? 'rotate-90' : 'rotate-0',
                                isActive 
                                  ? 'text-blue-600 dark:text-blue-400' 
                                  : 'text-slate-400'
                              )} />
                            )}
                          </div>
                        </Link>

                        {/* Sub Items */}
                        {hasSubItems && isExpanded && (
                          <ul className="mt-2 ml-8 space-y-1">
                            {item.subItems!.map((subItem) => {
                              const isSubActive = location.pathname === subItem.path;
                              return (
                                <li key={subItem.path}>
                                  <Link
                                    to={subItem.path}
                                    className={clsx(
                                      'flex items-center justify-between w-full px-3 py-1.5 rounded-md text-sm transition-all duration-200',
                                      isSubActive
                                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                    )}
                                  >
                                    <span>{subItem.name}</span>
                                    {'completed' in subItem && (
                                      <div className={clsx(
                                        'w-2 h-2 rounded-full',
                                        subItem.completed
                                          ? 'bg-green-500'
                                          : 'bg-slate-300 dark:bg-slate-600'
                                      )} />
                                    )}
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 mt-auto">
          <div className="text-center">
            <img
              src="/images/banners/basics-banner.png"
              alt="TypeScript Learning"
              className="w-full h-20 object-cover rounded-lg mb-2 opacity-75"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Master TypeScript step by step
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};