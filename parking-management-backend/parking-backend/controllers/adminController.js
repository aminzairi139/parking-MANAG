const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Parking = require("../models/Parking");

exports.getGlobalStats = async (req, res, next) => {
  try {
    const [admins, agents, sectors] = await Promise.all([
      User.find({ role: "sector_admin" }).select("sector isActive"),
      User.find({ role: "agent" }).select("sector isActive"),
      Parking.find({ approved: true })
        .sort({ createdAt: 1 })
        .limit(5)
        .select("name"),
    ]);
    const adminActive = admins.filter((user) => user.isActive !== false).length;
    const agentActive = agents.filter((user) => user.isActive !== false).length;
    const adminInactive = admins.length - adminActive;
    const agentInactive = agents.length - agentActive;
    const statsParSecteur = sectors.map((sector, index) => ({
      code: `SECT-${String.fromCharCode(65 + index)}00${index + 1}`,
      secteur: sector.name,
      nbAdmins: admins.filter((user) => user.sector === sector.name).length,
      nbAgents: agents.filter((user) => user.sector === sector.name).length,
    }));

    res.json({
      success: true,
      data: {
        totalUsers: admins.length + agents.length,
        totalAdmins: admins.length,
        totalAgents: agents.length,
        actifs: {
          total: adminActive + agentActive,
          admins: adminActive,
          agents: agentActive,
        },
        inactifs: {
          total: adminInactive + agentInactive,
          admins: adminInactive,
          agents: agentInactive,
        },
        statsParSecteur,
        repartitionStatuts: {
          admins: { actifs: adminActive, inactifs: adminInactive },
          agents: { actifs: agentActive, inactifs: agentInactive },
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getApprovedParkings = async (req, res, next) => {
  try {
    const parkings = await Parking.find({ approved: true })
      .sort({ createdAt: 1 })
      .limit(5)
      .select("name location capacity");
    res.json({ success: true, data: parkings });
  } catch (error) {
    next(error);
  }
};

exports.createSectorAdmin = async (req, res, next) => {
  try {
    const { name, email, password, sector } = req.body;
    const parking = await Parking.findOne({ name: sector, approved: true });
    if (!parking) {
      return res
        .status(400)
        .json({ success: false, message: "Secteur approuve introuvable" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Cette adresse email existe deja" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const admin = await User.create({
      name,
      email,
      password: hashed,
      role: "sector_admin",
      sector: parking.name,
    });
    const result = await User.findById(admin._id).select(
      "name email isActive sector createdAt",
    );
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.updateSectorAdmin = async (req, res, next) => {
  try {
    const { name, email, password, sector } = req.body;
    const admin = await User.findOne({
      _id: req.params.id,
      role: "sector_admin",
    });
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin de secteur introuvable",
      });
    }

    if (email && email.toLowerCase() !== admin.email) {
      const existing = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: admin._id },
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Cette adresse email existe deja",
        });
      }
      admin.email = email;
    }
    if (name) admin.name = name;
    if (sector) {
      const parking = await Parking.findOne({ name: sector, approved: true });
      if (!parking) {
        return res.status(400).json({
          success: false,
          message: "Secteur approuve introuvable",
        });
      }
      admin.sector = parking.name;
    }
    if (password) admin.password = await bcrypt.hash(password, 10);
    await admin.save();
    const result = await User.findById(admin._id).select(
      "name email isActive sector createdAt",
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.getSectorAdmins = async (req, res, next) => {
  try {
    const admins = await User.find({ role: "sector_admin" }).select(
      "name email isActive sector createdAt",
    );
    res.json({ success: true, data: admins });
  } catch (error) {
    next(error);
  }
};

exports.toggleSectorAdmin = async (req, res, next) => {
  try {
    const admin = await User.findOne({
      _id: req.params.id,
      role: "sector_admin",
    });
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin de secteur introuvable",
      });
    }
    admin.isActive = !admin.isActive;
    await admin.save();
    const result = await User.findById(admin._id).select(
      "name email isActive sector createdAt",
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.createAgent = async (req, res, next) => {
  try {
    const { name, email, password, phone, sector } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Agent already exists" });
    }
    const hashed = await bcrypt.hash(password, 10);
    const agent = await User.create({
      name,
      email,
      password: hashed,
      role: "agent",
      phone,
      sector,
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

exports.getAgents = async (req, res, next) => {
  try {
    const agents = await User.find({ role: "agent" }).select(
      "name email phone sector isActive role",
    );
    res.json({ success: true, data: agents });
  } catch (error) {
    next(error);
  }
};

exports.getAgent = async (req, res, next) => {
  try {
    const agent = await User.findById(req.params.id).select(
      "name email phone sector isActive role",
    );
    if (!agent || agent.role !== "agent") {
      return res
        .status(404)
        .json({ success: false, message: "Agent not found" });
    }
    res.json({ success: true, data: agent });
  } catch (error) {
    next(error);
  }
};

exports.updateAgent = async (req, res, next) => {
  try {
    const agent = await User.findOne({ _id: req.params.id, role: "agent" });
    if (!agent) {
      return res
        .status(404)
        .json({ success: false, message: "Agent not found" });
    }
    const { name, email, password, phone, sector, isActive } = req.body;
    if (email !== undefined) agent.email = email;
    if (name !== undefined) agent.name = name;
    if (phone !== undefined) agent.phone = phone;
    if (sector !== undefined) agent.sector = sector;
    if (isActive !== undefined) agent.isActive = isActive;
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

exports.deactivateAgent = async (req, res, next) => {
  try {
    const agent = await User.findById(req.params.id);
    if (!agent || agent.role !== "agent") {
      return res
        .status(404)
        .json({ success: false, message: "Agent not found" });
    }
    agent.isActive = false;
    await agent.save();
    res.json({ success: true, message: "Agent deactivated", data: agent });
  } catch (error) {
    next(error);
  }
};

exports.activateAgent = async (req, res, next) => {
  try {
    const agent = await User.findById(req.params.id);
    if (!agent || agent.role !== "agent") {
      return res
        .status(404)
        .json({ success: false, message: "Agent not found" });
    }
    agent.isActive = true;
    await agent.save();
    res.json({ success: true, message: "Agent activated", data: agent });
  } catch (error) {
    next(error);
  }
};

exports.approveParking = async (req, res, next) => {
  try {
    const parking = await Parking.findById(req.params.id);
    if (!parking) {
      return res
        .status(404)
        .json({ success: false, message: "Parking not found" });
    }
    parking.approved = true;
    await parking.save();
    res.json({ success: true, data: parking });
  } catch (error) {
    next(error);
  }
};
