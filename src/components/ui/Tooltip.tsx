/* File: src/components/ui/Tooltip.tsx */

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

type TooltipPlacement = 
  | 'top' | 'top-start' | 'top-end'
  | 'bottom' | 'bottom-start' | 'bottom-end'
  | 'left' | 'left-start' | 'left-end'
  | 'right' | 'right-start' | 'right-end';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  placement?: TooltipPlacement;
  trigger?: 'hover' | 'click' | 'focus' | 'manual';
  delay?: number;
  hideDelay?: number;
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
  arrowClassName?: string;
  maxWidth?: number;
  offset?: number;
  portal?: boolean;
  zIndex?: number;
  animation?: boolean;
  interactive?: boolean;
  showArrow?: boolean;
}

interface Position {
  x: number;
  y: number;
  placement: TooltipPlacement;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  placement = 'top',
  trigger = 'hover',
  delay = 100,
  hideDelay = 100,
  disabled = false,
  className = '',
  contentClassName = '',
  arrowClassName = '',
  maxWidth = 300,
  offset = 8,
  portal = true,
  zIndex = 1000,
  animation = true,
  interactive = false,
  showArrow = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0, placement });
  const [isAnimating, setIsAnimating] = useState(false);
  
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout>();
  const hideTimeoutRef = useRef<NodeJS.Timeout>();

  // Clear timeouts on unmount
  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  // Calculate tooltip position
  const calculatePosition = (triggerElement: HTMLElement): Position => {
    const triggerRect = triggerElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    // Estimated tooltip dimensions (will be refined after first render)
    const tooltipWidth = tooltipRef.current?.offsetWidth || 200;
    const tooltipHeight = tooltipRef.current?.offsetHeight || 40;

    let bestPlacement = placement;
    let x = 0;
    let y = 0;

    // Calculate base position based on placement
    const positions = {
      top: {
        x: triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2,
        y: triggerRect.top - tooltipHeight - offset,
      },
      'top-start': {
        x: triggerRect.left,
        y: triggerRect.top - tooltipHeight - offset,
      },
      'top-end': {
        x: triggerRect.right - tooltipWidth,
        y: triggerRect.top - tooltipHeight - offset,
      },
      bottom: {
        x: triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2,
        y: triggerRect.bottom + offset,
      },
      'bottom-start': {
        x: triggerRect.left,
        y: triggerRect.bottom + offset,
      },
      'bottom-end': {
        x: triggerRect.right - tooltipWidth,
        y: triggerRect.bottom + offset,
      },
      left: {
        x: triggerRect.left - tooltipWidth - offset,
        y: triggerRect.top + triggerRect.height / 2 - tooltipHeight / 2,
      },
      'left-start': {
        x: triggerRect.left - tooltipWidth - offset,
        y: triggerRect.top,
      },
      'left-end': {
        x: triggerRect.left - tooltipWidth - offset,
        y: triggerRect.bottom - tooltipHeight,
      },
      right: {
        x: triggerRect.right + offset,
        y: triggerRect.top + triggerRect.height / 2 - tooltipHeight / 2,
      },
      'right-start': {
        x: triggerRect.right + offset,
        y: triggerRect.top,
      },
      'right-end': {
        x: triggerRect.right + offset,
        y: triggerRect.bottom - tooltipHeight,
      },
    };

    const pos = positions[placement];
    x = pos.x + scrollX;
    y = pos.y + scrollY;

    // Auto-adjust if tooltip goes outside viewport
    const margin = 8;
    
    // Check if tooltip goes outside horizontally
    if (pos.x < margin) {
      x = margin + scrollX;
    } else if (pos.x + tooltipWidth > viewportWidth - margin) {
      x = viewportWidth - tooltipWidth - margin + scrollX;
    }

    // Check if tooltip goes outside vertically and flip if needed
    if (pos.y < margin) {
      // Flip to bottom if originally top
      if (placement.includes('top')) {
        bestPlacement = placement.replace('top', 'bottom') as TooltipPlacement;
        y = triggerRect.bottom + offset + scrollY;
      }
    } else if (pos.y + tooltipHeight > viewportHeight - margin) {
      // Flip to top if originally bottom
      if (placement.includes('bottom')) {
        bestPlacement = placement.replace('bottom', 'top') as TooltipPlacement;
        y = triggerRect.top - tooltipHeight - offset + scrollY;
      }
    }

    return { x, y, placement: bestPlacement };
  };

  // Show tooltip
  const showTooltip = () => {
    if (disabled || !content) return;
    
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = undefined;
    }

    if (showTimeoutRef.current) return;
    
    showTimeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      setIsAnimating(true);
      
      if (triggerRef.current) {
        const pos = calculatePosition(triggerRef.current);
        setPosition(pos);
      }
    }, delay);
  };

  // Hide tooltip
  const hideTooltip = () => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = undefined;
    }

    hideTimeoutRef.current = setTimeout(() => {
      if (animation) {
        setIsAnimating(false);
        setTimeout(() => setIsVisible(false), 150);
      } else {
        setIsVisible(false);
      }
    }, hideDelay);
  };

  // Handle trigger events
  const triggerProps: any = {};

  if (trigger === 'hover') {
    triggerProps.onMouseEnter = showTooltip;
    triggerProps.onMouseLeave = hideTooltip;
  } else if (trigger === 'click') {
    triggerProps.onClick = (e: React.MouseEvent) => {
      e.preventDefault();
      if (isVisible) {
        hideTooltip();
      } else {
        showTooltip();
      }
    };
  } else if (trigger === 'focus') {
    triggerProps.onFocus = showTooltip;
    triggerProps.onBlur = hideTooltip;
  }

  // Update position on scroll/resize
  useEffect(() => {
    if (!isVisible) return;

    const updatePosition = () => {
      if (triggerRef.current) {
        const pos = calculatePosition(triggerRef.current);
        setPosition(pos);
      }
    };

    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isVisible, placement, offset]);

  // Get arrow classes based on placement
  const getArrowClasses = (currentPlacement: TooltipPlacement) => {
    const baseArrow = 'absolute w-2 h-2 bg-gray-900 dark:bg-gray-700 transform rotate-45';
    
    const arrowPositions = {
      top: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2',
      'top-start': 'bottom-0 left-4 translate-y-1/2',
      'top-end': 'bottom-0 right-4 translate-y-1/2',
      bottom: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2',
      'bottom-start': 'top-0 left-4 -translate-y-1/2',
      'bottom-end': 'top-0 right-4 -translate-y-1/2',
      left: 'right-0 top-1/2 -translate-y-1/2 translate-x-1/2',
      'left-start': 'right-0 top-2 translate-x-1/2',
      'left-end': 'right-0 bottom-2 translate-x-1/2',
      right: 'left-0 top-1/2 -translate-y-1/2 -translate-x-1/2',
      'right-start': 'left-0 top-2 -translate-x-1/2',
      'right-end': 'left-0 bottom-2 -translate-x-1/2',
    };

    return `${baseArrow} ${arrowPositions[currentPlacement]} ${arrowClassName}`;
  };

  // Clone child with trigger props
  const clonedChild = React.cloneElement(children, {
    ...triggerProps,
    ref: (node: HTMLElement) => {
      triggerRef.current = node;
      // Preserve existing ref if any
      const { ref } = children as any;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
  });

  // Tooltip content
  const tooltipContent = isVisible ? (
    <div
      ref={tooltipRef}
      role="tooltip"
      className={`
        absolute px-3 py-2 text-sm text-white bg-gray-900 dark:bg-gray-700 rounded-lg shadow-lg
        ${animation ? (isAnimating ? 'tooltip-enter' : 'tooltip-exit') : ''}
        ${contentClassName}
      `}
      style={{
        left: position.x,
        top: position.y,
        maxWidth: maxWidth,
        zIndex: zIndex,
      }}
      onMouseEnter={interactive ? showTooltip : undefined}
      onMouseLeave={interactive ? hideTooltip : undefined}
    >
      {content}
      {showArrow && (
        <div className={getArrowClasses(position.placement)} />
      )}
    </div>
  ) : null;

  return (
    <>
      {clonedChild}
      {portal && tooltipContent ? createPortal(tooltipContent, document.body) : tooltipContent}
    </>
  );
};

