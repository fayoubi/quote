import { Router } from 'express';
import { HealthController } from '../controllers/HealthController.js';

const router = Router();
const healthController = new HealthController();

// GET /api/v1/health
router.get('/',
  async (req, res) => {
    await healthController.basicHealthCheck(req, res);
  }
);

// GET /api/v1/health/deep
router.get('/deep',
  async (req, res) => {
    await healthController.deepHealthCheck(req, res);
  }
);

export default router;