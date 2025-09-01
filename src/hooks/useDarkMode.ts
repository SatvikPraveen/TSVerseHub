// src/hooks/useDarkMode.ts

import { useEffect } from 'react';

import { useLocalStorage } from './useLocalStorage';

type ThemeMode = 'light' | 'dark' | 'system';

interface UseDarkModeReturn {
  theme: ThemeMode;
  isDark: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

/**
 * Custom hook for managing dark mode with system preference detection
 * 
 * @param defaultTheme - The default theme mode
 * @returns Object with theme state and controls
 */
export const useDarkMode = (defaultTheme: ThemeMode = 'system'): UseDarkModeReturn => {
  const [theme, setTheme] = useLocalStorage<ThemeMode>('tsversehub-theme', defaultTheme);

  // Get system preference
  const getSystemPreference = (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  // Determine if dark mode should be active
  const isDark = theme === 'dark' || (theme === 'system' && getSystemPreference());

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Update CSS custom properties for better integration
    root.style.setProperty('--theme-mode', isDark ? 'dark' : 'light');
    
    // Update meta theme-color for mobile browsers
    const updateMetaThemeColor = (color: string) => {
      let metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (!metaThemeColor) {
        metaThemeColor = document.createElement('meta');
        metaThemeColor.setAttribute('name', 'theme-color');
        document.head.appendChild(metaThemeColor);
      }
      metaThemeColor.setAttribute('content', color);
    };

    updateMetaThemeColor(isDark ? '#1f2937' : '#ffffff');

    // Update favicon based on theme (if you have different favicons)
    const updateFavicon = (isDark: boolean) => {
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (favicon) {
        // You can have different favicons for light/dark mode
        const faviconPath = isDark ? '/favicon-dark.ico' : '/favicon.ico';
        favicon.href = faviconPath;
      }
    };

    updateFavicon(isDark);
  }, [isDark]);

  // Listen for system theme changes when in system mode
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      // Force re-render by updating a dummy state or triggering re-evaluation
      // This is handled automatically by the isDark calculation above
    };

    // Add listener
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme]);

  // Keyboard shortcut for theme toggle (Ctrl/Cmd + Shift + L)
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'L') {
        event.preventDefault();
        toggleTheme();
      }
    };

    document.addEventListener('keydown', handleKeydown);
    
    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [theme]); // Include theme in deps to ensure toggleTheme has latest value

  const toggleTheme = () => {
    const nextTheme: ThemeMode = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(nextTheme);
  };

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme,
  };
};