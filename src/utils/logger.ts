import { createLogger, format, transports, Logger } from 'winston';

const { combine, timestamp, printf } = format;

const logFormat = printf(({ timestamp, level, message }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

export const logger: Logger = createLogger({
  level: 'info',
  format: combine(timestamp(), logFormat),
  transports: [new transports.Console(), new transports.File({ filename: 'app.log' })],
});
