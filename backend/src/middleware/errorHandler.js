/**
 * Standard Application Error Class with HTTP status code and operational flag.
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 404 Route Not Found Middleware
 */
export function notFoundHandler(req, res, next) {
  next(new AppError(`Endpoint not found - ${req.method} ${req.originalUrl}`, 404));
}

/**
 * Centralized Error Handling Middleware
 */
export function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let details = err.details || null;

  // Handle Prisma Known Request Errors
  if (err.code === 'P2002') {
    statusCode = 409;
    const target = err.meta?.target ? err.meta.target.join(', ') : 'field';
    message = `Duplicate value violation: A record with this ${target} already exists.`;
  } else if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Requested record was not found.';
  }

  // Handle JSON parsing errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Malformed JSON request body.';
  }

  const response = {
    success: false,
    status: err.status || (statusCode >= 500 ? 'error' : 'fail'),
    message,
  };

  if (details) {
    response.details = details;
  }

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

