const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    duree: {
      type: Number,
      required: true,
    },
    telephone: {
      type: String,
      required: true,
      trim: true,
    },
    dateAchat: {
      type: Date,
      default: Date.now,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    statut: {
      type: String,
      enum: ["actif", "expiré", "annulé"],
      default: "actif",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Ticket", ticketSchema);
