export var LogLevel;
(function (LogLevel) {
    LogLevel["ERROR"] = "error";
    LogLevel["WARN"] = "warn";
    LogLevel["INFO"] = "info";
    LogLevel["DEBUG"] = "debug";
})(LogLevel || (LogLevel = {}));
export class Logger {
    constructor(service = 'pricing-service') {
        this.service = service;
        this.minLevel = this.getLogLevel();
    }
    getLogLevel() {
        const level = process.env.LOG_LEVEL?.toLowerCase();
        switch (level) {
            case 'debug':
                return LogLevel.DEBUG;
            case 'info':
                return LogLevel.INFO;
            case 'warn':
                return LogLevel.WARN;
            case 'error':
                return LogLevel.ERROR;
            default:
                return process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG;
        }
    }
    shouldLog(level) {
        const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
        return levels.indexOf(level) <= levels.indexOf(this.minLevel);
    }
    formatLog(entry) {
        if (process.env.NODE_ENV === 'production') {
            return JSON.stringify(entry);
        }
        else {
            const timestamp = entry.timestamp;
            const level = entry.level.toUpperCase().padEnd(5);
            const message = entry.message;
            const metadata = entry.metadata ? ` ${JSON.stringify(entry.metadata)}` : '';
            const requestId = entry.requestId ? ` [${entry.requestId}]` : '';
            return `${timestamp} ${level} [${entry.service}]${requestId} ${message}${metadata}`;
        }
    }
    log(level, message, metadata, requestId) {
        if (!this.shouldLog(level)) {
            return;
        }
        const entry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            service: this.service,
            ...(metadata && { metadata }),
            ...(requestId && { requestId })
        };
        const formatted = this.formatLog(entry);
        if (level === LogLevel.ERROR) {
            console.error(formatted);
        }
        else {
            console.log(formatted);
        }
    }
    error(message, metadata, requestId) {
        this.log(LogLevel.ERROR, message, metadata, requestId);
    }
    warn(message, metadata, requestId) {
        this.log(LogLevel.WARN, message, metadata, requestId);
    }
    info(message, metadata, requestId) {
        this.log(LogLevel.INFO, message, metadata, requestId);
    }
    debug(message, metadata, requestId) {
        this.log(LogLevel.DEBUG, message, metadata, requestId);
    }
    logQuoteRequest(productType, requestId, metadata) {
        this.info(`Quote request received for ${productType}`, {
            productType,
            ...metadata
        }, requestId);
    }
    logQuoteResponse(quoteId, productType, requestId, success) {
        const message = success
            ? `Quote generated successfully: ${quoteId}`
            : `Quote generation failed`;
        this.info(message, {
            quoteId,
            productType,
            success
        }, requestId);
    }
    logError(error, context, requestId) {
        this.error(`${context ? `${context}: ` : ''}${error.message}`, {
            error: error.name,
            stack: error.stack,
            context
        }, requestId);
    }
    logPerformance(operation, duration, requestId) {
        this.debug(`Performance: ${operation} completed in ${duration}ms`, {
            operation,
            duration,
            slow: duration > 1000
        }, requestId);
    }
    logDatabaseOperation(operation, table, duration, requestId) {
        this.debug(`Database: ${operation} on ${table}`, {
            operation,
            table,
            duration
        }, requestId);
    }
    logCacheOperation(operation, key, requestId) {
        this.debug(`Cache: ${operation} for key ${key}`, {
            operation,
            key
        }, requestId);
    }
}
export const logger = new Logger();
//# sourceMappingURL=logger.js.map