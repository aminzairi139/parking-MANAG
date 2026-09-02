const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const mongoUri =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/parking_db";

const modelOrder = [
  "User",
  "Admin",
  "SuperAdmin",
  "AgentMunicipal",
  "Parking",
  "Reservation",
  "Vehicle",
  "Payment",
  "Penalty",
  "Ticket",
];

const loadModels = () => {
  modelOrder.forEach((modelName) => {
    require(path.join(__dirname, "models", modelName));
  });
};

const normalizeDocument = async (doc) => {
  if (!doc || !doc.password) return doc;

  if (typeof doc.password === "string" && !doc.password.startsWith("$2")) {
    doc.password = await bcrypt.hash(doc.password, 10);
  }

  return doc;
};

const ensureCollection = async (collectionName) => {
  try {
    const collections = await mongoose.connection.db
      .listCollections({ name: collectionName })
      .toArray();

    if (collections.length > 0) {
      console.log(`[seed] Collection already exists: ${collectionName}`);
      return true;
    }

    await mongoose.connection.db.createCollection(collectionName);
    console.log(`[seed] Collection created: ${collectionName}`);
    return true;
  } catch (error) {
    console.error(
      `[seed] Error on collection ${collectionName}:`,
      error.message,
    );
    return false;
  }
};

const upsertDocument = async (Model, query, doc, label) => {
  try {
    const normalizedDoc = await normalizeDocument(doc);
    const existing = await Model.findOne(query);

    if (existing) {
      if (
        normalizedDoc?.password &&
        existing.password &&
        !existing.password.startsWith("$2")
      ) {
        await Model.updateOne(
          { _id: existing._id },
          { password: normalizedDoc.password },
        );
      }

      console.log(`[seed] Document already exists: ${label}`);
      return existing;
    }

    const created = await Model.create(normalizedDoc);
    console.log(`[seed] Document added: ${label}`);
    return created;
  } catch (error) {
    console.error(`[seed] Error adding ${label}:`, error.message);
    throw error;
  }
};

const upsertRawDocument = async (collectionName, filter, document, label) => {
  try {
    const normalizedDoc = await normalizeDocument(document);
    const collection = mongoose.connection.collection(collectionName);
    const existing = await collection.findOne(filter);

    if (existing) {
      if (
        normalizedDoc.password &&
        existing.password !== normalizedDoc.password
      ) {
        await collection.updateOne(filter, {
          $set: { password: normalizedDoc.password },
        });
      }
      console.log(`[seed] Document already exists: ${label}`);
      return existing;
    }

    await collection.insertOne(normalizedDoc);
    console.log(`[seed] Document added: ${label}`);
    return normalizedDoc;
  } catch (error) {
    console.error(`[seed] Error adding ${label}:`, error.message);
    throw error;
  }
};

