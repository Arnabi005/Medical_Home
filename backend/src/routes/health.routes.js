import { Router } from 'express';
import { checkDatabaseConnection } from '../config/database.js';

const router = Router();
const startTime = Date.now();

/**
 * @route   GET /api/v1/health
 * @desc    Health check endpoint reporting system uptime, memory, and MongoDB database status
 * @access  Public
 */
router.get('/health', async (req, res) => {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  const dbStatus = await checkDatabaseConnection();

  const isHealthy = dbStatus.connected;

  const payload = {
    status: isHealthy ? 'healthy' : 'degraded',
    service: 'MediCore Hospital Management System API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: `${uptimeSeconds}s`,
    database: {
      type: 'mongodb',
      status: dbStatus.connected ? 'connected' : 'disconnected',
      message: isHealthy ? 'Database connected and responsive' : 'Database connection unavailable',
    },
    modules: {
      patients: 'initialized',
      scheduling: 'initialized',
      authentication: 'member_1_managed',
    },
  };

  res.status(isHealthy ? 200 : 503).json(payload);
});

export default router;
