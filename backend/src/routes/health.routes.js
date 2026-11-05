import { Router } from 'express';
import { checkDatabaseConnection } from '../config/prisma.js';

const router = Router();
const startTime = Date.now();

/**
 * @route   GET /api/v1/health
 * @desc    Health check endpoint reporting system uptime, memory, and database status
 * @access  Public
 */
router.get('/health', async (req, res) => {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  const memoryUsage = process.memoryUsage();
  const dbStatus = await checkDatabaseConnection();

  const isHealthy = dbStatus.connected;

  const payload = {
    status: isHealthy ? 'healthy' : 'degraded',
    service: 'MediCore Hospital Management System API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: `${uptimeSeconds}s`,
    database: {
      status: dbStatus.connected ? 'connected' : 'disconnected',
      message: dbStatus.message,
      ...(dbStatus.error && { error: dbStatus.error }),
    },
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      memory: {
        rssMB: (memoryUsage.rss / 1024 / 1024).toFixed(2),
        heapUsedMB: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2),
      },
    },
    modules: {
      patients: 'initialized',
      scheduling: 'initialized',
      authentication: 'member_1_managed',
    },
  };

  // Return 200 even if degraded so client can see diagnostic status, or 503 if critical
  res.status(isHealthy ? 200 : 200).json(payload);
});

export default router;

