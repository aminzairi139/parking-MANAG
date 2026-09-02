const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const userController = require("../controllers/userController");

router.get(
  "/parkings",
  auth,
  role(["user"]),
  userController.getApprovedParkings,
);
router.post("/reserve", auth, role(["user"]), userController.createReservation);
router.post("/pay", auth, role(["user"]), userController.payReservation);
router.get("/qr/:id", auth, role(["user"]), userController.getReservationQr);
router.get("/reservations", auth, userController.getReservations);

module.exports = router;
