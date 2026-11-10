import { Router } from 'express';
import healthRouter from './health.routes.js';
import authRouter from './auth.routes.js';
import departmentsRouter from './departments.routes.js';
import patientsRouter from './patients.routes.js';
import appointmentsRouter from './appointments.routes.js';

const apiRouter = Router();

// Mount Health Check endpoint at /api/v1/health
apiRouter.use(healthRouter);

// Mount Authentication endpoint at /api/v1/auth
apiRouter.use('/auth', authRouter);

// Domain Module Route Mounts
apiRouter.use('/departments', departmentsRouter);
apiRouter.use('/patients', patientsRouter);
apiRouter.use('/appointments', appointmentsRouter);

export default apiRouter;

