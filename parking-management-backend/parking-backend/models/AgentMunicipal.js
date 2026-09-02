const mongoose = require("mongoose");
const User = require("./User");

// Modèle AgentMunicipal : hérite de User et ajoute les champs métier.
const agentMunicipalSchema = new mongoose.Schema(
  {
    zone: {
      type: String,
      required: true,
      trim: true,
    },
    telephone: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
);

module.exports = User.discriminator("agent", agentMunicipalSchema);
