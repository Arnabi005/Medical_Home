import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';

const PORT = parseInt(process.env.PORT || '5000', 10);
const HOST = process.env.HOST || '0.0.0.0';

// Validate critical environment configurations
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret.length < 32 || jwtSecret.includes('development_key')) {
  if (process.env.NODE_ENV === 'production') {
    console.error('[MediCore API] FATAL: Production environment requires a strong JWT_SECRET (min 32 chars).');
    process.exit(1);
  } else {
    console.warn('[MediCore API] WARNING: JWT_SECRET is using a default or development key. Set a secure 32+ char secret before production.');
  }
}

let server;

// Start server only after database connection succeeds
async function startServer() {
  try {
    console.log('[MediCore API] Connecting to MongoDB database...');
    await connectDatabase();

    server = app.listen(PORT, HOST, () => {
      console.log(`[MediCore API] Server running in ${process.env.NODE_ENV || 'development'} mode on http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
      console.log(`[MediCore API] Health Check: http://localhost:${PORT}/api/v1/health`);
    });
  } catch (error) {
    console.error(`[MediCore API] Fatal: Could not connect to database. Server aborting startup.`);
    console.error(error);
    process.exit(1);
  }
}

// Graceful shutdown handling
const shutdown = async (signal) => {
  console.log(`\n[MediCore API] Received ${signal}. Gracefully closing HTTP server and database connection...`);
  if (server) {
    server.close(async () => {
      try {
        await disconnectDatabase();
        process.exit(0);
      } catch (err) {
        console.error('[MediCore API] Error during database disconnect:', err);
        process.exit(1);
      }
    });
  } else {
    await disconnectDatabase();
    process.exit(0);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

startServer();
