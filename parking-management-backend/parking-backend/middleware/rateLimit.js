const rateLimit = require("express-rate-limit");

const passThrough = (_req, _res, next) => next();

const createConditionalLimiter = (options) =>
  process.env.NODE_ENV === "development" ? passThrough : rateLimit(options);

const loginLimiter = createConditionalLimiter({
  windowMs: 5 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Trop de tentatives de connexion." },
});

const adminCreationLimiter = createConditionalLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Trop de créations d'administrateurs." },
});

module.exports = { loginLimiter, adminCreationLimiter };
