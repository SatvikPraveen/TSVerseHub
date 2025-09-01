// src/registerSW.ts

import { registerSW } from 'virtual:pwa-register';
import type { RegisterSWOptions } from 'vite-plugin-pwa/types';

// Types for better TypeScript support
interface NotificationConfig {
  title: string;
  options: NotificationOptions;
}

interface UpdatePromptConfig {
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
}

class ServiceWorkerManager {
  private updateAvailable = false;
  private registration: ServiceWorkerRegistration | undefined;
  private updateSW: ((reloadPage?: boolean) => Promise<void>) | undefined;

  constructor() {
    this.initializeServiceWorker();
  }

  private initializeServiceWorker(): void {
    // Only register in production and if supported
    if (import.meta.env.DEV || !('serviceWorker' in navigator)) {
      console.log('Service Worker not registered - development mode or not supported');
      return;
    }

    this.registerServiceWorker();
    this.setupPeriodicUpdates();
    this.setupNetworkStatusListener();
  }

  private registerServiceWorker(): void {
    const options: RegisterSWOptions = {
      onNeedRefresh: () => {
        this.updateAvailable = true;
        this.showUpdatePrompt();
      },
      
      onOfflineReady: () => {
        this.handleOfflineReady();
      },
      
      onRegistered: (registration) => {
        this.registration = registration;
        this.handleRegistered(registration);
      },
      
      onRegisterError: (error) => {
        this.handleRegistrationError(error);
      },
    };

    this.updateSW = registerSW(options);
  }

  private showUpdatePrompt(): void {
    // Check if we should show a custom UI instead of browser confirm
    if (this.shouldUseCustomPrompt()) {
      this.showCustomUpdatePrompt();
    } else {
      this.showBrowserUpdatePrompt();
    }
  }

  private shouldUseCustomPrompt(): boolean {
    // Use custom prompt if we have a UI framework available
    return typeof document !== 'undefined' && 
           document.querySelector('[data-update-prompt]') !== null;
  }

  private showCustomUpdatePrompt(): void {
    // Dispatch custom event for UI components to handle
    const event = new CustomEvent('sw-update-available', {
      detail: {
        updateSW: this.updateSW,
        registration: this.registration
      }
    });
    
    window.dispatchEvent(event);
  }

  private showBrowserUpdatePrompt(): void {
    const config: UpdatePromptConfig = {
      message: 'New content available! Click OK to refresh and get the latest features.',
      confirmText: 'Update',
      cancelText: 'Later',
      onConfirm: () => {
        this.performUpdate();
      },
      onCancel: () => {
        console.log('User postponed update');
        // Optionally show a toast notification for later
        this.showToast('Update postponed. You can refresh manually anytime.', 'info');
      }
    };

    if (confirm(config.message)) {
      config.onConfirm();
    } else {
      config.onCancel();
    }
  }

  private async performUpdate(): Promise<void> {
    if (!this.updateSW) return;

    try {
      this.showToast('Updating app...', 'info');
      await this.updateSW(true);
    } catch (error) {
      console.error('Failed to update app:', error);
      this.showToast('Update failed. Please refresh manually.', 'error');
    }
  }

  private handleOfflineReady(): void {
    console.log('App is ready to work offline');
    
    // Show multiple types of notifications
    this.requestNotificationPermission().then(() => {
      this.showOfflineNotification();
    });

    this.showToast('TSVerseHub is ready to work offline! 🚀', 'success');
    this.updateNetworkStatus(false);
  }

