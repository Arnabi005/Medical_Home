import { Router } from 'express';
import healthRouter from './health.routes.js';

const apiRouter = Router();

// Mount Health Check endpoint at /api/v1/health
apiRouter.use(healthRouter);

// Domain Module Route Mounts (Scaffolds for Member 2)
// apiRouter.use('/patients', patientRouter);
// apiRouter.use('/appointments', appointmentRouter);
// apiRouter.use('/doctors', doctorRouter);

export default apiRouter;

