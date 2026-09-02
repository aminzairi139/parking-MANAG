const mongoose = require("mongoose");
const Reservation = require("../models/Reservation");

exports.getVehicleHistory = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.vehicleId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid vehicle id" });
    }
    const reservation = await Reservation.findOne({
      _id: req.params.vehicleId,
      client: req.user._id,
    })
      .populate("parking", "name location")
      .lean();
    if (!reservation) {
      return res
        .status(404)
        .json({ success: false, message: "Vehicle not found" });
    }

    const history = await Reservation.find({
      client: req.user._id,
      numImmatriculation: reservation.numImmatriculation,
    })
      .populate("parking", "name location")
      .sort({ dateDebut: -1 })
      .lean();

    const otherReservations = await Reservation.find({
      client: req.user._id,
      parking: reservation.parking?._id || reservation.parking,
      statut: { $ne: "annulé" },
      _id: { $ne: reservation._id },
    })
      .sort({ dateFin: 1 })
      .lean();

    const otherVehicles = [];
    const seenPlates = new Set();
    otherReservations.forEach((item) => {
      if (!seenPlates.has(item.numImmatriculation)) {
        seenPlates.add(item.numImmatriculation);
        otherVehicles.push({
          id: item._id,
          plateNumber: item.numImmatriculation,
          remainingMinutes: Math.floor(
            (new Date(item.dateFin).getTime() - Date.now()) / 60000,
          ),
        });
      }
    });

    res.json({
      success: true,
      data: {
        vehicle: {
          id: reservation._id,
          plateNumber: reservation.numImmatriculation,
          city: reservation.parking?.location || "-",
          brand:
            [reservation.marque, reservation.modeleVehicule]
              .filter(Boolean)
              .join(" ") || "-",
          driver: reservation.nomConducteur,
          status:
            new Date(reservation.dateFin) > new Date() ? "Actif" : "Inactif",
        },
        history,
        otherVehicles,
      },
    });
  } catch (error) {
    next(error);
  }
};
