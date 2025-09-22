import { Router } from 'express';
import { ContributionController } from '../controllers/ContributionController.js';
import { rateLimit } from '../middleware/rateLimit.js';

const router = Router();

/**
 * @swagger
 * /api/v1/contributions/validate:
 *   post:
 *     summary: Validate contribution amount and calculate equivalents
 *     tags: [Contributions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - frequency
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 0
 *                 description: Contribution amount in MAD
 *                 example: 500
 *               frequency:
 *                 type: string
 *                 enum: [monthly, quarterly, bi-annual, annual]
 *                 description: Payment frequency
 *                 example: monthly
 *     responses:
 *       200:
 *         description: Validation result with calculated equivalents
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 validation:
 *                   type: object
 *                   properties:
 *                     isValid:
 *                       type: boolean
 *                       description: Whether the contribution is valid
 *                     errorMessage:
 *                       type: string
 *                       description: Error message if validation failed
 *                     monthlyEquivalent:
 *                       type: number
 *                       description: Monthly equivalent amount
 *                     annualTotal:
 *                       type: number
 *                       description: Total annual contribution
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   description: Response timestamp
 *       400:
 *         description: Invalid request parameters
 *       429:
 *         description: Too many requests
 *       500:
 *         description: Internal server error
 */
router.post('/validate',
  rateLimit.contribution,
  ContributionController.validateContribution
);

export default router;