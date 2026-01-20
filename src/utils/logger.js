const winston = require("winston");

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    // Console for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
    // File for production errors
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),
    // File for all logs
    new winston.transports.File({
      filename: "logs/combined.log",
    }),
  ],
});

// Morgan integration for HTTP logs
logger.stream = {
  write: (message) => logger.info(message.trim()),
};

module.exports = logger;
