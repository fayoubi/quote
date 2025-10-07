export class ApiError extends Error {
    constructor(statusCode, message, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
export const errorHandler = (err, _req, res, _next) => {
    const { statusCode = 500, message } = err;
    console.error(`Error ${statusCode}: ${message}`);
    if (err.stack) {
        console.error(err.stack);
    }
    const isDevelopment = process.env.NODE_ENV === 'development';
    const errorMessage = err.isOperational || isDevelopment ? message : 'Internal server error';
    res.status(statusCode).json({
        error: errorMessage,
        ...(isDevelopment && { stack: err.stack })
    });
};
export const notFoundHandler = (req, res) => {
    res.status(404).json({
        error: 'Not found',
        message: `Route ${req.originalUrl} not found`
    });
};
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
//# sourceMappingURL=errorHandler.js.map