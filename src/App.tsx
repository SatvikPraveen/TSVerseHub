// File: src/App.tsx

import { Component, Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import { Footer } from '@/components/common/Footer';
import { Navbar } from '@/components/common/Navbar';
import { Sidebar } from '@/components/common/Sidebar';
import { Spinner } from '@/components/loaders/Spinner';
import { useDarkMode } from '@/hooks/useDarkMode';

import type React from 'react';

// Lazy load pages for better performance
const Home = lazy(() => import('@/pages/Home'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Concepts = lazy(() => import('@/pages/Concepts'));
const MiniProjects = lazy(() => import('@/pages/MiniProjects'));
const Playground = lazy(() => import('@/pages/Playground'));
const About = lazy(() => import('@/pages/About'));

// Loading fallback component
const PageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
    <div className="text-center">
      <img 
        src="/images/logo.png" 
        alt="TSVerseHub" 
        className="w-16 h-16 mx-auto mb-4 animate-pulse"
      />
      <Spinner size="lg" />
      <p className="mt-4 text-slate-600 dark:text-slate-400">Loading TypeScript goodness...</p>
    </div>
  </div>
);

// Error boundary component
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class AppErrorBoundary extends Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error Boundary caught an error:', error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
          <div className="text-center max-w-md px-6">
            <img 
              src="/images/icons/typescript.png" 
              alt="TypeScript Error" 
              className="w-20 h-20 mx-auto mb-6 opacity-50"
            />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Oops! Something went wrong
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Don&apos;t worry, even the best TypeScript code has bugs sometimes. Let&apos;s get you back on track!
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Reload Page
              </button>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="w-full px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium"
              >
                Try Again
              </button>
            </div>
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-sm text-sm overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Main App component
const App: React.FC = () => {
  const { isDark: darkMode, toggleTheme: toggleDarkMode } = useDarkMode();
  const location = useLocation();
  // The sidebar closes on route change: it is open only while the route it
  // was opened on is still the current one, so no effect has to reset it.
  const [sidebarOpenedOn, setSidebarOpenedOn] = useState<string | null>(null);
  const sidebarOpen = sidebarOpenedOn === location.pathname;
  const setSidebarOpen = useCallback(
    (open: boolean) => setSidebarOpenedOn(open ? location.pathname : null),
    [location.pathname],
  );

  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for search (future implementation)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // TODO: Open search modal
      }
      
      // Cmd/Ctrl + / for help (future implementation)
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        // TODO: Open help modal
      }

      // Escape to close sidebar
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [sidebarOpen, setSidebarOpen]);

  return (
    <AppErrorBoundary>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
        {/* Navigation */}
        <Navbar 
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <main 
          className={`transition-all duration-300 ${
            sidebarOpen ? 'lg:ml-64' : ''
          }`}
        >
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Home Route */}
              <Route path="/" element={<Home />} />
              
              {/* Dashboard Route */}
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Concepts Routes */}
              <Route path="/concepts" element={<Concepts />} />
              <Route path="/concepts/:conceptId" element={<Concepts />} />
              
              {/* Mini Projects Routes */}
              <Route path="/mini-projects" element={<MiniProjects />} />
              <Route path="/mini-projects/:projectId" element={<MiniProjects />} />
              
              {/* Playground Route */}
              <Route path="/playground" element={<Playground />} />
              
              {/* About Route */}
              <Route path="/about" element={<About />} />
              
              {/* Redirect old routes */}
              <Route path="/learn" element={<Navigate to="/concepts" replace />} />
              <Route path="/projects" element={<Navigate to="/mini-projects" replace />} />
              
              {/* 404 - Catch all route */}
              <Route 
                path="*" 
                element={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <img 
                        src="/images/icons/typescript.png" 
                        alt="404" 
                        className="w-24 h-24 mx-auto mb-6 opacity-50"
                      />
                      <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                        404 - Page Not Found
                      </h1>
                      <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
                        This page seems to have type errors. Let&apos;s get you back to safety!
                      </p>
                      <button
                        onClick={() => window.history.back()}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium mr-4"
                      >
                        Go Back
                      </button>
                      <button
                        onClick={() => window.location.href = '/'}
                        className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium"
                      >
                        Home
                      </button>
                    </div>
                  </div>
                } 
              />
            </Routes>
          </Suspense>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </AppErrorBoundary>
  );
};

export default App;