const mongoose = require("mongoose");
const User = require("./User");

/// Modèle SuperAdmin : hérite de User sans champs supplémentaires spécifiques.
const superAdminSchema = new mongoose.Schema({}, { timestamps: true });

module.exports = User.discriminator("superadmin", superAdminSchema);
