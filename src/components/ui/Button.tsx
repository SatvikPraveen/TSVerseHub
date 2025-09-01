// File: src/components/ui/Button.tsx

import React from 'react';
import clsx from 'clsx';
import { Spinner } from '@/components/loaders/Spinner';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white border border-transparent focus:ring-blue-500 shadow-sm hover:shadow',
  secondary: 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 focus:ring-slate-500',
  outline: 'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 focus:ring-slate-500',
  ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border border-transparent focus:ring-slate-500',
  danger: 'bg-red-600 hover:bg-red-700 text-white border border-transparent focus:ring-red-500 shadow-sm hover:shadow',
  success: 'bg-green-600 hover:bg-green-700 text-white border border-transparent focus:ring-green-500 shadow-sm hover:shadow',
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'px-2.5 py-1.5 text-xs',
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-4 py-2.5 text-base',
  xl: 'px-6 py-3 text-base',
};

const disabledClasses = 'opacity-50 cursor-not-allowed pointer-events-none';

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  className = '',
  children,
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      className={clsx(
        // Base styles
        'relative inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900',
        
        // Variant styles
        variantClasses[variant],
        
        // Size styles
        sizeClasses[size],
        
        // Full width
        fullWidth && 'w-full',
        
        // Disabled styles
        isDisabled && disabledClasses,
        
        // Custom classes
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {/* Loading spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner size={size === 'xs' ? 'xs' : size === 'sm' ? 'sm' : 'md'} color="white" />
        </div>
      )}
      
      {/* Button content */}
      <span className={clsx('flex items-center', loading && 'opacity-0')}>
        {leftIcon && (
          <span className="mr-2 flex-shrink-0">
            {leftIcon}
          </span>
        )}
        
        <span>{children}</span>
        
        {rightIcon && (
          <span className="ml-2 flex-shrink-0">
            {rightIcon}
          </span>
        )}
      </span>
    </button>
  );
};

// Icon button component
export const IconButton: React.FC<{
  icon: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  title?: string;
  loading?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  icon,
  variant = 'ghost',
  size = 'md',
  className = '',
  loading = false,
  ...props
}) => {
  const sizeClasses: Record<ButtonSize, string> = {
    xs: 'p-1',
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
    xl: 'p-3',
  };

  return (
    <button
      className={clsx(
        'relative inline-flex items-center justify-center rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900',
        variantClasses[variant],
        sizeClasses[size],
        (props.disabled || loading) && disabledClasses,
        className
      )}
      {...props}
    >
      {loading ? (
        <Spinner size={size === 'xs' ? 'xs' : size === 'sm' ? 'sm' : 'md'} />
      ) : (
        icon
      )}
    </button>
  );
};

// Button group component
export const ButtonGroup: React.FC<{
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}> = ({
  children,
  orientation = 'horizontal',
  className = '',
}) => {
  return (
    <div
      className={clsx(
        'inline-flex',
        orientation === 'horizontal' ? 'flex-row' : 'flex-col',
        '[&>button:not(:first-child)]:border-l-0 [&>button:not(:last-child)]:rounded-r-none [&>button:not(:first-child)]:rounded-l-none',
        orientation === 'vertical' && '[&>button:not(:first-child)]:border-t-0 [&>button:not(:last-child)]:rounded-b-none [&>button:not(:first-child)]:rounded-t-none',
        className
      )}
    >
      {children}
    </div>
  );
};

// Floating action button
export const FloatingActionButton: React.FC<{
  icon: React.ReactNode;
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
} & React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  icon,
  className = '',
  position = 'bottom-right',
  ...props
}) => {
  const positionClasses = {
    'bottom-right': 'fixed bottom-6 right-6',
    'bottom-left': 'fixed bottom-6 left-6',
    'top-right': 'fixed top-6 right-6',
    'top-left': 'fixed top-6 left-6',
  };

  return (
    <button
      className={clsx(
        'z-50 flex items-center justify-center w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        positionClasses[position],
        className
      )}
      {...props}
    >
      {icon}
    </button>
  );
};

// Copy button with feedback
export const CopyButton: React.FC<{
  text: string;
  size?: ButtonSize;
  className?: string;
  children?: React.ReactNode;
}> = ({
  text,
  size = 'sm',
  className = '',
  children,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <Button
      variant="outline"
      size={size}
      onClick={handleCopy}
      className={clsx('transition-colors', className)}
    >
      {copied ? (
        <>
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {children || 'Copy'}
        </>
      )}
    </Button>
  );
};