import { Router } from 'express';
import { ContributionController } from '../controllers/ContributionController.js';
import { rateLimit } from '../middleware/rateLimit.js';
const router = Router();
router.post('/validate', rateLimit.contribution, ContributionController.validateContribution);
export default router;
//# sourceMappingURL=contributions.js.map