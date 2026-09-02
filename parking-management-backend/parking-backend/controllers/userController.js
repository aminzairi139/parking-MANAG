const Reservation = require("../models/Reservation");
const Parking = require("../models/Parking");
const Payment = require("../models/Payment");
const paymentService = require("../services/paymentService");
const Vehicle = require("../models/Vehicle");

exports.createReservation = async (req, res, next) => {
  try {
    const {
      parkingId,
      plateNumber,
      startTime,
      endTime,
      amount,
      // alternative / schema fields from frontend
      subscriptionType,
      ownerName,
      carType,
      carColor,
      manufacturer,
    } = req.body;

    // Try to find parking by id first, then fall back to finding by name
    let parking = null;
    if (parkingId) {
      try {
        parking = await Parking.findById(parkingId);
      } catch (err) {
        // ignore cast errors when parkingId is not an ObjectId
        parking = null;
      }
    }
    if (!parking) {
      const searchName = parkingId || req.body.parkingName || req.body.parking;
      if (searchName) {
        parking = await Parking.findOne({ name: searchName });
      }
    }

    // If parking not found or explicitly not approved, reject
    if (!parking || parking.approved === false) {
      return res
        .status(400)
        .json({ success: false, message: "Parking not available" });
    }

    // Map frontend fields to Mongoose schema in French
    const finalType = subscriptionType ? "horaire" : "1heure";
    const finalPlate = plateNumber || "";
    const finalOwner = ownerName || req.user.name || "Client";
    const finalMarque = carType || "Véhicule";
    const finalCouleur = carColor || "#000000";
    const finalMaison = manufacturer || "Autre";

    const finalStart = startTime ? new Date(startTime) : new Date();
    let finalEnd = endTime
      ? new Date(endTime)
      : new Date(finalStart.getTime() + 3600 * 1000);
    if (subscriptionType === "2 HEURES" || subscriptionType === "2heures") {
      finalEnd = new Date(finalStart.getTime() + 2 * 3600 * 1000);
    } else if (
      subscriptionType === "3HEURES" ||
      subscriptionType === "3heures"
    ) {
      finalEnd = new Date(finalStart.getTime() + 3 * 3600 * 1000);
    }

    const finalAmount =
      amount ||
      (subscriptionType === "2 HEURES"
        ? 20
        : subscriptionType === "3HEURES"
          ? 30
          : 10);

    const reservation = await Reservation.create({
      id: `RES-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      typeReservation: finalType,
      numImmatriculation: finalPlate,
      nomConducteur: finalOwner,
      marque: finalMarque,
      couleur: finalCouleur,
      maisonVehicule: finalMaison,
      dateDebut: finalStart,
      dateFin: finalEnd,
      statut: "en_attente",
      client: req.user._id,
      parking: parking._id,
      montant: finalAmount,
    });

    await Vehicle.findOneAndUpdate(
      { owner: req.user._id, registrationNumber: finalPlate },
      { type: carType || "toutes" },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    res.status(201).json({ success: true, data: reservation });
  } catch (error) {
    next(error);
  }
};

exports.payReservation = async (req, res, next) => {
  try {
    const { reservationId, paymentMethod, paymentData = {} } = req.body;
    const reservation = await Reservation.findOne({
      _id: reservationId,
      client: req.user._id,
    });

    if (!reservation) {
      return res
        .status(404)
        .json({ success: false, message: "Reservation not found" });
    }

    const normalizedMethod = paymentMethod === "card" ? "carte" : paymentMethod;
    const paymentResult = await paymentService.processPayment(
      normalizedMethod,
      paymentData,
    );

    if (!paymentResult.success) {
      return res.status(400).json({
        success: false,
        message: paymentResult.error || "Payment failed",
      });
    }

    const payment = await Payment.create({
      reservation: reservation._id,
      user: req.user._id,
      amount: reservation.montant || reservation.amount,
      method: normalizedMethod,
      paymentDetails: paymentResult.paymentDetails || {},
      status: "confirmed",
      transactionId: paymentResult.transactionId,
    });

    reservation.statut = "confirmé";
    await reservation.save();

    res.json({ success: true, data: { reservation, payment } });
  } catch (error) {
    next(error);
  }
};

exports.getReservationQr = async (req, res, next) => {
  try {
    const reservation = await Reservation.findOne({
      _id: req.params.id,
      client: req.user._id,
    });
    if (!reservation) {
      return res
        .status(404)
        .json({ success: false, message: "Reservation not found" });
    }
    res.json({ success: true, data: { reservation } });
  } catch (error) {
    next(error);
  }
};

exports.getApprovedParkings = async (req, res, next) => {
  try {
    const parkings = await Parking.find({ approved: true }).select(
      "name location",
    );
    res.json({ success: true, data: parkings });
  } catch (error) {
    next(error);
  }
};

exports.getReservations = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === "user") {
      query = { client: req.user._id };
    }
    const list = await Reservation.find(query)
      .populate("client", "name email phone")
      .populate("parking", "name location")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
};
