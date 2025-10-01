import express from 'express';
import authController from '../controllers/auth.controller.js';
import { validateTokenForServices } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public authentication routes
router.post('/register', authController.register);
router.post('/request-otp', authController.requestOTP);
router.post('/verify-otp', authController.verifyOTP);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);

// Token validation endpoint for other services
router.post('/validate', validateTokenForServices);

export default router;