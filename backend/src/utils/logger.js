const winston = require('winston');

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';
const isTest = NODE_ENV === 'test';

const { combine, timestamp, errors, json, colorize, printf, splat } = winston.format;

/** Human-readable format for local development */
const prettyFormat = printf(({ level, message, timestamp: ts, stack, service, ...meta }) => {
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  const stackStr = stack ? `\n${stack}` : '';
  return `${ts} [${level}]: ${message}${metaStr}${stackStr}`;
});

const logger = winston.createLogger({
  level: isProduction ? 'info' : 'debug',
  defaultMeta: { service: 'nitj-resource-exchange' },
  format: combine(
    errors({ stack: true }),
    splat(),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  ),
  transports: [
    new winston.transports.Console({
      silent: isTest,
      format: isProduction
        ? combine(json())
        : combine(colorize({ all: true }), prettyFormat),
    }),
  ],
});

/**
 * Writable stream for Morgan HTTP request logging.
 * Usage: morgan('combined', { stream: logger.stream })
 */
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

module.exports = logger;
