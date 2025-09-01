// File: src/components/loaders/Spinner.tsx

import React from 'react';
import clsx from 'clsx';

interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'purple' | 'green' | 'red' | 'gray' | 'white';
  className?: string;
  label?: string;
}

const sizeClasses = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

const colorClasses = {
  blue: 'border-blue-600',
  purple: 'border-purple-600',
  green: 'border-green-600',
  red: 'border-red-600',
  gray: 'border-gray-600',
  white: 'border-white',
};

export const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'md', 
  color = 'blue', 
  className = '',
  label = 'Loading...'
}) => {
  return (
    <div className={clsx('flex items-center justify-center', className)} role="status">
      <div
        className={clsx(
          'animate-spin rounded-full border-2 border-transparent',
          sizeClasses[size],
          colorClasses[color]
        )}
        style={{
          borderTopColor: 'currentColor',
          borderRightColor: 'currentColor',
        }}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
};

// Spinning TypeScript logo
export const TypeScriptSpinner: React.FC<Omit<SpinnerProps, 'color'>> = ({ 
  size = 'md', 
  className = '',
  label = 'Loading TypeScript...'
}) => {
  return (
    <div className={clsx('flex items-center justify-center', className)} role="status">
      <img
        src="/images/icons/typescript.png"
        alt="TypeScript"
        className={clsx(
          'animate-spin',
          sizeClasses[size]
        )}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
};

// Pulsing dots loader
export const DotsSpinner: React.FC<{ className?: string; label?: string }> = ({ 
  className = '', 
  label = 'Loading...' 
}) => {
  return (
    <div className={clsx('flex items-center space-x-1', className)} role="status">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="h-2 w-2 bg-blue-600 rounded-full animate-pulse"
          style={{
            animationDelay: `${index * 0.2}s`,
            animationDuration: '1s',
            animationIterationCount: 'infinite',
          }}
        />
      ))}
      <span className="sr-only">{label}</span>
    </div>
  );
};

// Skeleton loader for content
export const SkeletonLoader: React.FC<{ 
  lines?: number; 
  className?: string; 
  animate?: boolean;
}> = ({ 
  lines = 3, 
  className = '', 
  animate = true 
}) => {
  return (
    <div className={clsx('space-y-3', className)}>
      {Array.from({ length: lines }, (_, index) => (
        <div
          key={index}
          className={clsx(
            'h-4 bg-slate-200 dark:bg-slate-700 rounded',
            animate && 'animate-pulse',
            index === lines - 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  );
};

// Wave loader with animated bars
export const WaveLoader: React.FC<{ className?: string; color?: string }> = ({ 
  className = '', 
  color = 'bg-blue-600' 
}) => {
  return (
    <div className={clsx('flex items-end space-x-1', className)}>
      {[0, 1, 2, 3, 4].map((index) => (
        <div
          key={index}
          className={clsx(
            'w-1 rounded-full',
            color
          )}
          style={{
            height: `${Math.random() * 20 + 10}px`,
            animation: `wave 1s ease-in-out infinite ${index * 0.1}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes wave {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(2); }
        }
      `}</style>
    </div>
  );
};

// Bouncing ball loader
export const BouncingBalls: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={clsx('flex space-x-2', className)}>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
          style={{
            animationDelay: `${index * 0.1}s`,
            animationDuration: '1.4s',
            animationIterationCount: 'infinite',
          }}
        />
      ))}
    </div>
  );
};

// Circular progress spinner with percentage
export const CircularProgress: React.FC<{
  progress: number;
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  className?: string;
}> = ({ 
  progress, 
  size = 'md', 
  showPercentage = true, 
  className = '' 
}) => {
  const sizeMap = {
    sm: { dimension: 'w-8 h-8', stroke: 2, text: 'text-xs' },
    md: { dimension: 'w-12 h-12', stroke: 3, text: 'text-sm' },
    lg: { dimension: 'w-16 h-16', stroke: 4, text: 'text-base' }
  };
  
  const { dimension, stroke, text } = sizeMap[size];
  const radius = 50 - stroke;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={clsx('relative inline-flex items-center justify-center', dimension, className)}>
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
          fill="transparent"
          className="text-slate-200 dark:text-slate-700"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="text-blue-600 dark:text-blue-400 transition-all duration-300"
        />
      </svg>
      {showPercentage && (
        <span className={clsx('absolute inset-0 flex items-center justify-center font-semibold text-slate-900 dark:text-slate-100', text)}>
          {Math.round(progress)}%
        </span>
      )}
    </div>
  );
};

// Loading spinner with text
export const LoadingWithText: React.FC<{
  text: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ text, size = 'md', className = '' }) => {
  const sizeMap = {
    sm: { spinner: 'xs' as const, text: 'text-sm' },
    md: { spinner: 'md' as const, text: 'text-base' },
    lg: { spinner: 'lg' as const, text: 'text-lg' }
  };
  
  const { spinner, text: textClass } = sizeMap[size];
  
  return (
    <div className={clsx('flex flex-col items-center space-y-3', className)}>
      <Spinner size={spinner} />
      <p className={clsx('font-medium text-slate-700 dark:text-slate-300', textClass)}>
        {text}
      </p>
    </div>
  );
};

// Pulse loader for cards/content
export const PulseLoader: React.FC<{
  width?: string;
  height?: string;
  className?: string;
}> = ({ 
  width = 'w-full', 
  height = 'h-4', 
  className = '' 
}) => {
  return (
    <div 
      className={clsx(
        'bg-slate-200 dark:bg-slate-700 rounded animate-pulse',
        width,
        height,
        className
      )}
    />
  );
};

// Spinning squares loader
export const SpinningSquares: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={clsx('relative w-10 h-10', className)}>
      {[0, 1, 2, 3].map((index) => (
        <div
          key={index}
          className="absolute w-3 h-3 bg-blue-600 rounded animate-spin"
          style={{
            top: index < 2 ? '0px' : '28px',
            left: index % 2 === 0 ? '0px' : '28px',
            animationDelay: `${index * 0.15}s`,
            animationDuration: '1.2s',
          }}
        />
      ))}
    </div>
  );
};

// Gradient spinner
export const GradientSpinner: React.FC<SpinnerProps> = ({ 
  size = 'md', 
  className = '',
  label = 'Loading...'
}) => {
  return (
    <div className={clsx('flex items-center justify-center', className)} role="status">
      <div
        className={clsx(
          'animate-spin rounded-full border-2 border-transparent bg-gradient-to-r from-blue-500 to-purple-500',
          sizeClasses[size]
        )}
        style={{
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box',
        }}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
};

export default Spinner;