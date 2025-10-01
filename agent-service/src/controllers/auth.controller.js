import agentService from '../services/agent.service.js';
import otpService from '../services/otp.service.js';
import tokenService from '../services/token.service.js';
import { ApiError, asyncHandler } from '../middleware/errorHandler.js';

class AuthController {
  // POST /api/v1/auth/register - Register new agent
  register = asyncHandler(async (req, res) => {
    const { phone_number, country_code, first_name, last_name, email } = req.body;

    if (!phone_number || !country_code || !first_name || !last_name) {
      throw new ApiError(400, 'phone_number, country_code, first_name, and last_name are required');
    }

    const agent = await agentService.register({
      phone_number,
      country_code,
      first_name,
      last_name,
      email,
    });

    res.status(201).json({
      success: true,
      data: agent,
    });
  });

  // POST /api/v1/auth/request-otp - Request OTP for login
  requestOTP = asyncHandler(async (req, res) => {
    const { phone_number, delivery_method = 'sms' } = req.body;

    if (!phone_number) {
      throw new ApiError(400, 'phone_number is required');
    }

    // Check if agent exists
    const agent = await agentService.getByPhoneNumber(phone_number);

    if (!agent) {
      throw new ApiError(404, 'Agent not registered');
    }

    // Create OTP
    const otpResult = await otpService.createOTP(phone_number, delivery_method);

    res.json({
      success: true,
      message: otpResult.message,
      expiresAt: otpResult.expiresAt,
      ...(process.env.NODE_ENV === 'development' && { code: otpResult.code }),
    });
  });

  // POST /api/v1/auth/verify-otp - Verify OTP and login
  verifyOTP = asyncHandler(async (req, res) => {
    const { phone_number, code } = req.body;

    if (!phone_number || !code) {
      throw new ApiError(400, 'phone_number and code are required');
    }

    // Verify OTP
    await otpService.verifyOTP(phone_number, code);

    // Get agent
    const agent = await agentService.getByPhoneNumber(phone_number);

    if (!agent) {
      throw new ApiError(404, 'Agent not found');
    }

    // Generate token
    const tokenData = tokenService.generateToken(agent.id);

    // Create session
    await tokenService.createSession(agent.id, tokenData.token);

    res.json({
      success: true,
      token: tokenData.token,
      expiresIn: tokenData.expiresIn,
      agent,
    });
  });

  // POST /api/v1/auth/refresh - Refresh access token
  refreshToken = asyncHandler(async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Authorization token required');
    }

    const token = authHeader.substring(7);

    // Refresh token
    const tokenData = await tokenService.refreshToken(token);

    res.json({
      success: true,
      token: tokenData.token,
      expiresIn: tokenData.expiresIn,
    });
  });

  // POST /api/v1/auth/logout - Logout and invalidate session
  logout = asyncHandler(async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Authorization token required');
    }

    const token = authHeader.substring(7);

    // Invalidate session
    await tokenService.invalidateSession(token);

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  });
}

export default new AuthController();