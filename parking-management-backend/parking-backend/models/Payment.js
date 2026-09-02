const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    montant: { type: Number, required: true },
    modePaiement: {
      type: String,
      enum: ["carte", "d17"],
      required: true,
    },
    datePaiement: {
      type: Date,
      default: Date.now,
    },
    reservation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reservation",
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    statut: {
      type: String,
      enum: ["pending", "confirmé", "échoué"],
      default: "pending",
    },
    /// Ne jamais stocker ici le CVV ni le numéro complet de la carte.
    // /Utiliser des objets du type :
    // /{ derniersChiffres: "3456" } ou { telephoneD17: "50123456" }
    paymentDetails: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true },
);

paymentSchema.methods.valider = function () {
  this.statut = "confirmé";
  return this.save();
};

module.exports = mongoose.model("Payment", paymentSchema);
