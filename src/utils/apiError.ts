export class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  /**
   * Create an ApiError instance
   * @param message Human-readable error message
   * @param statusCode HTTP status code
   * @param isOperational True if the error is expected/operational
   * @param stack Optional stack trace
   */
  constructor(message: string, statusCode: number, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
