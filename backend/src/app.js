import express from 'express';
import cors from 'cors';
import { requestLogger } from './middleware/logger.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import apiRouter from './routes/index.js';

const app = express();

// CORS configuration for local development and authorized origins
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

// Private IP ranges for local network device access (e.g. testing from mobile phones)
const privateNetworkRegex = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/;

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (such as mobile apps, Postman, curl)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // In development, also permit private network / LAN addresses
      if (process.env.NODE_ENV !== 'production' && privateNetworkRegex.test(origin)) {
        return callback(null, true);
      }
      // Reject disallowed origins quietly with false instead of throwing a 500 exception
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Basic HTTP security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Standard body parsers (sanitized limits per security guidelines)
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Request logging middleware
app.use(requestLogger);

// Root greeting / API discovery
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to MediCore Hospital Management System API',
    version: '1.0.0',
    documentation: '/docs',
    healthCheck: '/api/v1/health',
  });
});

// API Routes
app.use('/api/v1', apiRouter);

// Centralized 404 handler
app.use(notFoundHandler);

// Centralized Error handler
app.use(errorHandler);

export default app;

