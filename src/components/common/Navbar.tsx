// File: src/components/common/Navbar.tsx

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Home, 
  BookOpen, 
  Code2, 
  Layers, 
  Sun, 
  Moon,
  Github,
  Search,
  Bell
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import clsx from 'clsx';

interface NavbarProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const navItems: NavItem[] = [
  {
    name: 'Home',
    path: '/',
    icon: Home,
    description: 'Welcome to TSVerseHub',
  },
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: Layers,
    description: 'Your learning progress',
  },
  {
    name: 'Concepts',
    path: '/concepts',
    icon: BookOpen,
    description: 'TypeScript concepts and tutorials',
  },
  {
    name: 'Mini Projects',
    path: '/mini-projects',
    icon: Code2,
    description: 'Hands-on coding projects',
  },
  {
    name: 'Playground',
    path: '/playground',
    icon: Code2,
    description: 'Interactive TypeScript editor',
  },
];

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  toggleDarkMode,
  sidebarOpen,
  setSidebarOpen,
}) => {
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // TODO: Implement search functionality
      console.log('Searching for:', searchQuery);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
        setSearchQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Mobile Menu Button */}
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                {sidebarOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>

              {/* Logo */}
              <Link 
                to="/" 
                className="flex items-center ml-4 lg:ml-0 group"
              >
                <img
                  src="/images/logo.png"
                  alt="TSVerseHub"
                  className="h-8 w-8 rounded-lg group-hover:scale-110 transition-transform duration-200"
                />
                <div className="ml-3">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    TSVerseHub
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                    Master TypeScript
                  </p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex lg:items-center lg:space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || 
                  (item.path !== '/' && location.pathname.startsWith(item.path));
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={clsx(
                      'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 group',
                      isActive
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                    )}
                    title={item.description}
                  >
                    <Icon className={clsx(
                      'h-4 w-4 transition-colors',
                      isActive 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : 'text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                    )} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2">
              {/* Search Button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                title="Search (⌘K)"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Notifications */}
              <button
                className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors relative"
                title="Notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Theme Toggle */}
              <ThemeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

              {/* GitHub Link */}
              <a
                href="https://github.com/your-repo/tsversehub"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                title="View on GitHub"
              >
                <Github className="h-5 w-5" />
              </a>

              {/* Profile Menu - Future Implementation */}
              <div className="relative">
                <img
                  src="/images/icons/typescript.png"
                  alt="Profile"
                  className="h-8 w-8 rounded-full border-2 border-transparent hover:border-blue-500 transition-colors cursor-pointer"
                  title="Profile (Coming Soon)"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {sidebarOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || 
                  (item.path !== '/' && location.pathname.startsWith(item.path));
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={clsx(
                      'flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                    )}
                  >
                    <Icon className={clsx(
                      'h-5 w-5 transition-colors',
                      isActive 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : 'text-slate-500'
                    )} />
                    <div>
                      <div>{item.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {item.description}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsSearchOpen(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl">
            <form onSubmit={handleSearch} className="p-4">
              <div className="flex items-center space-x-4">
                <Search className="h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search TypeScript concepts, examples, and more..."
                  className="flex-1 bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none text-lg"
                  autoFocus
                />
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-xs font-mono text-slate-600 dark:text-slate-400 rounded">
                  ESC
                </kbd>
              </div>
            </form>
            
            {/* Search Results - Future Implementation */}
            <div className="border-t border-slate-200 dark:border-slate-600 p-4">
              <div className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
                🚧 Search functionality coming soon!
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};