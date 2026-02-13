/**
 * Lightweight logging system with configurable levels
 */

export type LogLevel = "debug" | "info" | "warn" | "error" | "none";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  none: 4,
};

// Default to 'info' in production, 'debug' in development
const DEFAULT_LEVEL: LogLevel = import.meta.env?.MODE === "development" ? "debug" : "info";

let currentLevel: LogLevel = DEFAULT_LEVEL;

// Color styling for browser console
const STYLES = {
  debug: "color: #6b7280; font-weight: normal;",
  info: "color: #2563eb; font-weight: normal;",
  warn: "color: #d97706; font-weight: bold;",
  error: "color: #dc2626; font-weight: bold;",
};

const PREFIXES = {
  debug: "🔍",
  info: "ℹ️",
  warn: "⚠️",
  error: "❌",
};

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

function formatMessage(
  level: Exclude<LogLevel, "none">,
  context: string,
  message: string
): string[] {
  const timestamp = new Date().toLocaleTimeString();
  return [`%c${PREFIXES[level]} [${timestamp}] [${context}] ${message}`, STYLES[level]];
}

export const logger = {
  /**
   * Set the minimum log level
   */
  setLevel(level: LogLevel): void {
    currentLevel = level;
    console.info(`Logger level set to: ${level}`);
  },

  /**
   * Get the current log level
   */
  getLevel(): LogLevel {
    return currentLevel;
  },

  /**
   * Debug level - verbose information for development
   */
  debug(context: string, message: string, ...args: unknown[]): void {
    if (shouldLog("debug")) {
      console.debug(...formatMessage("debug", context, message), ...args);
    }
  },

  /**
   * Info level - general operational information
   */
  info(context: string, message: string, ...args: unknown[]): void {
    if (shouldLog("info")) {
      console.info(...formatMessage("info", context, message), ...args);
    }
  },

  /**
   * Warn level - potentially problematic situations
   */
  warn(context: string, message: string, ...args: unknown[]): void {
    if (shouldLog("warn")) {
      console.warn(...formatMessage("warn", context, message), ...args);
    }
  },

  /**
   * Error level - errors that need attention
   */
  error(context: string, message: string, ...args: unknown[]): void {
    if (shouldLog("error")) {
      console.error(...formatMessage("error", context, message), ...args);
    }
  },

  /**
   * Create a scoped logger for a specific module
   */
  scope(context: string) {
    return {
      debug: (message: string, ...args: unknown[]) => logger.debug(context, message, ...args),
      info: (message: string, ...args: unknown[]) => logger.info(context, message, ...args),
      warn: (message: string, ...args: unknown[]) => logger.warn(context, message, ...args),
      error: (message: string, ...args: unknown[]) => logger.error(context, message, ...args),
    };
  },
};

// Expose logger on window only in development for interactive debugging
if (typeof window !== "undefined" && import.meta.env?.MODE === "development") {
  (window as unknown as { logger: typeof logger }).logger = logger;
}
