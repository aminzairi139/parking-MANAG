const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const adminController = require("../controllers/adminController");
const validation = require("../middleware/validationRules");

router.post(
  "/",
  auth,
  role(["admin"]),
  validation.adminCreate,
  adminController.createSectorAdmin,
);
router.put(
  "/:id",
  auth,
  role(["admin"]),
  validation.adminUpdate,
  adminController.updateSectorAdmin,
);

router.post(
  "/agents",
  auth,
  role(["admin"]),
  validation.agentCreate,
  adminController.createAgent,
);
router.get(
  "/sectors",
  auth,
  role(["admin"]),
  adminController.getApprovedParkings,
);
router.post(
  "/sector-admins",
  auth,
  role(["admin"]),
  validation.adminCreate,
  adminController.createSectorAdmin,
);
router.get(
  "/sector-admins",
  auth,
  role(["admin"]),
  adminController.getSectorAdmins,
);
router.patch(
  "/sector-admins/:id/toggle",
  auth,
  role(["admin"]),
  validation.id,
  adminController.toggleSectorAdmin,
);
router.get("/agents", auth, role(["admin"]), adminController.getAgents);
router.get(
  "/agents/:id",
  auth,
  role(["admin"]),
  validation.id,
  adminController.getAgent,
);
router.put(
  "/agents/:id",
  auth,
  role(["admin"]),
  validation.agentUpdate,
  adminController.updateAgent,
);
router.patch(
  "/agents/:id/deactivate",
  auth,
  role(["admin"]),
  validation.id,
  adminController.deactivateAgent,
);
router.patch(
  "/agents/:id/activate",
  auth,
  role(["admin"]),
  validation.id,
  adminController.activateAgent,
);
router.post(
  "/parkings/:id/approve",
  auth,
  role(["admin"]),
  validation.id,
  adminController.approveParking,
);

module.exports = router;
