import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

/**
 * POST /api/v1/agents/sync
 * Sync agent data from agent-service to enrollment-service
 * This endpoint is called internally by agent-service
 */
router.post('/agents/sync', async (req, res) => {
  try {
    const { id, first_name, last_name, email, license_number } = req.body;

    if (!id || !first_name || !last_name || !email || !license_number) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: id, first_name, last_name, email, license_number',
      });
    }

    // Insert or update agent
    const query = `
      INSERT INTO agents (id, first_name, last_name, email, license_number)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (id)
      DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        email = EXCLUDED.email,
        license_number = EXCLUDED.license_number,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const result = await pool.query(query, [
      id,
      first_name,
      last_name,
      email,
      license_number,
    ]);

    res.json({
      success: true,
      message: 'Agent synced successfully',
      agent: result.rows[0],
    });
  } catch (error) {
    console.error('Error syncing agent:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync agent',
      details: error.message,
    });
  }
});

export default router;
