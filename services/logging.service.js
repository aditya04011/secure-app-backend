import winston from "winston";
import path from "path";
import fs from "fs";
import DailyRotateFile from "winston-daily-rotate-file";
import { get, parse } from 'stack-trace'; // Corrected import
import { asyncLocalStorage } from "../utils/asyncLocalStorage.js";
import chalk from "chalk";

const { combine, timestamp, printf, colorize, align } = winston.format;

const injectUserContext = winston.format((info) => {
  const context = asyncLocalStorage.getStore();
  if (context) {
    info.userId = context.userId;
  }
  return info;
});


class LoggingService {
  constructor() {
    this.logLevels = {
      error: 0,
      warn: 1,
      info: 2,
      http: 3,
      debug: 4,
    };

    this.LOG_LEVEL = process.env.LOG_LEVEL || "info";
    this.logsDir = path.join(process.cwd(), "logs");

    // Ensure logs directory exists
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }

    this.initializeLogger();
    this.setupProcessHandlers();
  }

  // GREATLY SIMPLIFIED sanitizeObject
  sanitizeObject(obj) {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj !== "object") {
      return obj;
    }

    if (obj instanceof Date) {
      return obj.toISOString();
    }

    if (obj instanceof Error) {
      return {
        message: obj.message,
        name: obj.name,
        stack: obj.stack,
      };
    }
    // Handle Arrays
    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item));
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === "function") {
        continue; // Skip functions
      }
      try {
        sanitized[key] = this.sanitizeObject(value);
      } catch (e) {
        sanitized[key] = "[Error serializing value]";
      }
    }
    return sanitized;
  }

  // Safer metadata formatting
  formatMetadata(meta, indent = false) {
    try {
      const sanitizedMeta = this.sanitizeObject(meta);
      return JSON.stringify(sanitizedMeta, null, indent ? 2 : 0); // Add indentation option
    } catch (err) {
      return `[Error formatting metadata: ${err.message}]`;
    }
  }

  createLogFormat() {
    return combine(
      injectUserContext(),
      winston.format.json(),
      colorize(),
      timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
      align(),
      printf((info) => {
        const {
          timestamp,
          level,
          message,
          module,
          method,
          path,
          status,
          stack,
          duration,
          userId,
          ...meta
        } = info;

        let logMessage = `[${timestamp}] ${level}: ${message}`;

        // Add standard fields if present
        const fields = {
          Module: module,
          Method: method,
          Path: path,
          Status: status,
          Duration: duration,
          UserId: userId,
        };

        Object.entries(fields).forEach(([key, value]) => {
          if (value !== undefined) {
            logMessage += ` | ${key}: ${value}`;
          }
        });

        // Add stack trace for errors
        if (stack) {
          logMessage += `\nStack: ${stack}`;
        }

        // Handle metadata
        const metadataStr = this.formatMetadata(meta);
        if (metadataStr && metadataStr !== "{}") {
          logMessage += "\nMetadata: " + metadataStr;
        }

        return logMessage;
      })
    );
  }

  /*

  initializeLogger() {
    const fileRotateTransport = new DailyRotateFile({
      filename: path.join(this.logsDir, "combined-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxFiles: "14d",
      level: "debug", // Always log everything to file
    });

    const errorRotateTransport = new DailyRotateFile({
      filename: path.join(this.logsDir, "error-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxFiles: "14d",
      level: "error",
    });

    // NEW: Dedicated transport for client errors
    const clientErrorFilter = winston.format((info) => {
      return info.type === "Client Error" ? info : false;
    });

    // Dedicated transport for client info logs
    const clientInfoFilter = winston.format((info) => {
      return info.type === "Client Info" ? info : false;
    });

    const clientErrorTransport = new DailyRotateFile({
      filename: path.join(this.logsDir, "client-error-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxFiles: "14d",
      level: "error",
      format: combine(clientErrorFilter(), this.createLogFormat()),
    });
    const clientInfoTransport = new DailyRotateFile({
      filename: path.join(this.logsDir, "client-info-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxFiles: "14d",
      level: "info",
      format: combine(clientInfoFilter(), this.createLogFormat()),
    });

    this.logger = winston.createLogger({
      levels: this.logLevels,
      level: this.LOG_LEVEL,
      format: this.createLogFormat(),
      transports: [
        fileRotateTransport,
        errorRotateTransport,
        clientErrorTransport,
        new winston.transports.Console({
          level: this.LOG_LEVEL,
          handleExceptions: true,
        }),
      ],
      exitOnError: false,
    });

    // Add clientInfoTransport to your transports array
    this.logger = winston.createLogger({
      levels: this.logLevels,
      level: this.LOG_LEVEL,
      format: this.createLogFormat(),
      transports: [
        fileRotateTransport,
        errorRotateTransport,
        clientErrorTransport,
        clientInfoTransport, // Add this
        new winston.transports.Console({
          level: this.LOG_LEVEL,
          handleExceptions: true,
        }),
      ],
      exitOnError: false,
    });
  }

  */

  initializeLogger() {
    const baseFormat = combine(
      injectUserContext(), 
      winston.format.json(),
      timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
      align(),
      printf((info) => {
        const {
          timestamp,
          level,
          message,
          module,
          source,
          logType,
          method,
          path,
          status,
          stack,
          duration,
          userId,
          ...meta
        } = info;
  
        let logMessage = `[${timestamp}] [${logType || "server"}] ${level} : ${message}`;
  
        const fields = { Module: module,source:source, Method: method,Stack: stack, Path: path, Status: status, Duration: duration, UserId: userId };
        Object.entries(fields).forEach(([key, value]) => {
          if (value !== undefined) {
            if (key === "UserId") {
              logMessage += ` | \n[${key}: ${chalk.bold.green(value)}]}`;
            } else if (key === "Stack") {
              logMessage += ` |[ ${key}: ${value}]`;
            } else {
              logMessage += ` | ${key}: ${value}`;
            }
          }
        });
  
        // if (stack) logMessage += `\nStack: ${stack}`;
  
        // Check if JSON formatting is requested
        const shouldFormatAsJson = meta._formatAsJson;
        delete meta._formatAsJson; // Remove the flag from metadata
        
        const metadataStr = this.formatMetadata(meta, shouldFormatAsJson);
        if (metadataStr && metadataStr !== "{}") logMessage += `\nMetadata: ${metadataStr}`;
  
        return logMessage;
      })
    );
  
    const consoleFormat = combine(colorize(), baseFormat);
    const fileFormat = baseFormat;
  
    const fileRotateTransport = new DailyRotateFile({
      filename: path.join(this.logsDir, "combined-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxFiles: "14d",
      level: "debug",
      format: fileFormat
    });
  
    // const errorRotateTransport = new DailyRotateFile({
    //   filename: path.join(this.logsDir, "error-%DATE%.log"),
    //   datePattern: "YYYY-MM-DD",
    //   maxFiles: "14d",
    //   level: "error",
    //   format: fileFormat
    // });

    const jsonLogTransport = new DailyRotateFile({
      filename: path.join(this.logsDir, "structured-%DATE%.json"),
      datePattern: "YYYY-MM-DD",
      maxFiles: "14d",
      level: "debug",
      format: combine(
        injectUserContext(),
        timestamp(),
        winston.format.json()
      ),
    });

  
    const clientErrorFilter = winston.format((info) => {
      return info.type === "Client Error" ? info : false;
    });
  
    // const clientErrorTransport = new DailyRotateFile({
    //   filename: path.join(this.logsDir, "client-error-%DATE%.log"),
    //   datePattern: "YYYY-MM-DD",
    //   maxFiles: "14d",
    //   level: "error",
    //   format: combine(clientErrorFilter(), fileFormat)
    // });
  
    this.logger = winston.createLogger({
      levels: this.logLevels,
      level: this.LOG_LEVEL,
      transports: [
        fileRotateTransport,
        // errorRotateTransport,
        // clientErrorTransport,
        jsonLogTransport,
        new winston.transports.Console({
          level: this.LOG_LEVEL,
          handleExceptions: true,
          format: consoleFormat
        })
      ],
      exitOnError: false
    });
  }
  
  setupProcessHandlers() {
     process.on("uncaughtException", (err) => {
      const trace = get(err); // Capture stack trace
      this.logger.error("Uncaught Exception", {
        message: err.message,
        stack: trace,  // Log the stack trace
        module: "Process",
      });
      process.exit(1);
    });


    process.on("unhandledRejection", (reason, promise) => {
      this.logger.error("Unhandled Rejection", {
        reason: reason,
        module: "Process",
      });
    });

    process.on("exit", () => {
      this.logger.info("Process Exit", { module: "Process" });
      this.logger.end();
    });
  }
 detectContext() {
  const trace = get();
  let fileInfo = "unknown:0";

  for (const frame of trace) {
    const fileName = frame.getFileName();
    if (fileName && !fileName.includes("logging.service.js")) {
      const baseName = path.basename(fileName);
      const lineNumber = frame.getLineNumber();
      fileInfo = `${baseName}:${lineNumber}`;
      break;
    }
  }

  return { fileInfo };
}
  getModuleLogger(moduleName, sourceFileName,logType="server",clientStack) {
    return {
      error: (message, meta = {}) => {
        const { fileInfo } = this.detectContext()
        this.logger.error(message, { ...meta, logType:logType, module: moduleName, source:sourceFileName, stack: clientStack || fileInfo });
      },
      warn: (message, meta = {}) => {
        const { fileInfo } = this.detectContext()
        this.logger.warn(message, { ...meta, logType:logType, module: moduleName, source:sourceFileName, stack: clientStack || fileInfo });
      },
      info: (message, meta = {}) => {
        const { fileInfo } = this.detectContext()
        this.logger.info(message, { ...meta, logType:logType, module: moduleName, source:sourceFileName, stack: clientStack || fileInfo });
      },
      http: (message, meta = {}) => {
        const { fileInfo } = this.detectContext()
        this.logger.http(message, { ...meta, logType:logType, module: moduleName, source:sourceFileName, stack: clientStack || fileInfo });
      },
      debug: (message, meta = {}) => {
        const { fileInfo } = this.detectContext()
        this.logger.debug(message, { ...meta, logType:logType, module: moduleName, source:sourceFileName, stack: clientStack || fileInfo });
      },
      // New method for JSON formatted logging
      debugJson: (message, data) => {
        const { fileInfo } = this.detectContext()
        this.logger.debug(message, { ...data, logType:logType, module: moduleName, source:sourceFileName, stack: clientStack || fileInfo, _formatAsJson: true });
      },
      infoJson: (message, data) => {
        const { fileInfo } = this.detectContext()
        this.logger.info(message, { ...data, logType:logType, module: moduleName, source:sourceFileName, stack: clientStack || fileInfo, _formatAsJson: true });
      },
      errorJson: (message, data) => {
        const { fileInfo } = this.detectContext()
        this.logger.error(message, { ...data, logType:logType, module: moduleName, source:sourceFileName, stack: clientStack || fileInfo, _formatAsJson: true });
      }
    };
  }

  // Request logging middleware
  requestLogger() {
    return (req, res, next) => {
      const start = Date.now();

      res.on("finish", () => {
        const duration = Date.now() - start;
        this.logger.http("HTTP Request", {
          module: "HTTP",
          method: req.method,
          path: req.path,
          status: res.statusCode,
          duration: `${duration}ms`,
          userId: req && req.user ? req.user._id : undefined,
        });
      });

      next();
    };
  }
}

// Create and export a singleton instance
const loggingService = new LoggingService();
export default loggingService;
