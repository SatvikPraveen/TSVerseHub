// src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.tsx';
import './index.css';

// Import service worker for PWA support
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  import('./registerSW.ts').catch(console.error);
}

// Console welcome message in development
if (import.meta.env.DEV) {
  console.log(`
    🚀 TSVerseHub - TypeScript Learning Platform
    
    Welcome to the developer console!
    
    📚 Learning Resources:
    - Concepts: ${window.location.origin}/concepts
    - Playground: ${window.location.origin}/playground  
    - Projects: ${window.location.origin}/mini-projects
    
    🛠️ Built with:
    - React ${React.version}
    - TypeScript ${import.meta.env.VITE_TS_VERSION || '5.0+'}
    - Vite ${import.meta.env.VITE_VERSION || '4.0+'}
    
    Happy learning! 🎯
  `);
}

// Error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  
  // In development, show more details
  if (import.meta.env.DEV) {
    console.error('Full error:', event);
  }
});

// Error handler for general errors
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  
  // In development, show more details
  if (import.meta.env.DEV) {
    console.error('Error details:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    });
  }
});

// Performance monitoring in production
if (import.meta.env.PROD && 'performance' in window) {
  // Log Core Web Vitals
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'measure') {
        console.log(`Performance: ${entry.name} took ${entry.duration}ms`);
      }
    }
  });
  
  observer.observe({ entryTypes: ['measure'] });
  
  // Log page load time
  window.addEventListener('load', () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigation) {
      console.log('Page Performance:', {
        'DOM Content Loaded': `${navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart}ms`,
        'Load Complete': `${navigation.loadEventEnd - navigation.loadEventStart}ms`,
        'Total Load Time': `${navigation.loadEventEnd - navigation.fetchStart}ms`
      });
    }
  });
}

// Root element with error handling
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error(
    'Failed to find the root element. Make sure you have an element with id="root" in your HTML.'
  );
}

// Create React root with error boundary
const root = ReactDOM.createRoot(rootElement);

// Render app with error handling
try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error('Failed to render React app:', error);
  
  // Fallback UI in case React fails to render
  rootElement.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 2rem;
      text-align: center;
      font-family: system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    ">
      <div style="
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border-radius: 1rem;
        padding: 3rem;
        max-width: 500px;
        border: 1px solid rgba(255, 255, 255, 0.2);
      ">
        <h1 style="font-size: 2.5rem; margin-bottom: 1rem; font-weight: 700;">
          🚀 TSVerseHub
        </h1>
        <h2 style="font-size: 1.25rem; margin-bottom: 1.5rem; opacity: 0.9;">
          Application Loading Error
        </h2>
        <p style="margin-bottom: 1.5rem; opacity: 0.8;">
          We encountered an error while starting the application. Please try refreshing the page.
        </p>
        <button 
          onclick="window.location.reload()" 
          style="
            background: #3b82f6;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-size: 1rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            margin-right: 1rem;
          "
          onmouseover="this.style.background='#2563eb'"
          onmouseout="this.style.background='#3b82f6'"
        >
          Refresh Page
        </button>
        <button 
          onclick="console.clear(); console.log('Error details:', ${JSON.stringify(error)})" 
          style="
            background: transparent;
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.3);
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-size: 1rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
          "
          onmouseover="this.style.background='rgba(255, 255, 255, 0.1)'"
          onmouseout="this.style.background='transparent'"
        >
          View Error Details
        </button>
      </div>
    </div>
  `;
}

// Hot Module Replacement (HMR) for development
if (import.meta.hot && import.meta.env.DEV) {
  import.meta.hot.accept();
  
  // Log HMR updates
  import.meta.hot.on('vite:beforeUpdate', () => {
    console.log('🔄 Hot reloading...');
  });
  
  import.meta.hot.on('vite:afterUpdate', () => {
    console.log('✅ Hot reload complete');
  });
  
  import.meta.hot.on('vite:error', (err) => {
    console.error('❌ HMR Error:', err);
  });
}

// Export for potential testing or debugging
export { root };