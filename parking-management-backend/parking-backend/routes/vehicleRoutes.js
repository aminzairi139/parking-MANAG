const express = require("express");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const vehicleController = require("../controllers/vehicleController");
const vehicleHistoryController = require("../controllers/vehicleHistoryController");

const router = express.Router();

router.get(
  "/user/:userId",
  auth,
  role(["user"]),
  vehicleController.getUserVehicles,
);
router.get(
  "/:vehicleId/history",
  auth,
  role(["user"]),
  vehicleHistoryController.getVehicleHistory,
);

module.exports = router;
