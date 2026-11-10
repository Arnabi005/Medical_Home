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

  // Handle MongoDB / Mongoose Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {}).join(', ') || 'field';
    message = `Duplicate value violation: A record with this ${field} already exists.`;
  }

  // Handle Mongoose Validation Errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    details = Object.values(err.errors || {}).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for field '${err.path}': ${err.value}`;
  }

  // Handle Prisma Known Request Errors (Preserved for backwards compatibility)
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
    status: statusCode >= 500 ? 'error' : 'fail',
    message,
  };

  if (details) {
    response.details = details;
  }

  // Log server-side errors without leaking stack traces to clients
  if (statusCode >= 500) {
    console.error(`[Server Error ${statusCode}] ${message}:`, err.stack || err);
  }

  res.status(statusCode).json(response);
}
