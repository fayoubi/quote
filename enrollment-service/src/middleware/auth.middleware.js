// TODO: Implement JWT authentication
const authenticateAgent = (req, res, next) => {
  // For now, stub with test agent ID from database
  const testAgentId = '8ab743b2-e9df-4035-8f29-968be5928100';

  req.agentId = req.headers['x-agent-id'] || testAgentId;
  req.agent = {
    id: req.agentId
  };
  req.ipAddress = req.ip || req.connection.remoteAddress;
  req.userAgent = req.get('user-agent') || 'unknown';
  next();
};

export { authenticateAgent };