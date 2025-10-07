export declare enum LogLevel {
    ERROR = "error",
    WARN = "warn",
    INFO = "info",
    DEBUG = "debug"
}
export declare class Logger {
    private service;
    private minLevel;
    constructor(service?: string);
    private getLogLevel;
    private shouldLog;
    private formatLog;
    private log;
    error(message: string, metadata?: Record<string, any>, requestId?: string): void;
    warn(message: string, metadata?: Record<string, any>, requestId?: string): void;
    info(message: string, metadata?: Record<string, any>, requestId?: string): void;
    debug(message: string, metadata?: Record<string, any>, requestId?: string): void;
    logQuoteRequest(productType: string, requestId: string, metadata?: Record<string, any>): void;
    logQuoteResponse(quoteId: string, productType: string, requestId: string, success: boolean): void;
    logError(error: Error, context?: string, requestId?: string): void;
    logPerformance(operation: string, duration: number, requestId?: string): void;
    logDatabaseOperation(operation: string, table: string, duration: number, requestId?: string): void;
    logCacheOperation(operation: 'hit' | 'miss' | 'set', key: string, requestId?: string): void;
}
export declare const logger: Logger;
//# sourceMappingURL=logger.d.ts.map