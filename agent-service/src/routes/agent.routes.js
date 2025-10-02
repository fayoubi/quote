import express from 'express';
import agentController from '../controllers/agent.controller.js';
import enrollmentController from '../controllers/enrollment.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Protected agent profile routes (require authentication)
router.use(authenticateToken);

router.get('/me', agentController.getProfile);
router.patch('/me', agentController.updateProfile);

// Agent enrollment routes
router.post('/enrollments', enrollmentController.createEnrollment);
router.get('/enrollments', enrollmentController.getEnrollments);
router.get('/enrollments/:id', enrollmentController.getEnrollmentById);

export default router;