  private async requestNotificationPermission(): Promise<void> {
    if (!('Notification' in window)) {
      console.log('Notifications not supported');
      return;
    }

    if (Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission();
        console.log('Notification permission:', permission);
      } catch (error) {
        console.warn('Failed to request notification permission:', error);
      }
    }
  }

  private showOfflineNotification(): void {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const config: NotificationConfig = {
      title: 'TSVerseHub - Offline Ready! 🚀',
      options: {
        body: 'You can now use TSVerseHub without an internet connection. Your progress will sync when you\'re back online.',
        icon: '/images/icons/typescript.png',
        badge: '/images/icons/typescript.png',
        tag: 'offline-ready',
        requireInteraction: false,
        silent: false,
        data: {
          type: 'offline-ready',
          timestamp: Date.now(),
          url: window.location.origin
        },
        actions: [
          {
            action: 'open',
            title: 'Open App',
            icon: '/images/icons/typescript.png'
          }
        ]
      }
    };

    const notification = new Notification(config.title, config.options);

    // Handle notification interactions
    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);
  }

  private handleRegistered(registration: ServiceWorkerRegistration): void {
    console.log('SW Registered successfully:', registration);
    
    // Log registration details
    console.log('Service Worker Details:', {
      scope: registration.scope,
      updateViaCache: registration.updateViaCache,
      active: !!registration.active,
      installing: !!registration.installing,
      waiting: !!registration.waiting
    });

    // Setup update checking
    this.setupUpdateChecking(registration);
  }

  private setupUpdateChecking(registration: ServiceWorkerRegistration): void {
    // Check for updates every 30 minutes
    setInterval(() => {
      registration.update().catch(error => {
        console.warn('Failed to check for service worker updates:', error);
      });
    }, 30 * 60 * 1000); // 30 minutes

    // Listen for service worker state changes
    if (registration.installing) {
      this.trackServiceWorkerState(registration.installing);
    }

    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        this.trackServiceWorkerState(newWorker);
      }
    });
  }

  private trackServiceWorkerState(worker: ServiceWorker): void {
    worker.addEventListener('statechange', () => {
      console.log('Service Worker state changed:', worker.state);
      
      switch (worker.state) {
        case 'installed':
          if (navigator.serviceWorker.controller) {
            console.log('New service worker installed, update available');
          } else {
            console.log('Service worker installed for the first time');
          }
          break;
        case 'activated':
          console.log('Service worker activated');
          break;
        case 'redundant':
          console.log('Service worker became redundant');
          break;
      }
    });
  }

  private handleRegistrationError(error: Error): void {
    console.error('SW registration failed:', error);
    
    // Log detailed error information
    console.error('Registration Error Details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      userAgent: navigator.userAgent,
      url: window.location.href
    });

    // Show user-friendly error message
    this.showToast('Failed to enable offline features. The app will work normally online.', 'warning');
  }

  private setupPeriodicUpdates(): void {
    // Check for updates when the app becomes visible again
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.registration) {
        this.registration.update().catch(console.warn);
      }
    });

    // Check for updates on window focus
    window.addEventListener('focus', () => {
      if (this.registration) {
        this.registration.update().catch(console.warn);
      }
    });
  }

  private setupNetworkStatusListener(): void {
    // Monitor network status
    window.addEventListener('online', () => {
      console.log('App came online');
      this.updateNetworkStatus(true);
      this.showToast('Connection restored! 🌐', 'success');
    });

    window.addEventListener('offline', () => {
      console.log('App went offline');
      this.updateNetworkStatus(false);
      this.showToast('You\'re offline. Don\'t worry, you can still use TSVerseHub! 📚', 'info');
    });
  }

  private updateNetworkStatus(isOnline: boolean): void {
    // Update UI to show network status
    const statusElement = document.querySelector('[data-network-status]');
    if (statusElement) {
      statusElement.textContent = isOnline ? 'Online' : 'Offline';
      statusElement.className = isOnline ? 'status-online' : 'status-offline';
    }

    // Dispatch event for components to handle
    window.dispatchEvent(new CustomEvent('network-status-change', {
      detail: { isOnline }
    }));
  }

  private showToast(message: string, type: 'info' | 'success' | 'warning' | 'error'): void {
    // Try to use react-hot-toast if available
    if (typeof window !== 'undefined' && (window as any).toast) {
      const toast = (window as any).toast;
      switch (type) {
        case 'success':
          toast.success(message);
          break;
        case 'error':
          toast.error(message);
          break;
        case 'warning':
          toast(message, { icon: '⚠️' });
          break;
        default:
          toast(message);
      }
      return;
    }

    // Fallback to console if no toast library
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // Create a simple toast element if needed
    this.createSimpleToast(message, type);
  }

  private createSimpleToast(message: string, type: string): void {
    const toast = document.createElement('div');
    toast.className = `simple-toast toast-${type}`;
    toast.textContent = message;
    
    // Basic styles
    Object.assign(toast.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '12px 16px',
      backgroundColor: this.getToastColor(type),
      color: 'white',
      borderRadius: '8px',
      zIndex: '9999',
      fontSize: '14px',
      maxWidth: '300px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      transition: 'all 0.3s ease'
    });

    document.body.appendChild(toast);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 4000);
  }

  private getToastColor(type: string): string {
    const colors = {
      info: '#3b82f6',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    };
    return colors[type as keyof typeof colors] || colors.info;
  }

  // Public methods for manual control
  public async checkForUpdates(): Promise<void> {
    if (this.registration) {
      await this.registration.update();
    }
  }

  public async forceUpdate(): Promise<void> {
    if (this.updateSW) {
      await this.updateSW(true);
    }
  }

  public getRegistration(): ServiceWorkerRegistration | undefined {
    return this.registration;
  }

  public isUpdateAvailable(): boolean {
    return this.updateAvailable;
  }
}

// Initialize service worker manager
const swManager = new ServiceWorkerManager();

// Export for external usage
export default swManager;
export { ServiceWorkerManager };

// Make available globally for debugging
if (import.meta.env.DEV) {
  (window as any).swManager = swManager;
}