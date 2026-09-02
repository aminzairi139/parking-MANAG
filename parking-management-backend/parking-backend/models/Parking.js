const mongoose = require("mongoose");

const parkingSchema = new mongoose.Schema(
  {
    // Nom du parking
    name: {
      type: String,
      required: true,
      trim: true,
    },

    ////. Emplacement du parking
    location: {
      type: String,
      required: true,
      trim: true,
    },

    // Utilisateur qui a créé le parking
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Indique si le parking est approuvé par un administrateur
    approved: {
      type: Boolean,
      default: false,
    },

    capacity: {
      type: Number,
      default: 50,
      min: 1,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Parking", parkingSchema);
