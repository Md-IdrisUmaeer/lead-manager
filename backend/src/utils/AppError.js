// Throw this from controllers/services for expected errors:
//   throw new AppError(404, 'Lead not found');
//   throw new AppError(400, 'Validation failed', { email: 'Invalid email' });
class AppError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

module.exports = AppError;