const seedData = async () => {
  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000,
  });

  console.log(`[seed] MongoDB connected: ${mongoUri}`);
  loadModels();

  const collectionsToEnsure = [
    "admins",
    "superadmins",
    "agentmunicipals",
    "clients",
    "users",
    "parkings",
    "reservations",
    "payments",
    "penalties",
    "tickets",
  ];

  for (const collectionName of collectionsToEnsure) {
    await ensureCollection(collectionName);
  }

  const User = mongoose.model("User");
  const Parking = mongoose.model("Parking");
  const Vehicle = mongoose.model("Vehicle");
  const Reservation = mongoose.model("Reservation");
  const Payment = mongoose.model("Payment");
  const Penalty = mongoose.model("Penalty");
  const Ticket = mongoose.model("Ticket");

  const adminUser = await upsertDocument(
    User,
    { email: "admin@gmail.com" },
    {
      name: "Admin Test",
      email: "admin@gmail.com",
      password: "1234",
      role: "admin",
      phone: "0600000000",
      isActive: true,
    },
    "User admin",
  );

  await upsertRawDocument(
    "admins",
    { email: "admin@gmail.com" },
    {
      _id: adminUser._id,
      email: "admin@gmail.com",
      name: "Admin Test",
      password: adminUser.password,
      role: "admin",
      phone: "0600000000",
      isActive: true,
    },
    "Admin collection",
  );

  if (process.env.SUPER_ADMIN_EMAIL && process.env.SUPER_ADMIN_PASSWORD) {
    const superAdminUser = await upsertDocument(
      User,
      { email: process.env.SUPER_ADMIN_EMAIL.toLowerCase() },
      {
        name: process.env.SUPER_ADMIN_NAME || "Super Admin",
        email: process.env.SUPER_ADMIN_EMAIL.toLowerCase(),
        password: process.env.SUPER_ADMIN_PASSWORD,
        role: "super_admin",
        isActive: true,
      },
      "User superadmin",
    );
    console.log(`Super Admin seeded: ${superAdminUser.email}`);
  } else {
    console.log("Super Admin skipped; use npm run seed:super-admin instead.");
  }

  const agentUser = await upsertDocument(
    User,
    { email: "agent@gmail.com" },
    {
      name: "Agent Test",
      email: "agent@gmail.com",
      password: "1234",
      role: "agent",
      phone: "0611111111",
      isActive: true,
    },
    "User agent",
  );

  await upsertRawDocument(
    "agentmunicipals",
    { email: "agent@gmail.com" },
    {
      _id: agentUser._id,
      email: "agent@gmail.com",
      name: "Agent Test",
      password: agentUser.password,
      role: "agent",
      phone: "0611111111",
      zone: "Centre",
      telephone: "0611111111",
      isActive: true,
    },
    "AgentMunicipal collection",
  );

  const clientUser = await upsertDocument(
    User,
    { email: "client@gmail.com" },
    {
      name: "Client Test",
      email: "client@gmail.com",
      password: "1234",
      role: "user",
      phone: "0622222222",
      isActive: true,
    },
    "User client",
  );

  await upsertRawDocument(
    "clients",
    { email: "client@gmail.com" },
    {
      _id: clientUser._id,
      email: "client@gmail.com",
      name: "Client Test",
      password: "1234",
      role: "user",
      phone: "0622222222",
      telephone: "0622222222",
      dureeAbonnement: 1,
      zone: "Nord",
      isActive: true,
    },
    "Client collection",
  );

  const demoUser = await upsertDocument(
    User,
    { email: "hadhemi@gmail.com" },
    {
      name: "Hadhemi",
      email: "hadhemi@gmail.com",
      password: "motdepasse1234",
      role: "user",
      isActive: true,
    },
    "User demo véhicules",
  );

  for (const registrationNumber of ["123 4567", "456 7890", "789 1234"]) {
    await upsertDocument(
      Vehicle,
      { owner: demoUser._id, registrationNumber },
      { owner: demoUser._id, registrationNumber, type: "toutes" },
      `Véhicule demo ${registrationNumber}`,
    );
  }

  const parkingCentral = await upsertDocument(
    Parking,
    { name: "Parking Central" },
    {
      name: "Parking Central",
      location: "Centre-ville",
      capacity: 50,
      approved: true,
      createdBy: adminUser._id,
    },
    "Parking Central",
  );

  await upsertRawDocument(
    "parkings",
    { name: "Parking Central" },
    {
      _id: parkingCentral._id,
      name: "Parking Central",
      location: "Centre-ville",
      capacity: 50,
      approved: true,
      createdBy: adminUser._id,
    },
    "Parking Central collection",
  );

  const parkingLafayette = await upsertDocument(
    Parking,
    { name: "Parking Lafayette" },
    {
      name: "Parking Lafayette",
      location: "Quartier Lafayette",
      capacity: 40,
      approved: true,
      createdBy: adminUser._id,
    },
    "Parking Lafayette",
  );

  await upsertRawDocument(
    "parkings",
    { name: "Parking Lafayette" },
    {
      _id: parkingLafayette._id,
      name: "Parking Lafayette",
      location: "Quartier Lafayette",
      capacity: 40,
      approved: true,
      createdBy: adminUser._id,
    },
    "Parking Lafayette collection",
  );

  const parkingNord = await upsertDocument(
    Parking,
    { name: "Parking Nord" },
    {
      name: "Parking Nord",
      location: "Zone Nord",
      capacity: 45,
      approved: true,
      createdBy: adminUser._id,
    },
    "Parking Nord",
  );

  await upsertRawDocument(
    "parkings",
    { name: "Parking Nord" },
    {
      _id: parkingNord._id,
      name: "Parking Nord",
      location: "Zone Nord",
      capacity: 45,
      approved: true,
      createdBy: adminUser._id,
    },
    "Parking Nord collection",
  );

  const parkingOuest = await upsertDocument(
    Parking,
    { name: "Parking Rue de Irak" },
    {
      name: "Parking Rue de Irak",
      location: "Rue de Irak",
      capacity: 35,
      approved: true,
      createdBy: adminUser._id,
    },
    "Parking Rue de Irak",
  );

  await upsertRawDocument(
    "parkings",
    { name: "Parking Rue de Irak" },
    {
      _id: parkingOuest._id,
      name: "Parking Rue de Irak",
      location: "Rue de Irak",
      capacity: 35,
      approved: true,
      createdBy: adminUser._id,
    },
    "Parking Rue de Irak collection",
  );

  const parkingSud = await upsertDocument(
    Parking,
    { name: "Parking Sud" },
    {
      name: "Parking Sud",
      location: "Avenue Sud",
      capacity: 30,
      approved: true,
      createdBy: adminUser._id,
    },
    "Parking Sud",
  );

  await upsertRawDocument(
    "parkings",
    { name: "Parking Sud" },
    {
      _id: parkingSud._id,
      name: "Parking Sud",
      location: "Avenue Sud",
      capacity: 30,
      approved: true,
      createdBy: adminUser._id,
    },
    "Parking Sud collection",
  );

  const operationalSectors = [
    "Parking Central",
    "Parking Lafayette",
    "Parking Rue de Irak",
    "Parking Nord",
    "Parking Sud",
  ];
  for (const [sectorIndex, sector] of operationalSectors.entries()) {
    await upsertDocument(
      User,
      { email: `admin.secteur${sectorIndex + 1}@parking.local` },
      {
        name: `Admin ${sector}`,
        email: `admin.secteur${sectorIndex + 1}@parking.local`,
        password: "Secteur123",
        role: "sector_admin",
        sector,
        isActive: true,
      },
      `Admin ${sector}`,
    );
    for (let agentIndex = 1; agentIndex <= 2; agentIndex += 1) {
      await upsertDocument(
        User,
        {
          email: `agent.secteur${sectorIndex + 1}.${agentIndex}@parking.local`,
        },
        {
          name: `Agent ${sector} ${agentIndex}`,
          email: `agent.secteur${sectorIndex + 1}.${agentIndex}@parking.local`,
          password: "Agent123",
          role: "agent",
          sector,
          isActive: true,
        },
        `Agent ${sector} ${agentIndex}`,
      );
    }
  }

  const parkingEst = await upsertDocument(
    Parking,
    { name: "Parking Est" },
    {
      name: "Parking Est",
      location: "Boulevard Est",
      capacity: 30,
      approved: true,
      createdBy: adminUser._id,
    },
    "Parking Est",
  );

  await upsertRawDocument(
    "parkings",
    { name: "Parking Est" },
    {
      _id: parkingEst._id,
      name: "Parking Est",
      location: "Boulevard Est",
      capacity: 30,
      approved: true,
      createdBy: adminUser._id,
    },
    "Parking Est collection",
  );

  const parkingGare = await upsertDocument(
    Parking,
    { name: "Parking Gare" },
    {
      name: "Parking Gare",
      location: "Zone de la gare",
      capacity: 50,
      approved: true,
      createdBy: adminUser._id,
    },
    "Parking Gare",
  );

  await upsertRawDocument(
    "parkings",
    { name: "Parking Gare" },
    {
      _id: parkingGare._id,
      name: "Parking Gare",
      location: "Zone de la gare",
      capacity: 50,
      approved: true,
      createdBy: adminUser._id,
    },
    "Parking Gare collection",
  );

  const demoParkingCentral = await upsertDocument(
    Parking,
    { name: "Parking Centre Ville", createdBy: demoUser._id },
    {
      name: "Parking Centre Ville",
      location: "Rue de la République",
      capacity: 42,
      approved: true,
      createdBy: demoUser._id,
    },
    "Parking demo Centre Ville",
  );
  await upsertDocument(
    Parking,
    { name: "Parking Port", createdBy: demoUser._id },
    {
      name: "Parking Port",
      location: "Avenue du Port",
      capacity: 60,
      approved: true,
      createdBy: demoUser._id,
    },
    "Parking demo Port",
  );
  await upsertDocument(
    Parking,
    { name: "Parking Gare", createdBy: demoUser._id },
    {
      name: "Parking Gare",
      location: "Place de la Gare",
      capacity: 35,
      approved: true,
      createdBy: demoUser._id,
    },
    "Parking demo Gare",
  );

  const demoReservations = [
    ["DEMO-OVERDUE", "123 4567", -18],
    ["DEMO-ALERT", "456 7890", 12],
    ["DEMO-REMAINING", "789 1234", 80],
  ];
  for (const [id, registrationNumber, minutes] of demoReservations) {
    await upsertDocument(
      Reservation,
      { id },
      {
        id,
        typeReservation: "horaire",
        numImmatriculation: registrationNumber,
        nomConducteur: "Hadhemi",
        marque: "Toyota",
        maisonVehicule: "Toyota",
        dateDebut: new Date(Date.now() - 3600000),
        dateFin: new Date(Date.now() + minutes * 60000),
        statut: "confirmé",
        client: demoUser._id,
        parking: demoParkingCentral._id,
        montant: 10,
      },
      `Réservation demo ${registrationNumber}`,
    );
  }

  const reservationId = `RES-${Date.now()}`;
  const reservation = await upsertDocument(
    Reservation,
    { id: reservationId },
    {
      id: reservationId,
      typeReservation: "journalier",
      numImmatriculation: "AB-123-CD",
      nomConducteur: "Client Test",
      marque: "Toyota",
      couleur: "Blanche",
      maisonVehicule: "Toyota",
      dateDebut: new Date(),
      dateFin: new Date(Date.now() + 86400000),
      statut: "confirmé",
      client: clientUser._id,
      parking: parkingCentral._id,
      montant: 1500,
    },
    "Reservation",
  );

  await upsertRawDocument(
    "reservations",
    { id: reservation.id },
    reservation.toObject(),
    "Reservation collection",
  );

  const paymentId = `PAY-${Date.now()}`;
  const payment = await upsertDocument(
    Payment,
    { transactionId: paymentId },
    {
      id: paymentId,
      montant: 1500,
      modePaiement: "carte",
      datePaiement: new Date(),
      reservation: reservation._id,
      client: clientUser._id,
      transactionId: paymentId,
      statut: "confirmé",
      paymentDetails: { derniersChiffres: "4242" },
    },
    "Payment",
  );

  await upsertRawDocument(
    "payments",
    { transactionId: payment.transactionId },
    payment.toObject(),
    "Payment collection",
  );

  const penaltyId = `PEN-${Date.now()}`;
  const penalty = await upsertDocument(
    Penalty,
    { id: penaltyId },
    {
      id: penaltyId,
      taux: 50,
      motif: "Stationnement illégal",
      dateGeneration: new Date(),
      agent: agentUser._id,
      client: clientUser._id,
      statut: "non_payée",
      plateNumber: "AB-123-CD",
    },
    "Penalty",
  );

  await upsertRawDocument(
    "penalties",
    { id: penalty.id },
    penalty.toObject(),
    "Penalty collection",
  );

  const ticketId = `TKT-${Date.now()}`;
  const ticket = await upsertDocument(
    Ticket,
    { id: ticketId },
    {
      id: ticketId,
      duree: 2,
      telephone: "0622222222",
      dateAchat: new Date(),
      client: clientUser._id,
      statut: "actif",
    },
    "Ticket",
  );

  await upsertRawDocument(
    "tickets",
    { id: ticket.id },
    ticket.toObject(),
    "Ticket collection",
  );

  console.log("[seed] Seeding finished successfully.");
  process.exit(0);
};

seedData().catch((error) => {
  console.error("[seed] General error:", error);
  process.exit(1);
});
