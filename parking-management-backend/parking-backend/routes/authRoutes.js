const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { loginLimiter } = require("../middleware/rateLimit");
const validation = require("../middleware/validationRules");

router.post("/register", validation.register, authController.register);
router.post("/login", loginLimiter, validation.login, authController.login);
router.post(
  "/forgot-password",
  validation.forgotPassword,
  authController.forgotPassword,
);
router.post(
  "/reset-password",
  validation.resetPassword,
  authController.resetPassword,
);

module.exports = router;
