// File: src/components/ui/Modal.tsx

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { soundManager } from '../../assets/sounds';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  variant?: 'default' | 'danger' | 'success' | 'warning';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
  footer?: React.ReactNode;
  disableAnimation?: boolean;
  preventScroll?: boolean;
  role?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  onOpen?: () => void;
  onClosed?: () => void;
  zIndex?: number;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  variant = 'default',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = '',
  overlayClassName = '',
  contentClassName = '',
  footer,
  disableAnimation = false,
  preventScroll = true,
  role = 'dialog',
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
  onOpen,
  onClosed,
  zIndex = 1000
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const titleId = `modal-title-${Math.random().toString(36).substr(2, 9)}`;
  const descriptionId = `modal-description-${Math.random().toString(36).substr(2, 9)}`;

  // Size configurations
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4 my-4 h-[calc(100vh-2rem)]'
  };

  // Variant configurations
  const variantClasses = {
    default: 'border-gray-200 dark:border-gray-700',
    danger: 'border-red-200 dark:border-red-800',
    success: 'border-green-200 dark:border-green-800',
    warning: 'border-yellow-200 dark:border-yellow-800'
  };

  // Animation classes
  const animationClasses = {
    overlay: {
      enter: 'animate-fade-in',
      exit: 'animate-fade-out'
    },
    modal: {
      enter: 'animate-scale-up animate-fade-in',
      exit: 'animate-scale-down animate-fade-out'
    }
  };

  // Handle modal open/close logic
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsAnimating(true);
      
      // Store previously focused element
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // Prevent scroll if enabled
      if (preventScroll) {
        document.body.style.overflow = 'hidden';
      }
      
      // Play open sound
      soundManager.playClick();
      
      // Call onOpen callback
      onOpen?.();
      
      // Focus modal after animation
      setTimeout(() => {
        modalRef.current?.focus();
        setIsAnimating(false);
      }, disableAnimation ? 0 : 200);
    } else if (shouldRender) {
      setIsAnimating(true);
      
      // Restore scroll
      if (preventScroll) {
        document.body.style.overflow = '';
      }
      
      // Hide modal after animation
      setTimeout(() => {
        setShouldRender(false);
        setIsAnimating(false);
        
        // Restore focus
        if (previousActiveElement.current) {
          previousActiveElement.current.focus();
        }
        
        // Call onClosed callback
        onClosed?.();
      }, disableAnimation ? 0 : 200);
    }

    return () => {
      if (preventScroll) {
        document.body.style.overflow = '';
      }
    };
  }, [isOpen, shouldRender, preventScroll, disableAnimation, onOpen, onClosed]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      if (event.key === 'Escape' && closeOnEscape) {
        event.preventDefault();
        onClose();
      }

      // Trap focus within modal
      if (event.key === 'Tab') {
        const modal = modalRef.current;
        if (!modal) return;

        const focusableElements = modal.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEscape, onClose]);

  // Handle overlay click
  const handleOverlayClick = (event: React.MouseEvent) => {
    if (closeOnOverlayClick && event.target === overlayRef.current) {
      onClose();
    }
  };

  // Handle close button click
  const handleCloseClick = () => {
    soundManager.playClick();
    onClose();
  };

  if (!shouldRender) return null;

  const modalContent = (
    <div
      ref={overlayRef}
      className={`
        fixed inset-0 flex items-center justify-center p-4
        bg-black/50 backdrop-blur-sm
        ${!disableAnimation && isAnimating && !isOpen ? animationClasses.overlay.exit : ''}
        ${!disableAnimation && isAnimating && isOpen ? animationClasses.overlay.enter : ''}
        ${overlayClassName}
      `}
      style={{ zIndex }}
      onClick={handleOverlayClick}
      aria-hidden="true"
    >
      <div
        ref={modalRef}
        className={`
          relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl
          border ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${size !== 'full' ? 'max-h-[90vh]' : ''}
          w-full overflow-hidden
          ${!disableAnimation && isAnimating && !isOpen ? animationClasses.modal.exit : ''}
          ${!disableAnimation && isAnimating && isOpen ? animationClasses.modal.enter : ''}
          ${className}
        `}
        role={role}
        aria-modal="true"
        aria-labelledby={ariaLabelledby || (title ? titleId : undefined)}
        aria-describedby={ariaDescribedby || descriptionId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className={`
            flex items-center justify-between p-6 pb-0
            ${variant === 'danger' ? 'text-red-900 dark:text-red-100' : ''}
            ${variant === 'success' ? 'text-green-900 dark:text-green-100' : ''}
            ${variant === 'warning' ? 'text-yellow-900 dark:text-yellow-100' : ''}
          `}>
            {title && (
              <h2 
                id={titleId}
                className="text-xl font-semibold text-gray-900 dark:text-white"
              >
                {title}
              </h2>
            )}
            
            {showCloseButton && (
              <button
                onClick={handleCloseClick}
                className={`
                  ml-auto p-2 rounded-lg transition-colors
                  text-gray-400 hover:text-gray-600 dark:hover:text-gray-200
                  hover:bg-gray-100 dark:hover:bg-gray-800
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                `}
                aria-label="Close modal"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div 
          id={descriptionId}
          className={`
            p-6 ${title || showCloseButton ? 'pt-4' : ''}
            ${size === 'full' ? 'flex-1 overflow-auto' : 'max-h-[60vh] overflow-auto'}
            ${contentClassName}
          `}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

// Confirmation Modal Component
export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to perform this action?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  isLoading = false
}) => {
  const handleConfirm = async () => {
    try {
      await onConfirm();
      soundManager.playSuccess();
    } catch (error) {
      soundManager.playError();
      console.error('Confirmation action failed:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      variant={variant}
      size="sm"
      footer={
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`
              px-4 py-2 text-sm font-medium text-white rounded-lg
              focus:outline-none focus:ring-2 focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed
              ${variant === 'danger' 
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
              }
              ${isLoading ? 'cursor-wait' : ''}
            `}
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Loading...
              </div>
            ) : (
              confirmText
            )}
          </button>
        </div>
      }
    >
      <p className="text-gray-600 dark:text-gray-300">{message}</p>
    </Modal>
  );
};

export default Modal;