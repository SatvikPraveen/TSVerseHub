/* File: src/utils/logger.ts */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  category: string;
  data?: any;
  userId?: string;
  sessionId?: string;
  source?: string;
  stackTrace?: string;
  performance?: {
    duration?: number;
    memory?: number;
    timestamp: number;
  };
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableStorage: boolean;
  enableRemote: boolean;
  maxStorageEntries: number;
  categories: string[];
  remoteEndpoint?: string;
  formatters: {
    console: (entry: LogEntry) => string;
    storage: (entry: LogEntry) => string;
    remote: (entry: LogEntry) => any;
  };
  filters: Array<(entry: LogEntry) => boolean>;
}

export interface LoggerMetrics {
  totalLogs: number;
  byLevel: Record<LogLevel, number>;
  byCategory: Record<string, number>;
  errorRate: number;
  averageLogsPerMinute: number;
  sessionDuration: number;
  lastActivity: Date;
}

class Logger {
  private config: LoggerConfig;
  private entries: LogEntry[] = [];
  private sessionId: string;
  private startTime: Date;
  private metricsCache: LoggerMetrics | null = null;
  private metricsCacheExpiry: number = 0;

  constructor(config?: Partial<LoggerConfig>) {
    this.sessionId = this.generateSessionId();
    this.startTime = new Date();
    
    this.config = {
      level: LogLevel.INFO,
      enableConsole: true,
      enableStorage: true,
      enableRemote: false,
      maxStorageEntries: 1000,
      categories: ['general', 'user', 'system', 'performance', 'error'],
      formatters: {
        console: this.defaultConsoleFormatter,
        storage: this.defaultStorageFormatter,
        remote: this.defaultRemoteFormatter
      },
      filters: [],
      ...config
    };

    this.loadStoredLogs();
  }

  /**
   * Log debug message
   */
  debug(message: string, data?: any, category: string = 'general'): void {
    this.log(LogLevel.DEBUG, message, data, category);
  }

  /**
   * Log info message
   */
  info(message: string, data?: any, category: string = 'general'): void {
    this.log(LogLevel.INFO, message, data, category);
  }

