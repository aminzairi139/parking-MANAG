const mongoose = require("mongoose");

const penaltySchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    taux: { type: Number, required: true },
    motif: { type: String, required: true, trim: true },
    dateGeneration: {
      type: Date,
      default: Date.now,
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    statut: {
      type: String,
      enum: ["non_payée", "payée"],
      default: "non_payée",
    },
    plateNumber: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Penalty", penaltySchema);
