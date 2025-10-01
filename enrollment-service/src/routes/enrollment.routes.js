import express from 'express';
import enrollmentController from '../controllers/enrollment.controller.js';
import { authenticateAgent } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateAgent);

// Enrollment Management
router.post('/enrollments', enrollmentController.createEnrollment);
router.get('/enrollments/:id', enrollmentController.getEnrollment);
router.get('/enrollments', enrollmentController.listEnrollments);
router.patch('/enrollments/:id/status', enrollmentController.updateEnrollmentStatus);
router.delete('/enrollments/:id', enrollmentController.deleteEnrollment);

// Step Management
router.post('/enrollments/:id/steps/:stepId', enrollmentController.saveStepData);
router.get('/enrollments/:id/steps/:stepId', enrollmentController.getStepData);
router.get('/enrollments/:id/steps', enrollmentController.getAllSteps);

// Billing
router.post('/enrollments/:id/billing', enrollmentController.saveBillingData);
router.get('/enrollments/:id/billing', enrollmentController.getBillingData);

// Beneficiaries
router.post('/enrollments/:id/beneficiaries', enrollmentController.addBeneficiaries);
router.get('/enrollments/:id/beneficiaries', enrollmentController.getBeneficiaries);
router.put('/enrollments/:id/beneficiaries/:beneficiaryId', enrollmentController.updateBeneficiary);
router.delete('/enrollments/:id/beneficiaries/:beneficiaryId', enrollmentController.deleteBeneficiary);

// Summary & Submission
router.get('/enrollments/:id/summary', enrollmentController.getEnrollmentSummary);
router.post('/enrollments/:id/submit', enrollmentController.submitEnrollment);

export default router;