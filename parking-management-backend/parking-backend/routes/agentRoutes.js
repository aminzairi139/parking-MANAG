const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const agentController = require("../controllers/agentController");
const validation = require("../middleware/validationRules");

router.get("/sector", auth, role(["sector_admin"]), agentController.getSector);
router.post(
  "/",
  auth,
  role(["admin", "super_admin", "sector_admin"]),
  validation.agentCreate,
  agentController.createAgent,
);
router.put(
  "/:id/toggle-status",
  auth,
  role(["admin", "super_admin", "sector_admin"]),
  validation.id,
  agentController.toggleAgentStatus,
);
router.get(
  "/all",
  auth,
  role(["admin", "super_admin"]),
  agentController.getAllAgents,
);
router.get(
  "/",
  auth,
  role(["admin", "super_admin", "sector_admin"]),
  agentController.getAgents,
);
router.put(
  "/:id",
  auth,
  role(["admin", "super_admin", "sector_admin"]),
  validation.agentUpdate,
  agentController.updateAgent,
);
router.get(
  "/parking-dashboard",
  auth,
  role(["agent", "sector_admin"]),
  agentController.getParkingDashboard,
);
router.get(
  "/search/:plate",
  auth,
  role(["agent", "sector_admin"]),
  agentController.searchByPlate,
);
router.post(
  "/notify",
  auth,
  role(["agent", "sector_admin"]),
  agentController.sendSmsNotification,
);
router.post(
  "/penalty",
  auth,
  role(["agent", "sector_admin"]),
  agentController.createPenalty,
);

module.exports = router;
