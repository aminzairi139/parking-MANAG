const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      trim: true,
    },

    typeReservation: {
      type: String,
      enum: ["horaire", "journalier", "mensuel", "annuel"],
      required: true,
    },

    registrationRegion: {
      type: String,
      enum: ["TN", "RS", "Autre"],
      default: "TN",
    },

    numImmatriculation: {
      type: String,
      required: true,
      trim: true,
    },

    nomConducteur: {
      type: String,
      required: true,
      trim: true,
    },

    modeleVehicule: {
      type: String,
      trim: true,
    },

    typeVehicule: {
      type: String,
      enum: [
        "شعبية",
        "véhicule sportif",
        "2*4",
        "4*4",
        "électrique",
        "hybride",
      ],
    },

    marque: {
      type: String,
      required: true,
      trim: true,
    },

    couleur: {
      type: String,
      trim: true,
    },

    maisonVehicule: {
      type: String,
      trim: true,
    },

    dateDebut: {
      type: Date,
      required: true,
    },

    dateFin: {
      type: Date,
      required: true,
    },

    statut: {
      type: String,
      enum: ["en_attente", "confirmé", "annulé", "terminé"],
      default: "en_attente",
    },

    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    parking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Parking",
      required: true,
    },

    montant: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

reservationSchema.methods.reserver = function () {
  this.statut = "confirmé";
  return this.save();
};

module.exports = mongoose.model("Reservation", reservationSchema);