import express from 'express';
import agentController from '../controllers/agent.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Protected agent profile routes (require authentication)
router.use(authenticateToken);

router.get('/me', agentController.getProfile);
router.patch('/me', agentController.updateProfile);

export default router;