const mongoose = require("mongoose");
const Vehicle = require("../models/Vehicle");

exports.getUserVehicles = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user id" });
    }
    if (req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const vehicles = await Vehicle.find({ owner: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ success: true, data: vehicles });
  } catch (error) {
    next(error);
  }
};
