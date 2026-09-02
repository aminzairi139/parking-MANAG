const mongoose = require("mongoose");
const User = require("./User");

// Modèle Admin : hérite de User sans champs supplémentaires spécifiques.
const adminSchema = new mongoose.Schema({}, { timestamps: true });

module.exports = User.discriminator("admin", adminSchema);
