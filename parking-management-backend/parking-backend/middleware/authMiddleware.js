const jwt = require("jsonwebtoken");
const User = require("../models/User");
const config = require("../config/config");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, message: "Authentication required" });
  }

  try {
    const token = authHeader.slice(7);
    const payload = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(payload.userId).select(
      "_id role sector isActive name email",
    );
    if (!user || !user.isActive) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid token or user disabled" });
    }

    req.user = {
      id: user._id.toString(),
      _id: user._id,
      role: user.role,
      sector: user.sector || "",
      name: user.name,
      email: user.email,
    };
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;
