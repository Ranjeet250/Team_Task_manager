const prisma = require('../config/db');

// Check if user is a member of the project and has the required role
// Usage: authorize('ADMIN') or authorize('MEMBER', 'ADMIN')
const authorize = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const projectId = req.params.id || req.params.projectId;

      if (!projectId) {
        return res.status(400).json({ message: 'Project ID is required' });
      }

      const membership = await prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: req.user.id,
            projectId: projectId,
          },
        },
      });

      if (!membership) {
        return res.status(403).json({ message: 'You are not a member of this project' });
      }

      if (!allowedRoles.includes(membership.role)) {
        return res.status(403).json({ message: 'You do not have permission for this action' });
      }

      req.membership = membership;
      next();
    } catch (error) {
      return res.status(500).json({ message: 'Authorization check failed' });
    }
  };
};

module.exports = { authorize };
