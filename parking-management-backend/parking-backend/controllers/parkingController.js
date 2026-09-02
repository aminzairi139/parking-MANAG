const mongoose = require("mongoose");
const Parking = require("../models/Parking");
const Reservation = require("../models/Reservation");

function remainingMinutes(dateFin) {
  return Math.floor((new Date(dateFin).getTime() - Date.now()) / 60000);
}

function toVehicle(reservation) {
  return {
    vehicleId: reservation._id,
    plateNumber: reservation.numImmatriculation,
    type: reservation.typeVehicule || "toutes",
    brand:
      [reservation.marque, reservation.modeleVehicule]
        .filter(Boolean)
        .join(" ") || "-",
    driver: reservation.nomConducteur,
    remainingMinutes: remainingMinutes(reservation.dateFin),
    startDate: reservation.dateDebut,
    endDate: reservation.dateFin,
    status: reservation.statut,
  };
}

function validId(id) {
  return mongoose.isValidObjectId(id);
}

exports.getUserParkings = async (req, res, next) => {
  try {
    if (!validId(req.params.userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user id" });
    }
    if (req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const parkings = await Parking.find({
      createdBy: req.user._id,
      approved: true,
    })
      .sort({ name: 1 })
      .lean();
    const reservations = await Reservation.find({
      parking: { $in: parkings.map((parking) => parking._id) },
      statut: { $ne: "annulé" },
    }).lean();

    const data = parkings.map((parking) => {
      const parkingReservations = reservations.filter(
        (reservation) =>
          reservation.parking.toString() === parking._id.toString(),
      );
      const occupiedPlates = new Set(
        parkingReservations.map(
          (reservation) => reservation.numImmatriculation,
        ),
      );
      return {
        ...parking,
        capacity: parking.capacity || 50,
        occupied: occupiedPlates.size,
      };
    });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.getParkingVehicles = async (req, res, next) => {
  try {
    if (!validId(req.params.parkingId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid parking id" });
    }
    const parking = await Parking.findOne({
      _id: req.params.parkingId,
      createdBy: req.user._id,
      approved: true,
    }).lean();
    if (!parking) {
      return res
        .status(404)
        .json({ success: false, message: "Parking not found" });
    }

    const reservations = await Reservation.find({
      parking: parking._id,
      statut: { $ne: "annulé" },
    })
      .sort({ dateFin: -1 })
      .lean();
    const vehicles = new Map();
    reservations.forEach((reservation) => {
      if (!vehicles.has(reservation.numImmatriculation)) {
        vehicles.set(reservation.numImmatriculation, toVehicle(reservation));
      }
    });

    res.json({
      success: true,
      data: {
        parking: { ...parking, capacity: parking.capacity || 50 },
        vehicles: [...vehicles.values()],
      },
    });
  } catch (error) {
    next(error);
  }
};
