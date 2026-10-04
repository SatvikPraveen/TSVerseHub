// File: src/components/ui/Card.tsx

import { clsx } from 'clsx';

import type { CSSProperties, FC, HTMLAttributes, ReactNode } from 'react';

export type CardVariant = 'default' | 'outlined' | 'elevated' | 'gradient' | 'primary' | 'success';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: CardPadding;
  variant?: CardVariant;
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
  avatar?: ReactNode;
  action?: ReactNode;
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
  divider?: boolean;
}

const paddingClasses: Record<CardPadding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const variantClasses: Record<CardVariant, string> = {
  default: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
  outlined: 'bg-transparent border-2 border-slate-200 dark:border-slate-700',
  elevated: 'bg-white dark:bg-slate-800 shadow-lg border border-slate-100 dark:border-slate-700',
  gradient: 'bg-linear-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border border-slate-200/50 dark:border-slate-700/50',
  primary: 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800',
  success: 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800',
};

export const Card: FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  padding = 'md',
  variant = 'default',
  ...rest
}) => {
  return (
    <div
      className={clsx(
        'rounded-lg transition-all duration-200',
        variantClasses[variant],
        paddingClasses[padding],
        hover && 'hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1 cursor-pointer',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

export const CardHeader: FC<CardHeaderProps> = ({
  children,
  className = '',
  avatar,
  action,
}) => {
  return (
    <div className={clsx('flex items-start justify-between space-x-4', className)}>
      <div className="flex items-center space-x-3 min-w-0 flex-1">
        {avatar && (
          <div className="shrink-0">
            {avatar}
          </div>
        )}
        <div className="min-w-0 flex-1">
          {children}
        </div>
      </div>
      {action && (
        <div className="shrink-0">
          {action}
        </div>
      )}
    </div>
  );
};

export const CardContent: FC<CardContentProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={clsx('text-slate-600 dark:text-slate-400', className)}>
      {children}
    </div>
  );
};

export const CardFooter: FC<CardFooterProps> = ({
  children,
  className = '',
  divider = false,
}) => {
  return (
    <div
      className={clsx(
        'flex items-center justify-between',
        divider && 'pt-4 border-t border-slate-200 dark:border-slate-700',
        className
      )}
    >
      {children}
    </div>
  );
};

// Specialized card components
export const ConceptCard: FC<{
  title: string;
  description: string;
  icon?: ReactNode;
  progress?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
}> = ({
  title,
  description,
  icon,
  progress,
  difficulty,
  tags = [],
  onClick,
  className = '',
  style,
}) => {
  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    intermediate: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    advanced: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  };

  return (
    <Card hover={!!onClick} className={clsx('group', className)} onClick={onClick} style={style}>
      <CardHeader
        avatar={
          icon && (
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
              {icon}
            </div>
          )
        }
        action={
          difficulty && (
            <span className={clsx(
              'px-2 py-1 text-xs font-medium rounded-full',
              difficultyColors[difficulty]
            )}>
              {difficulty}
            </span>
          )
        }
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {title}
        </h3>
      </CardHeader>

      <CardContent className="mt-3">
        <p className="text-sm line-clamp-3">
          {description}
        </p>
      </CardContent>

      {(progress !== undefined || tags.length > 0) && (
        <CardFooter className="mt-4" divider>
          <div className="flex-1">
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs rounded-sm"
                  >
                    {tag}
                  </span>
                ))}
                {tags.length > 3 && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    +{tags.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
          
          {progress !== undefined && (
            <div className="flex items-center space-x-2">
              <div className="w-20 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-blue-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {progress}%
              </span>
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export const ProjectCard: FC<{
  title: string;
  description: string;
  image?: string;
  technologies?: string[];
  status?: 'planned' | 'in-progress' | 'completed';
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
}> = ({
  title,
  description,
  image,
  technologies = [],
  status,
  onClick,
  className = '',
  style,
}) => {
  const statusColors = {
    planned: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
    'in-progress': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  };

  return (
    <Card hover={!!onClick} variant="elevated" padding="none" className={clsx('group', className)} onClick={onClick} style={style}>
      {image && (
        <div className="aspect-video bg-slate-100 dark:bg-slate-700 rounded-t-lg overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      <div className="p-4">
        <CardHeader
          action={
            status && (
              <span className={clsx(
                'px-2 py-1 text-xs font-medium rounded-full',
                statusColors[status]
              )}>
                {status.replace('-', ' ')}
              </span>
            )
          }
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {title}
          </h3>
        </CardHeader>

        <CardContent className="mt-2">
          <p className="text-sm line-clamp-2">
            {description}
          </p>
        </CardContent>

        {technologies.length > 0 && (
          <CardFooter className="mt-3" divider>
            <div className="flex flex-wrap gap-1">
              {technologies.map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-sm font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </CardFooter>
        )}
      </div>
    </Card>
  );
};

export const StatsCard: FC<{
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  icon?: ReactNode;
  className?: string;
}> = ({
  title,
  value,
  change,
  icon,
  className = '',
}) => {
  return (
    <Card className={className}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {title}
          </p>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">
            {value}
          </p>
          {change && (
            <div className="flex items-center mt-2">
              <span
                className={clsx(
                  'text-sm font-medium',
                  change.type === 'increase'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                )}
              >
                {change.type === 'increase' ? '+' : '-'}{Math.abs(change.value)}%
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">
                from {change.period}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};