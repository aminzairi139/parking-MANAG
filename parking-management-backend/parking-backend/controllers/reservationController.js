const mongoose = require("mongoose");
const Reservation = require("../models/Reservation");

exports.getUserReservations = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user id" });
    }
    if (req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const reservations = await Reservation.find({ client: req.user._id })
      .populate("parking", "name location")
      .sort({ dateDebut: -1 });
    res.json({ success: true, data: reservations });
  } catch (error) {
    next(error);
  }
};
