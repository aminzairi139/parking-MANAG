const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const adminController = require("../controllers/adminController");

router.get(
  "/global",
  auth,
  role(["admin", "super_admin"]),
  adminController.getGlobalStats,
);

module.exports = router;
