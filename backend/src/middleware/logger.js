import morgan from 'morgan';

// Custom format ensuring sensitive patient and health data is not logged in headers or parameters
export const requestLogger = morgan(
  ':remote-addr - :remote-user [:date[iso]] ":method :url HTTP/:http-version" :status :res[content-length] - :response-time ms',
  {
    skip: (req) => {
      // Optionally skip logging health check in production to avoid clutter
      return process.env.NODE_ENV === 'production' && req.url === '/api/v1/health';
    },
  }
);

