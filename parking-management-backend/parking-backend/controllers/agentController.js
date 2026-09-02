const bcrypt = require("bcryptjs");
const Reservation = require("../models/Reservation");
const User = require("../models/User");
const Penalty = require("../models/Penalty");
const Parking = require("../models/Parking");
const smsService = require("../services/smsService");

function remainingMinutes(dateFin) {
  return Math.floor((new Date(dateFin).getTime() - Date.now()) / 60000);
}

function agentScope(req) {
  if (req.user.role === "sector_admin") {
    return { role: "agent", sector: req.user.sector };
  }
  return { role: "agent" };
}

function privilegedAgentScope(req) {
  return req.user.role === "sector_admin" ? agentScope(req) : { role: "agent" };
}

exports.getSector = async (req, res, next) => {
  try {
    const sector = await Parking.findOne({
      name: req.user.sector,
      approved: true,
    }).select("name location capacity");
    if (!sector) {
      return res
        .status(404)
        .json({ success: false, message: "Secteur introuvable" });
    }
    res.json({ success: true, data: sector });
  } catch (error) {
    next(error);
  }
};

exports.getAgents = async (req, res, next) => {
  try {
    const agents = await User.find(agentScope(req)).select(
      "name email phone sector isActive role",
    );
    res.json({ success: true, data: agents });
  } catch (error) {
    next(error);
  }
};

exports.getAllAgents = async (req, res, next) => {
  try {
    const agents = await User.find({ role: "agent" }).select(
      "name email phone sector isActive role",
    );
    res.json({ success: true, data: agents });
  } catch (error) {
    next(error);
  }
};

exports.createAgent = async (req, res, next) => {
  try {
    const { name, email, phone, sector, password } = req.body;
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Le nom et l'email sont obligatoires",
      });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Cette adresse email existe deja" });
    }
    const assignedSector =
      req.user.role === "sector_admin" ? req.user.sector : sector;
    if (!assignedSector) {
      return res.status(400).json({
        success: false,
        message: "Le secteur est obligatoire",
      });
    }
    const agent = await User.create({
      name,
      email: email.toLowerCase(),
      password: await bcrypt.hash(
        password || `${name.replace(/\s+/g, "")}123`,
        10,
      ),
      phone,
      role: "agent",
      sector: assignedSector,
      isActive: true,
    });
    res.status(201).json({
      success: true,
      data: await User.findById(agent._id).select(
        "name email phone sector isActive role",
      ),
    });
  } catch (error) {
    next(error);
  }
};

exports.updateAgent = async (req, res, next) => {
  try {
    const agent = await User.findOne({
      _id: req.params.id,
      ...privilegedAgentScope(req),
    });
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent introuvable ou hors de votre secteur",
      });
    }

    const { name, email, phone, sector, password, isActive } = req.body;
    if (email && email.toLowerCase() !== agent.email) {
      const existing = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: agent._id },
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Cette adresse email existe deja",
        });
      }
      agent.email = email;
    }
    if (name !== undefined) agent.name = name;
    if (phone !== undefined) agent.phone = phone;
    if (isActive !== undefined) agent.isActive = isActive;
    if (req.user.role !== "sector_admin" && sector !== undefined) {
      agent.sector = sector;
    }
    if (password) agent.password = await bcrypt.hash(password, 10);
    await agent.save();

    res.json({
      success: true,
      data: await User.findById(agent._id).select(
        "name email phone sector isActive role",
      ),
    });
  } catch (error) {
    next(error);
  }
};

exports.toggleAgentStatus = async (req, res, next) => {
  try {
    const agent = await User.findOne({
      _id: req.params.id,
      ...agentScope(req),
    });
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent introuvable ou hors de votre secteur",
      });
    }
    agent.isActive = !agent.isActive;
    await agent.save();
    res.json({
      success: true,
      data: await User.findById(agent._id).select(
        "name email phone sector isActive role",
      ),
    });
  } catch (error) {
    next(error);
  }
};

exports.getParkingDashboard = async (req, res, next) => {
  try {
    const parkingQuery = { approved: true };
    if (req.user.sector) parkingQuery.name = req.user.sector;
    const parkings = await Parking.find(parkingQuery).sort({ name: 1 }).lean();
    const reservations = await Reservation.find({
      parking: { $in: parkings.map((parking) => parking._id) },
      statut: { $ne: "annulé" },
    })
      .populate("parking", "name location")
      .lean();

    const data = parkings.map((parking) => {
      const parkingReservations = reservations.filter(
        (reservation) =>
          reservation.parking?._id.toString() === parking._id.toString(),
      );
      const vehiclesByPlate = new Map();

      parkingReservations.forEach((reservation) => {
        if (!vehiclesByPlate.has(reservation.numImmatriculation)) {
          vehiclesByPlate.set(reservation.numImmatriculation, {
            id: reservation._id,
            plateNumber: reservation.numImmatriculation,
            city: parking.location,
            brand:
              [reservation.marque, reservation.modeleVehicule]
                .filter(Boolean)
                .join(" ") || "-",
            driver: reservation.nomConducteur,
            status:
              new Date(reservation.dateFin) > new Date() ? "Actif" : "Inactif",
            subscriptionType: reservation.typeReservation,
            remainingMinutes: remainingMinutes(reservation.dateFin),
            dateDebut: reservation.dateDebut,
            dateFin: reservation.dateFin,
            history: [],
          });
        }
        vehiclesByPlate.get(reservation.numImmatriculation).history.push({
          id: reservation._id,
          dateDebut: reservation.dateDebut,
          dateFin: reservation.dateFin,
          parkingName: parking.name,
        });
      });

      const vehicles = [...vehiclesByPlate.values()];
      return {
        ...parking,
        capacity: parking.capacity || 50,
        occupied: vehicles.length,
        vehicles,
      };
    });

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.searchByPlate = async (req, res, next) => {
  try {
    const { plate } = req.params;
    const reservations = await Reservation.find({
      plateNumber: new RegExp(plate, "i"),
    }).populate("user", "name email phone");
    res.json({ success: true, data: reservations });
  } catch (error) {
    next(error);
  }
};

exports.sendSmsNotification = async (req, res, next) => {
  try {
    const { userId, message } = req.body;
    const user = await User.findById(userId);
    if (!user || !user.phone) {
      return res
        .status(404)
        .json({ success: false, message: "User phone not found" });
    }
    await smsService.sendSms(user.phone, message || "Votre parking est prêt");
    res.json({ success: true, message: "SMS envoyé" });
  } catch (error) {
    next(error);
  }
};

exports.createPenalty = async (req, res, next) => {
  try {
    const { userId, plateNumber, amount, reason } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Utilisateur non trouvé" });
    }
    const penalty = await Penalty.create({
      user: user._id,
      plateNumber,
      amount,
      reason,
    });
    res.status(201).json({ success: true, data: penalty });
  } catch (error) {
    next(error);
  }
};
