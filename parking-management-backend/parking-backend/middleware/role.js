module.exports =
  (allowedRoles = []) =>
  (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }
    const roleAliases =
      req.user.role === "admin" || req.user.role === "super_admin"
        ? ["admin", "super_admin"]
        : [req.user.role];
    if (
      !allowedRoles.some((allowedRole) => roleAliases.includes(allowedRole))
    ) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    next();
  };
