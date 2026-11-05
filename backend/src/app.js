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

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (such as mobile apps, Postman, curl)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS origin ${origin} not allowed by policy`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Standard body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

