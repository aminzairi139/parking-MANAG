const express = require("express");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const parkingController = require("../controllers/parkingController");

const router = express.Router();

router.get(
  "/user/:userId",
  auth,
  role(["user"]),
  parkingController.getUserParkings,
);
router.get(
  "/:parkingId/vehicles",
  auth,
  role(["user"]),
  parkingController.getParkingVehicles,
);

module.exports = router;
