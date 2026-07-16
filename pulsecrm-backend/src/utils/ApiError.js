/**
 * A plain Error subclass that carries an HTTP status code. Services throw
 * these for expected business errors (not found, conflict, forbidden,
 * etc.) so controllers can stay thin: `res.status(err.statusCode || 400)`.
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ApiError";
  }
}

module.exports = ApiError;
