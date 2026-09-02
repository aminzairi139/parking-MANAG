const express = require("express");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const reservationController = require("../controllers/reservationController");

const router = express.Router();

router.get(
  "/user/:userId",
  auth,
  role(["user"]),
  reservationController.getUserReservations,
);

module.exports = router;
