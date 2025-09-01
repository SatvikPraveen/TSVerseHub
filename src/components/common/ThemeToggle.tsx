// File: src/components/common/ThemeToggle.tsx

import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import clsx from 'clsx';

interface ThemeToggleProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

type ThemeMode = 'light' | 'dark' | 'system';

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  darkMode,
  toggleDarkMode,
  className = '',
  showLabel = false,
  size = 'md',
}) => {
  const [themeMode, setThemeMode] = React.useState<ThemeMode>('system');
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  // Get system preference
  const getSystemPreference = (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  // Update theme mode based on current state
  React.useEffect(() => {
    const storedMode = localStorage.getItem('tsversehub-theme-mode') as ThemeMode;
    if (storedMode) {
      setThemeMode(storedMode);
    } else if (darkMode === getSystemPreference()) {
      setThemeMode('system');
    } else {
      setThemeMode(darkMode ? 'dark' : 'light');
    }
  }, [darkMode]);

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
    localStorage.setItem('tsversehub-theme-mode', mode);
    setIsDropdownOpen(false);

    switch (mode) {
      case 'light':
        if (darkMode) toggleDarkMode();
        break;
      case 'dark':
        if (!darkMode) toggleDarkMode();
        break;
      case 'system':
        const systemPreference = getSystemPreference();
        if (darkMode !== systemPreference) {
          toggleDarkMode();
        }
        break;
    }
  };

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  };

  const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const getCurrentIcon = () => {
    switch (themeMode) {
      case 'light':
        return Sun;
      case 'dark':
        return Moon;
      case 'system':
        return Monitor;
      default:
        return darkMode ? Moon : Sun;
    }
  };

  const CurrentIcon = getCurrentIcon();

  if (showLabel) {
    return (
      <div className={clsx('relative', className)}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={clsx(
            'flex items-center space-x-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors',
            sizeClasses[size]
          )}
          title={`Current theme: ${themeMode}`}
        >
          <CurrentIcon className={iconSizeClasses[size]} />
          {showLabel && (
            <span className="text-sm font-medium capitalize">{themeMode}</span>
          )}
        </button>

        {/* Theme Selection Dropdown */}
        {isDropdownOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsDropdownOpen(false)}
            />
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-20">
              <div className="py-2">
                {[
                  { mode: 'light' as const, icon: Sun, label: 'Light' },
                  { mode: 'dark' as const, icon: Moon, label: 'Dark' },
                  { mode: 'system' as const, icon: Monitor, label: 'System' },
                ].map(({ mode, icon: Icon, label }) => (
                  <button
                    key={mode}
                    onClick={() => handleThemeChange(mode)}
                    className={clsx(
                      'w-full flex items-center space-x-3 px-4 py-2 text-sm text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors',
                      themeMode === mode
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'text-slate-700 dark:text-slate-300'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                    {themeMode === mode && (
                      <div className="ml-auto w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
              
              {/* System Preference Info */}
              <div className="border-t border-slate-200 dark:border-slate-700 px-4 py-2">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  System preference: {getSystemPreference() ? 'Dark' : 'Light'}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Simple toggle button without dropdown
  return (
    <button
      onClick={toggleDarkMode}
      className={clsx(
        'rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200',
        sizeClasses[size],
        className
      )}
      title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
    >
      <div className="relative">
        <Sun className={clsx(
          iconSizeClasses[size],
          'transition-all duration-300 absolute',
          darkMode ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'
        )} />
        <Moon className={clsx(
          iconSizeClasses[size],
          'transition-all duration-300',
          darkMode ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'
        )} />
      </div>
    </button>
  );
};

// Advanced theme toggle with animations
export const AnimatedThemeToggle: React.FC<ThemeToggleProps> = ({
  darkMode,
  toggleDarkMode,
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-12 h-6',
    md: 'w-14 h-7',
    lg: 'w-16 h-8',
  };

  const thumbSizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
  };

  return (
    <button
      onClick={toggleDarkMode}
      className={clsx(
        'relative inline-flex items-center rounded-full border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 transition-colors duration-200',
        darkMode 
          ? 'bg-blue-600 hover:bg-blue-700' 
          : 'bg-slate-200 hover:bg-slate-300',
        sizeClasses[size],
        className
      )}
      title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
    >
      <span
        className={clsx(
          'inline-block rounded-full bg-white shadow-lg transform transition-transform duration-200 flex items-center justify-center',
          thumbSizeClasses[size],
          darkMode ? 'translate-x-7' : 'translate-x-0.5'
        )}
      >
        {darkMode ? (
          <Moon className="h-3 w-3 text-blue-600" />
        ) : (
          <Sun className="h-3 w-3 text-orange-500" />
        )}
      </span>
      
      {/* Background decorations */}
      <div className="absolute inset-0 flex items-center justify-between px-1.5">
        <div className={clsx(
          'transition-opacity duration-200',
          !darkMode ? 'opacity-100' : 'opacity-0'
        )}>
          <Sun className="h-3 w-3 text-orange-500" />
        </div>
        <div className={clsx(
          'transition-opacity duration-200',
          darkMode ? 'opacity-100' : 'opacity-0'
        )}>
          <Moon className="h-3 w-3 text-blue-100" />
        </div>
      </div>
    </button>
  );
};