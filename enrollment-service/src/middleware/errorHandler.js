class ApiError extends Error {
  constructor(statusCode, message, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  const { statusCode = 500, message } = err;

  // Log error
  console.error(`Error ${statusCode}: ${message}`);
  if (err.stack) {
    console.error(err.stack);
  }

  // Don't expose internal errors in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  const errorMessage = err.isOperational || isDevelopment ? message : 'Internal server error';

  res.status(statusCode).json({
    error: errorMessage,
    ...(isDevelopment && { stack: err.stack }),
  });
};

const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`,
  });
};

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export { ApiError, errorHandler, notFoundHandler, asyncHandler };