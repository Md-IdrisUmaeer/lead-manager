const express = require('express');
const cors = require('cors');

const { notFound, errorHandler } = require('./middleware/error.middleware');
const leadRoutes = require('./routes/lead.routes');

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
  })
);
app.use(express.json({ limit: '10kb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/leads', leadRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
