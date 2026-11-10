import morgan from 'morgan';

// Custom token to log path only (preventing patient PHI / query params from appearing in access logs)
morgan.token('path', (req) => req.path || req.originalUrl?.split('?')[0]);

// Custom format ensuring sensitive patient and health data is not logged in headers or query parameters
export const requestLogger = morgan(
  ':remote-addr - :remote-user [:date[iso]] ":method :path HTTP/:http-version" :status :res[content-length] - :response-time ms',
  {
    skip: (req) => {
      // Optionally skip logging health check in production to avoid clutter
      return process.env.NODE_ENV === 'production' && req.url === '/api/v1/health';
    },
  }
);

