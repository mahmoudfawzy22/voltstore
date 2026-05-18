/**
 * Admin guard — must be used AFTER the protect middleware.
 * Blocks non-admin users from accessing admin routes.
 */
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    return next();
  }
  res.status(403).json({
    success: false,
    message: 'Access denied. Admins only.',
  });
};

module.exports = { admin };
