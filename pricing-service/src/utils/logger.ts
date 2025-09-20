export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  service: string;
  metadata?: Record<string, any>;
  requestId?: string;
  userId?: string;
}

export class Logger {
  private service: string;
  private minLevel: LogLevel;

  constructor(service: string = 'pricing-service') {
    this.service = service;
    this.minLevel = this.getLogLevel();
  }

  private getLogLevel(): LogLevel {
    const level = process.env.LOG_LEVEL?.toLowerCase();
    switch (level) {
      case 'debug':
        return LogLevel.DEBUG;
      case 'info':
        return LogLevel.INFO;
      case 'warn':
        return LogLevel.WARN;
      case 'error':
        return LogLevel.ERROR;
      default:
        return process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
    return levels.indexOf(level) <= levels.indexOf(this.minLevel);
  }

  private formatLog(entry: LogEntry): string {
    if (process.env.NODE_ENV === 'production') {
      // JSON format for production (easier to parse)
      return JSON.stringify(entry);
    } else {
      // Human-readable format for development
      const timestamp = entry.timestamp;
      const level = entry.level.toUpperCase().padEnd(5);
      const message = entry.message;
      const metadata = entry.metadata ? ` ${JSON.stringify(entry.metadata)}` : '';
      const requestId = entry.requestId ? ` [${entry.requestId}]` : '';

      return `${timestamp} ${level} [${entry.service}]${requestId} ${message}${metadata}`;
    }
  }

  private log(level: LogLevel, message: string, metadata?: Record<string, any>, requestId?: string) {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.service,
      ...(metadata && { metadata }),
      ...(requestId && { requestId })
    };

    const formatted = this.formatLog(entry);

    // Output to appropriate stream
    if (level === LogLevel.ERROR) {
      console.error(formatted);
    } else {
      console.log(formatted);
    }
  }

  error(message: string, metadata?: Record<string, any>, requestId?: string) {
    this.log(LogLevel.ERROR, message, metadata, requestId);
  }

  warn(message: string, metadata?: Record<string, any>, requestId?: string) {
    this.log(LogLevel.WARN, message, metadata, requestId);
  }

  info(message: string, metadata?: Record<string, any>, requestId?: string) {
    this.log(LogLevel.INFO, message, metadata, requestId);
  }

  debug(message: string, metadata?: Record<string, any>, requestId?: string) {
    this.log(LogLevel.DEBUG, message, metadata, requestId);
  }

  // Specialized logging methods
  logQuoteRequest(productType: string, requestId: string, metadata?: Record<string, any>) {
    this.info(`Quote request received for ${productType}`, {
      productType,
      ...metadata
    }, requestId);
  }

  logQuoteResponse(quoteId: string, productType: string, requestId: string, success: boolean) {
    const message = success
      ? `Quote generated successfully: ${quoteId}`
      : `Quote generation failed`;

    this.info(message, {
      quoteId,
      productType,
      success
    }, requestId);
  }

  logError(error: Error, context?: string, requestId?: string) {
    this.error(`${context ? `${context}: ` : ''}${error.message}`, {
      error: error.name,
      stack: error.stack,
      context
    }, requestId);
  }

  logPerformance(operation: string, duration: number, requestId?: string) {
    this.debug(`Performance: ${operation} completed in ${duration}ms`, {
      operation,
      duration,
      slow: duration > 1000
    }, requestId);
  }

  logDatabaseOperation(operation: string, table: string, duration: number, requestId?: string) {
    this.debug(`Database: ${operation} on ${table}`, {
      operation,
      table,
      duration
    }, requestId);
  }

  logCacheOperation(operation: 'hit' | 'miss' | 'set', key: string, requestId?: string) {
    this.debug(`Cache: ${operation} for key ${key}`, {
      operation,
      key
    }, requestId);
  }
}

// Create default logger instance
export const logger = new Logger();