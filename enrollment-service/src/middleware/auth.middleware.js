// TODO: Implement JWT authentication
const authenticateAgent = (req, res, next) => {
  // For now, stub with default agent ID
  req.agentId = req.headers['x-agent-id'] || '11111111-1111-1111-1111-111111111111';
  req.ipAddress = req.ip || req.connection.remoteAddress;
  req.userAgent = req.get('user-agent') || 'unknown';
  next();
};

export { authenticateAgent };