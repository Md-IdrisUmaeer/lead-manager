const AppError = require('../utils/AppError');

// 404 for unknown routes
function notFound(req, res, next) {
  next(new AppError(404, `Route ${req.method} ${req.originalUrl} not found`));
}

// Central error handler: every error ends up here, so responses
// always have the same shape: { error, details? }
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Errors we threw on purpose
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message, details: err.details });
  }

  // Mongoose schema validation failed
  if (err.name === 'ValidationError') {
    const details = {};
    for (const [field, e] of Object.entries(err.errors)) details[field] = e.message;
    return res.status(400).json({ error: 'Validation failed', details });
  }

  // Malformed ObjectId in params, e.g. /api/leads/abc
  if (err.name === 'CastError') {
    return res.status(400).json({ error: `Invalid ${err.path}` });
  }

  // Unique index violation
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'value';
    const label = field.charAt(0).toUpperCase() + field.slice(1);
    const message = `${label} already exists`;
    // details lets the client show the message next to the right input
    return res.status(409).json({ error: message, details: { [field]: message } });
  }

  // Bad JSON body
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Malformed JSON body' });
  }

  // Anything else: log the real error, send a generic message
  console.error(err);
  return res.status(500).json({ error: 'Something went wrong' });
}

module.exports = { notFound, errorHandler };
