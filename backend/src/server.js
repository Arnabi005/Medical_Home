import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { checkDatabaseConnection, prisma } from './config/prisma.js';

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
  console.log(`[MediCore API] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`[MediCore API] Health Check: http://localhost:${PORT}/api/v1/health`);

  // Diagnostic DB connection test
  const dbStatus = await checkDatabaseConnection();
  if (dbStatus.connected) {
    console.log('[MediCore API] PostgreSQL Database: CONNECTED');
  } else {
    console.warn(`[MediCore API] PostgreSQL Database: DISCONNECTED (${dbStatus.message})`);
  }
});

// Graceful shutdown handling
const shutdown = async (signal) => {
  console.log(`\n[MediCore API] Received ${signal}. Gracefully closing HTTP server and database pool...`);
  server.close(async () => {
    try {
      await prisma.$disconnect();
      console.log('[MediCore API] Prisma client disconnected.');
      process.exit(0);
    } catch (err) {
      console.error('[MediCore API] Error during disconnect:', err);
      process.exit(1);
    }
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