// Compound components for different use cases

// Info Tooltip with Icon
interface InfoTooltipProps extends Omit<TooltipProps, 'children' | 'content'> {
  info: React.ReactNode;
  icon?: React.ReactNode;
  iconClassName?: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({
  info,
  icon,
  iconClassName = '',
  ...props
}) => (
  <Tooltip content={info} {...props}>
    <button
      type="button"
      className={`inline-flex items-center justify-center w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${iconClassName}`}
      aria-label="More information"
    >
      {icon || (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  </Tooltip>
);

// Error Tooltip (shows on error state)
interface ErrorTooltipProps extends Omit<TooltipProps, 'children'> {
  error?: string;
  children: React.ReactElement;
  showOnError?: boolean;
}

export const ErrorTooltip: React.FC<ErrorTooltipProps> = ({
  error,
  children,
  showOnError = true,
  ...props
}) => {
  const hasError = Boolean(error);
  
  if (!hasError || !showOnError) {
    return children;
  }

  return (
    <Tooltip
      content={
        <div className="flex items-start space-x-2">
          <svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      }
      contentClassName="bg-red-600 dark:bg-red-700"
      arrowClassName="bg-red-600 dark:bg-red-700"
      trigger="hover"
      placement="top"
      {...props}
    >
      {children}
    </Tooltip>
  );
};

// TypeScript specific tooltip for type information
interface TypeTooltipProps extends Omit<TooltipProps, 'content'> {
  type: string;
  description?: string;
  examples?: string[];
}

export const TypeTooltip: React.FC<TypeTooltipProps> = ({
  type,
  description,
  examples = [],
  children,
  ...props
}) => (
  <Tooltip
    content={
      <div className="space-y-2">
        <div>
          <span className="text-xs text-gray-300 uppercase tracking-wide">Type</span>
          <div className="font-mono text-blue-300 mt-1">{type}</div>
        </div>
        
        {description && (
          <div>
            <span className="text-xs text-gray-300 uppercase tracking-wide">Description</span>
            <p className="mt-1 text-sm">{description}</p>
          </div>
        )}
        
        {examples.length > 0 && (
          <div>
            <span className="text-xs text-gray-300 uppercase tracking-wide">Examples</span>
            <div className="mt-1 space-y-1">
              {examples.map((example, index) => (
                <div key={index} className="font-mono text-xs bg-gray-800 px-2 py-1 rounded">
                  {example}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    }
    maxWidth={400}
    interactive
    {...props}
  >
    {children}
  </Tooltip>
);

export default Tooltip;