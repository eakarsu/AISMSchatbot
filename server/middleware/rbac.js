/**
 * RBAC middleware for caseworker / supervisor / admin roles.
 * Roles hierarchy: admin > supervisor > caseworker
 */

const ROLE_LEVELS = {
  caseworker: 1,
  supervisor: 2,
  admin: 3,
};

/**
 * requireRole('supervisor') — user must be supervisor OR admin
 */
function requireRole(minRole) {
  return (req, res, next) => {
    const userRole = req.user?.role;
    if (!userRole) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    const userLevel = ROLE_LEVELS[userRole] || 0;
    const requiredLevel = ROLE_LEVELS[minRole] || 0;
    if (userLevel < requiredLevel) {
      return res.status(403).json({
        error: `Access denied. Requires role: ${minRole} or higher.`,
      });
    }
    next();
  };
}

/**
 * requireAdmin — shortcut for admin-only routes
 */
const requireAdmin = requireRole('admin');

/**
 * requireSupervisor — shortcut for supervisor+ routes
 */
const requireSupervisor = requireRole('supervisor');

module.exports = { requireRole, requireAdmin, requireSupervisor };
