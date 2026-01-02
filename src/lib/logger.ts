/**
 * Structured Logging Utility
 * Phase 1.12 - Production Observability
 * 
 * Replaces console.log with structured logging for better debugging
 * Features: Log levels, metadata, JSON formatting, environment-aware
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogMetadata {
  [key: string]: any;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  metadata?: LogMetadata;
  environment: string;
  requestId?: string;
}

/**
 * Format log entry as JSON string for production
 * Human-readable for development
 */
function formatLog(entry: LogEntry): string {
  if (process.env.NODE_ENV === 'production') {
    return JSON.stringify(entry);
  }

  // Development: colorized output
  const colors = {
    debug: '\x1b[36m', // Cyan
    info: '\x1b[32m',  // Green
    warn: '\x1b[33m',  // Yellow
    error: '\x1b[31m', // Red
    reset: '\x1b[0m',
  };

  const color = colors[entry.level] || colors.reset;
  const timestamp = new Date(entry.timestamp).toLocaleTimeString();
  const level = entry.level.toUpperCase().padEnd(5);
  
  let output = `${color}[${timestamp}] ${level}${colors.reset} ${entry.message}`;

  if (entry.metadata && Object.keys(entry.metadata).length > 0) {
    output += `\n${JSON.stringify(entry.metadata, null, 2)}`;
  }

  return output;
}

/**
 * Internal logging function
 */
function log(level: LogLevel, message: string, metadata?: LogMetadata): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    metadata,
    environment: process.env.NODE_ENV || 'development',
  };

  const formatted = formatLog(entry);

  // Output to appropriate stream
  if (level === 'error') {
    console.error(formatted);
  } else {
    console.log(formatted);
  }
}

/**
 * Logger instance with convenience methods
 */
export const logger = {
  /**
   * Debug: Detailed information for diagnosing problems
   * Only logged in development
   */
  debug: (message: string, metadata?: LogMetadata) => {
    if (process.env.NODE_ENV === 'development') {
      log('debug', message, metadata);
    }
  },

  /**
   * Info: General informational messages
   * Example: User logged in, Payment processed
   */
  info: (message: string, metadata?: LogMetadata) => {
    log('info', message, metadata);
  },

  /**
   * Warn: Warning messages for potentially harmful situations
   * Example: Rate limit approaching, Slow database query
   */
  warn: (message: string, metadata?: LogMetadata) => {
    log('warn', message, metadata);
  },

  /**
   * Error: Error events that might still allow the application to continue
   * Example: Failed to send email, Payment failed
   */
  error: (message: string, metadata?: LogMetadata) => {
    log('error', message, metadata);
  },

  /**
   * HTTP request logging
   */
  http: (method: string, url: string, metadata?: LogMetadata) => {
    log('info', `${method} ${url}`, {
      type: 'http',
      ...metadata,
    });
  },

  /**
   * Database query logging
   */
  db: (query: string, metadata?: LogMetadata) => {
    if (process.env.NODE_ENV === 'development') {
      log('debug', `DB Query: ${query}`, metadata);
    }
  },

  /**
   * Payment logging (sensitive data - mask in production)
   */
  payment: (action: string, metadata?: LogMetadata) => {
    // Mask sensitive data in production
    const safeMeta = { ...metadata };
    if (process.env.NODE_ENV === 'production') {
      if (safeMeta.cardNumber) safeMeta.cardNumber = '****';
      if (safeMeta.cvv) safeMeta.cvv = '***';
      if (safeMeta.email) safeMeta.email = maskEmail(safeMeta.email);
    }

    log('info', `Payment: ${action}`, {
      type: 'payment',
      ...safeMeta,
    });
  },

  /**
   * Authentication logging
   */
  auth: (action: string, metadata?: LogMetadata) => {
    // Mask sensitive data
    const safeMeta = { ...metadata };
    if (safeMeta.password) safeMeta.password = '***';
    if (safeMeta.token) safeMeta.token = '***';

    log('info', `Auth: ${action}`, {
      type: 'auth',
      ...safeMeta,
    });
  },
};

/**
 * Mask email address for privacy
 * example@domain.com → e*****e@domain.com
 */
function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}@${domain}`;
}

/**
 * Express/Next.js middleware for request logging
 */
export function logRequest(
  method: string,
  url: string,
  statusCode: number,
  duration: number,
  metadata?: LogMetadata
): void {
  const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
  
  log(level, `${method} ${url} ${statusCode}`, {
    type: 'http',
    method,
    url,
    statusCode,
    duration: `${duration}ms`,
    ...metadata,
  });
}

/**
 * Error logging with stack trace
 */
export function logError(error: Error | unknown, context?: string, metadata?: LogMetadata): void {
  if (error instanceof Error) {
    log('error', context ? `${context}: ${error.message}` : error.message, {
      name: error.name,
      stack: error.stack,
      ...metadata,
    });
  } else {
    log('error', context ? `${context}: ${String(error)}` : String(error), metadata);
  }
}

// Export types and utilities
export default logger;
