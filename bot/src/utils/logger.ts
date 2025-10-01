import winston from "winston";
import { config } from "../config/env";

/**
 * Winston logger configuration with structured logging.
 * Logs are formatted as JSON with timestamp, level, message, and metadata.
 */
const logger = winston.createLogger({
  level: config.logLevel,
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...metadata }) => {
          let msg = `${timestamp} [${level}]: ${message}`;
          
          // Add metadata if present
          if (Object.keys(metadata).length > 0) {
            msg += ` ${JSON.stringify(metadata)}`;
          }
          
          return msg;
        })
      ),
    }),
  ],
});

/**
 * Log levels:
 * - error: Errors that need investigation
 * - warn: Unexpected but handled situations
 * - info: Important business events
 * - debug: Detailed debugging information
 */
export default logger;
