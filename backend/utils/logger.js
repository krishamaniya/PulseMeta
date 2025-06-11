const winston = require('winston');
const { combine, timestamp, printf, colorize, align, errors } = winston.format;
const path = require('path');

// Custom format for console logging
const consoleFormat = printf(({ level, message, timestamp, stack }) => {
  const log = `${timestamp} [${level}]: ${stack || message}`;
  return log;
});

// Custom format for file logging
const fileFormat = printf(({ level, message, timestamp, stack }) => {
  const log = `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
  return log;
});

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: { service: 'trading-system' },
  format: combine(
    errors({ stack: true }), // Include stack traces for errors
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss.SSS'
    })
  ),
  transports: [
    // Console transport (colorized)
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        align(),
        consoleFormat
      )
    }),
    // Error log file transport
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Combined log file transport
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/combined.log'),
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/exceptions.log')
    })
  ]
});

// Add Morgan-like HTTP request logging
logger.httpStream = {
  write: (message) => {
    logger.http(message.trim());
  }
};

// Custom validation logging methods
logger.validation = {
  success: (validationType, data) => {
    logger.debug(`Validation success (${validationType}): ${JSON.stringify(data)}`);
  },
  failure: (validationType, data, reason) => {
    logger.warn(`Validation failed (${validationType}): ${JSON.stringify(data)} - Reason: ${reason}`);
  }
};

// Proxy console methods to winston
console.log = (...args) => logger.info(...args);
console.info = (...args) => logger.info(...args);
console.warn = (...args) => logger.warn(...args);
console.error = (...args) => logger.error(...args);
console.debug = (...args) => logger.debug(...args);

module.exports = logger;