/**
 * Custom error class so controllers can throw errors with an explicit
 * HTTP status code, which the central error handler will respect.
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
