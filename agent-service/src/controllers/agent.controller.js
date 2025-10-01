import agentService from '../services/agent.service.js';
import { ApiError, asyncHandler } from '../middleware/errorHandler.js';

class AgentController {
  // GET /api/v1/agents/me - Get agent profile
  getProfile = asyncHandler(async (req, res) => {
    const agent = await agentService.getById(req.agent.id);

    if (!agent) {
      throw new ApiError(404, 'Agent not found');
    }

    res.json({
      success: true,
      data: agent,
    });
  });

  // PATCH /api/v1/agents/me - Update agent profile
  updateProfile = asyncHandler(async (req, res) => {
    const { first_name, last_name, email } = req.body;

    const updates = {};
    if (first_name !== undefined) updates.first_name = first_name;
    if (last_name !== undefined) updates.last_name = last_name;
    if (email !== undefined) updates.email = email;

    if (Object.keys(updates).length === 0) {
      throw new ApiError(400, 'No valid fields to update');
    }

    const updatedAgent = await agentService.updateProfile(req.agent.id, updates);

    res.json({
      success: true,
      data: updatedAgent,
    });
  });
}

export default new AgentController();