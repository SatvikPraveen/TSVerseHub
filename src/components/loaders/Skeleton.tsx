// File: src/components/loaders/Skeleton.tsx

import React from 'react';
import clsx from 'clsx';

interface SkeletonProps {
  className?: string;
  animate?: boolean;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  animate = true,
  variant = 'text',
  width,
  height,
}) => {
  const baseClasses = clsx(
    'bg-slate-200 dark:bg-slate-700',
    animate && 'animate-pulse',
    {
      'rounded': variant === 'text',
      'rounded-full': variant === 'circular',
      'rounded-lg': variant === 'rectangular',
    },
    className
  );

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  const defaultDimensions = {
    text: 'h-4 w-full',
    circular: 'h-10 w-10',
    rectangular: 'h-32 w-full',
  };

  return (
    <div
      className={clsx(baseClasses, !width && !height && defaultDimensions[variant])}
      style={style}
    />
  );
};

// Card skeleton for loading cards
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={clsx('p-6 border border-slate-200 dark:border-slate-700 rounded-lg space-y-4', className)}>
      <div className="flex items-center space-x-3">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="space-y-2 flex-1">
          <Skeleton variant="text" width="60%" height={16} />
          <Skeleton variant="text" width="40%" height={14} />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton variant="text" />
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="90%" />
      </div>
      <div className="flex space-x-2">
        <Skeleton variant="rectangular" width={80} height={32} />
        <Skeleton variant="rectangular" width={100} height={32} />
      </div>
    </div>
  );
};

// Concept card skeleton
export const ConceptCardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={clsx('bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 space-y-4', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton variant="text" width="70%" height={20} />
          <Skeleton variant="text" width="50%" height={14} />
        </div>
        <Skeleton variant="rectangular" width={24} height={24} />
      </div>
      
      <Skeleton variant="rectangular" height={80} className="rounded" />
      
      <div className="space-y-2">
        <Skeleton variant="text" />
        <Skeleton variant="text" width="85%" />
      </div>
      
      <div className="flex items-center justify-between pt-2">
        <div className="flex space-x-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rectangular" width={60} height={20} />
          ))}
        </div>
        <Skeleton variant="rectangular" width={80} height={32} />
      </div>
    </div>
  );
};

// Dashboard skeleton
export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="space-y-4">
        <Skeleton variant="text" width="40%" height={32} />
        <Skeleton variant="text" width="60%" height={16} />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <Skeleton variant="circular" width={32} height={32} />
              <Skeleton variant="text" width={60} height={20} />
            </div>
            <Skeleton variant="text" width="40%" height={24} />
            <Skeleton variant="text" width="80%" height={14} className="mt-2" />
          </div>
        ))}
      </div>

      {/* Content grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <ConceptCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};

// Playground skeleton
export const PlaygroundSkeleton: React.FC = () => {
  return (
    <div className="h-screen flex flex-col">
      {/* Toolbar skeleton */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-4">
          <Skeleton variant="rectangular" width={120} height={32} />
          <Skeleton variant="rectangular" width={80} height={32} />
        </div>
        <div className="flex items-center space-x-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rectangular" width={32} height={32} />
          ))}
        </div>
      </div>

      {/* Editor skeleton */}
      <div className="flex-1 flex">
        <div className="flex-1 p-4 space-y-2">
          <Skeleton variant="text" width="30%" height={16} />
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <Skeleton key={i} variant="text" width={`${Math.random() * 40 + 60}%`} height={16} />
          ))}
        </div>
        
        <div className="w-px bg-slate-200 dark:bg-slate-700" />
        
        <div className="flex-1 p-4 space-y-2">
          <Skeleton variant="text" width="25%" height={16} />
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} variant="text" width={`${Math.random() * 50 + 50}%`} height={16} />
          ))}
        </div>
      </div>
      
      {/* Output panel skeleton */}
      <div className="h-32 border-t border-slate-200 dark:border-slate-700 p-4 space-y-2">
        <Skeleton variant="text" width="20%" height={16} />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="text" width={`${Math.random() * 60 + 40}%`} height={14} />
        ))}
      </div>
    </div>
  );
};

// List skeleton
export const ListSkeleton: React.FC<{ items?: number; className?: string }> = ({ 
  items = 5, 
  className = '' 
}) => {
  return (
    <div className={clsx('space-y-3', className)}>
      {Array.from({ length: items }, (_, index) => (
        <div key={index} className="flex items-center space-x-3 p-3">
          <Skeleton variant="circular" width={32} height={32} />
          <div className="flex-1 space-y-1">
            <Skeleton variant="text" width={`${Math.random() * 30 + 70}%`} height={16} />
            <Skeleton variant="text" width={`${Math.random() * 40 + 40}%`} height={12} />
          </div>
          <Skeleton variant="rectangular" width={60} height={24} />
        </div>
      ))}
    </div>
  );
};

// Table skeleton
export const TableSkeleton: React.FC<{ 
  rows?: number; 
  columns?: number; 
  className?: string; 
}> = ({ 
  rows = 5, 
  columns = 4, 
  className = '' 
}) => {
  return (
    <div className={clsx('space-y-4', className)}>
      {/* Table header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }, (_, index) => (
          <Skeleton key={index} variant="text" width="80%" height={16} />
        ))}
      </div>
      
      {/* Table rows */}
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }, (_, colIndex) => (
            <Skeleton 
              key={colIndex} 
              variant="text" 
              width={`${Math.random() * 40 + 60}%`} 
              height={14} 
            />
          ))}
        </div>
      ))}
    </div>
  );
};