  /**
   * Log warning message
   */
  warn(message: string, data?: any, category: string = 'general'): void {
    this.log(LogLevel.WARN, message, data, category);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | any, category: string = 'error'): void {
    let stackTrace: string | undefined;
    let errorData = error;

    if (error instanceof Error) {
      stackTrace = error.stack;
      errorData = {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
    }

    this.log(LogLevel.ERROR, message, errorData, category, undefined, stackTrace);
  }

  /**
   * Log fatal message
   */
  fatal(message: string, error?: Error | any, category: string = 'error'): void {
    let stackTrace: string | undefined;
    let errorData = error;

    if (error instanceof Error) {
      stackTrace = error.stack;
      errorData = {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
    }

    this.log(LogLevel.FATAL, message, errorData, category, undefined, stackTrace);
  }

  /**
   * Log with performance timing
   */
  performance(message: string, duration: number, category: string = 'performance'): void {
    this.log(LogLevel.INFO, message, undefined, category, {
      duration,
      memory: this.getMemoryUsage(),
      timestamp: Date.now()
    });
  }

  /**
   * Start performance timing
   */
  startTimer(name: string): () => void {
    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();

    return () => {
      const duration = performance.now() - startTime;
      const endMemory = this.getMemoryUsage();
      
      this.performance(
        `Timer '${name}' completed`,
        duration,
        'performance'
      );

      this.debug(`Memory delta for '${name}': ${endMemory - startMemory}KB`, {
        startMemory,
        endMemory,
        delta: endMemory - startMemory
      }, 'performance');
    };
  }

  /**
   * Log user action
   */
  userAction(action: string, userId: string, data?: any): void {
    this.log(LogLevel.INFO, `User action: ${action}`, data, 'user', undefined, undefined, userId);
  }

  /**
   * Log system event
   */
  systemEvent(event: string, data?: any): void {
    this.log(LogLevel.INFO, `System event: ${event}`, data, 'system');
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    message: string,
    data?: any,
    category: string = 'general',
    performance?: LogEntry['performance'],
    stackTrace?: string,
    userId?: string
  ): void {
    // Check if logging is enabled for this level
    if (level < this.config.level) {
      return;
    }

    // Create log entry
    const entry: LogEntry = {
      id: this.generateLogId(),
      timestamp: new Date(),
      level,
      message,
      category,
      data,
      userId,
      sessionId: this.sessionId,
      source: this.getSource(),
      stackTrace,
      performance
    };

    // Apply filters
    if (!this.applyFilters(entry)) {
      return;
    }

    // Add to entries
    this.entries.push(entry);

    // Maintain max storage entries
    if (this.entries.length > this.config.maxStorageEntries) {
      this.entries = this.entries.slice(-this.config.maxStorageEntries);
    }

    // Output to console
    if (this.config.enableConsole) {
      this.outputToConsole(entry);
    }

    // Store locally
    if (this.config.enableStorage) {
      this.storeEntry(entry);
    }

    // Send to remote endpoint
    if (this.config.enableRemote && this.config.remoteEndpoint) {
      this.sendToRemote(entry);
    }

    // Clear metrics cache
    this.metricsCache = null;
  }

  /**
   * Get all log entries
   */
  getEntries(filter?: {
    level?: LogLevel;
    category?: string;
    startDate?: Date;
    endDate?: Date;
    userId?: string;
    limit?: number;
  }): LogEntry[] {
    let filteredEntries = [...this.entries];

    if (filter) {
      if (filter.level !== undefined) {
        filteredEntries = filteredEntries.filter(entry => entry.level >= filter.level!);
      }

      if (filter.category) {
        filteredEntries = filteredEntries.filter(entry => entry.category === filter.category);
      }

      if (filter.startDate) {
        filteredEntries = filteredEntries.filter(entry => entry.timestamp >= filter.startDate!);
      }

      if (filter.endDate) {
        filteredEntries = filteredEntries.filter(entry => entry.timestamp <= filter.endDate!);
      }

      if (filter.userId) {
        filteredEntries = filteredEntries.filter(entry => entry.userId === filter.userId);
      }

      if (filter.limit) {
        filteredEntries = filteredEntries.slice(-filter.limit);
      }
    }

    return filteredEntries;
  }

  /**
   * Get log metrics
   */
  getMetrics(): LoggerMetrics {
    // Return cached metrics if still valid (cache for 1 minute)
    if (this.metricsCache && Date.now() < this.metricsCacheExpiry) {
      return this.metricsCache;
    }

    const now = new Date();
    const sessionDuration = now.getTime() - this.startTime.getTime();
    const entriesInLastMinute = this.entries.filter(
      entry => now.getTime() - entry.timestamp.getTime() < 60000
    );

    const byLevel: Record<LogLevel, number> = {
      [LogLevel.DEBUG]: 0,
      [LogLevel.INFO]: 0,
      [LogLevel.WARN]: 0,
      [LogLevel.ERROR]: 0,
      [LogLevel.FATAL]: 0
    };

    const byCategory: Record<string, number> = {};
    let errorCount = 0;

    this.entries.forEach(entry => {
      byLevel[entry.level]++;
      byCategory[entry.category] = (byCategory[entry.category] || 0) + 1;
      if (entry.level >= LogLevel.ERROR) {
        errorCount++;
      }
    });

    this.metricsCache = {
      totalLogs: this.entries.length,
      byLevel,
      byCategory,
      errorRate: this.entries.length > 0 ? (errorCount / this.entries.length) * 100 : 0,
      averageLogsPerMinute: entriesInLastMinute.length,
      sessionDuration: sessionDuration / 1000, // in seconds
      lastActivity: this.entries.length > 0 ? this.entries[this.entries.length - 1].timestamp : this.startTime
    };

    // Cache for 1 minute
    this.metricsCacheExpiry = Date.now() + 60000;

    return this.metricsCache;
  }

  /**
   * Export logs
   */
  export(format: 'json' | 'csv' | 'txt' = 'json', filter?: Parameters<typeof this.getEntries>[0]): string {
    const entries = this.getEntries(filter);

    switch (format) {
      case 'json':
        return JSON.stringify(entries, null, 2);
      
      case 'csv':
        const headers = ['timestamp', 'level', 'category', 'message', 'userId', 'sessionId'];
        const csvRows = [headers.join(',')];
        
        entries.forEach(entry => {
          const row = [
            entry.timestamp.toISOString(),
            LogLevel[entry.level],
            entry.category,
            `"${entry.message.replace(/"/g, '""')}"`,
            entry.userId || '',
            entry.sessionId
          ];
          csvRows.push(row.join(','));
        });
        
        return csvRows.join('\n');
      
      case 'txt':
        return entries.map(entry => this.config.formatters.console(entry)).join('\n');
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Clear all logs
   */
  clear(): void {
    this.entries = [];
    this.metricsCache = null;
    
    if (this.config.enableStorage) {
      localStorage.removeItem(`logger_entries_${this.sessionId}`);
    }
  }

  /**
   * Set log level
   */
  setLevel(level: LogLevel): void {
    this.config.level = level;
    this.info(`Log level changed to ${LogLevel[level]}`, { level }, 'system');
  }

  /**
   * Add filter
   */
  addFilter(filter: (entry: LogEntry) => boolean): void {
    this.config.filters.push(filter);
  }

  /**
   * Remove filter
   */
  removeFilter(filter: (entry: LogEntry) => boolean): void {
    const index = this.config.filters.indexOf(filter);
    if (index > -1) {
      this.config.filters.splice(index, 1);
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
    this.info('Logger configuration updated', config, 'system');
  }

  /**
   * Apply filters to log entry
   */
  private applyFilters(entry: LogEntry): boolean {
    return this.config.filters.every(filter => {
      try {
        return filter(entry);
      } catch (error) {
        // If filter throws, allow the log through
        console.warn('Logger filter error:', error);
        return true;
      }
    });
  }

  /**
   * Output to console
   */
  private outputToConsole(entry: LogEntry): void {
    const formatted = this.config.formatters.console(entry);
    
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(formatted);
        break;
      case LogLevel.INFO:
        console.info(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(formatted);
        break;
    }
  }

  /**
   * Store entry locally
   */
  private storeEntry(entry: LogEntry): void {
    try {
      const key = `logger_entries_${this.sessionId}`;
      const stored = localStorage.getItem(key);
      let entries: LogEntry[] = stored ? JSON.parse(stored) : [];
      
      entries.push(entry);
      
      // Maintain storage limit
      if (entries.length > this.config.maxStorageEntries) {
        entries = entries.slice(-this.config.maxStorageEntries);
      }
      
      localStorage.setItem(key, JSON.stringify(entries));
    } catch (error) {
      console.warn('Failed to store log entry:', error);
    }
  }

  /**
   * Send to remote endpoint
   */
  private async sendToRemote(entry: LogEntry): Promise<void> {
    try {
      if (!this.config.remoteEndpoint) return;

      const payload = this.config.formatters.remote(entry);
      
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.warn('Failed to send log to remote endpoint:', error);
    }
  }

  /**
   * Load stored logs
   */
  private loadStoredLogs(): void {
    try {
      if (!this.config.enableStorage) return;

      const key = `logger_entries_${this.sessionId}`;
      const stored = localStorage.getItem(key);
      
      if (stored) {
        const entries: LogEntry[] = JSON.parse(stored);
        this.entries = entries.map(entry => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }));
      }
    } catch (error) {
      console.warn('Failed to load stored logs:', error);
    }
  }

  /**
   * Default console formatter
   */
  private defaultConsoleFormatter(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const level = LogLevel[entry.level].padEnd(5);
    const category = entry.category.padEnd(10);
    
    let formatted = `[${timestamp}] ${level} [${category}] ${entry.message}`;
    
    if (entry.userId) {
      formatted += ` (User: ${entry.userId})`;
    }
    
    if (entry.data) {
      formatted += `\nData: ${JSON.stringify(entry.data, null, 2)}`;
    }
    
    if (entry.performance) {
      formatted += `\nPerformance: ${entry.performance.duration?.toFixed(2)}ms`;
      if (entry.performance.memory) {
        formatted += `, Memory: ${entry.performance.memory}KB`;
      }
    }
    
    return formatted;
  }

  /**
   * Default storage formatter
   */
  private defaultStorageFormatter(entry: LogEntry): string {
    return JSON.stringify(entry);
  }

  /**
   * Default remote formatter
   */
  private defaultRemoteFormatter(entry: LogEntry): any {
    return {
      ...entry,
      environment: 'browser',
      userAgent: navigator.userAgent,
      url: window.location.href
    };
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate log ID
   */
  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get source information
   */
  private getSource(): string {
    try {
      const stack = new Error().stack;
      if (stack) {
        const lines = stack.split('\n');
        // Find the first line that's not in this file
        for (let i = 3; i < lines.length; i++) {
          const line = lines[i];
          if (line && !line.includes('logger.ts') && !line.includes('Logger')) {
            const match = line.match(/at\s+(.+)\s+\((.+):(\d+):(\d+)\)/);
            if (match) {
              return `${match[1]} (${match[2].split('/').pop()}:${match[3]})`;
            }
          }
        }
      }
      return 'unknown';
    } catch {
      return 'unknown';
    }
  }

  /**
   * Get memory usage
   */
  private getMemoryUsage(): number {
    try {
      // @ts-ignore - performance.memory is not in all browsers
      if (performance.memory) {
        // @ts-ignore
        return Math.round(performance.memory.usedJSHeapSize / 1024);
      }
      return 0;
    } catch {
      return 0;
    }
  }
}

// Utility functions
export const LoggerUtils = {
  /**
   * Create logger with TypeScript-specific configuration
   */
  createTypeScriptLogger(): Logger {
    return new Logger({
      categories: ['typescript', 'compilation', 'editor', 'playground', 'quiz', 'user', 'performance', 'error'],
      filters: [
        // Filter out debug logs in production
        (entry) => process.env.NODE_ENV === 'development' || entry.level >= LogLevel.INFO,
        
        // Filter out noisy categories in production
        (entry) => process.env.NODE_ENV === 'development' || entry.category !== 'editor'
      ]
    });
  },

  /**
   * Format log level for display
   */
  formatLogLevel(level: LogLevel): string {
    const colors = {
      [LogLevel.DEBUG]: 'text-gray-500',
      [LogLevel.INFO]: 'text-blue-600',
      [LogLevel.WARN]: 'text-yellow-600',
      [LogLevel.ERROR]: 'text-red-600',
      [LogLevel.FATAL]: 'text-red-800 font-bold'
    };

    return colors[level] || 'text-gray-600';
  },

  /**
   * Get log level from string
   */
  parseLogLevel(level: string): LogLevel {
    const upperLevel = level.toUpperCase();
    return LogLevel[upperLevel as keyof typeof LogLevel] ?? LogLevel.INFO;
  },

  /**
   * Create filter for specific user
   */
  createUserFilter(userId: string): (entry: LogEntry) => boolean {
    return (entry) => entry.userId === userId;
  },

  /**
   * Create filter for time range
   */
  createTimeRangeFilter(startDate: Date, endDate: Date): (entry: LogEntry) => boolean {
    return (entry) => entry.timestamp >= startDate && entry.timestamp <= endDate;
  },

  /**
   * Create filter for error tracking
   */
  createErrorFilter(): (entry: LogEntry) => boolean {
    return (entry) => entry.level >= LogLevel.ERROR;
  }
};

// Create and export default logger instance
export const logger = LoggerUtils.createTypeScriptLogger();

// Export Logger class as default
export default Logger;