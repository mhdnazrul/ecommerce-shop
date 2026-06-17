type LogLevel = 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, unknown>
  error?: { name?: string; message?: string; stack?: string }
}

function log(level: LogLevel, message: string, context?: Record<string, unknown>, err?: unknown) {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    context,
    error: err instanceof Error ? { name: err.name, message: err.message, stack: process.env.NODE_ENV === 'development' ? err.stack : undefined } : undefined,
  }
  const prefix = `[${entry.timestamp}] [${level.toUpperCase()}]`
  if (level === 'error') {
    console.error(prefix, message, entry.context ?? '', entry.error ?? '')
  } else if (level === 'warn') {
    console.warn(prefix, message, entry.context ?? '')
  } else {
    console.log(prefix, message, entry.context ?? '')
  }
}

export const logger = {
  info: (message: string, context?: Record<string, unknown>) => log('info', message, context),
  warn: (message: string, context?: Record<string, unknown>) => log('warn', message, context),
  error: (message: string, context?: Record<string, unknown>, err?: unknown) => log('error', message, context, err),
}
