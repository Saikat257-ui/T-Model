import winston from 'winston';

const logger = winston.createLogger({
  level: 'info', // Always log info and above
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 't-model-platform' },
  transports: [
    // Always log to console in all environments
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

export { logger };