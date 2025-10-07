import { Router } from 'express';
import { HealthController } from '../controllers/HealthController.js';
const router = Router();
const healthController = new HealthController();
router.get('/', async (req, res) => {
    await healthController.basicHealthCheck(req, res);
});
router.get('/deep', async (req, res) => {
    await healthController.deepHealthCheck(req, res);
});
export default router;
//# sourceMappingURL=health.js.map