function allowRoles(...roles) {
  return function checkRole(req, res, next) {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: "You do not have permission for this action." });
      return;
    }

    next();
  };
}

module.exports = allowRoles;
