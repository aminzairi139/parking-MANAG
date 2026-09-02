const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("../models/User");

dotenv.config();

const [email, password, ...nameParts] = process.argv.slice(2);
const name = nameParts.join(" ").trim();
if (!email || !password || !name || password.length < 6) {
  console.error(
    'Usage: npm run seed:super-admin -- email password "Nom complet" (mot de passe: 6 caracteres minimum)',
  );
  process.exit(1);
}

const run = async () => {
  await mongoose.connect(
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/parking_db",
  );
  const passwordHash = await bcrypt.hash(password, 12);
  await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    {
      name,
      email: email.toLowerCase(),
      password: passwordHash,
      role: "super_admin",
      sector: "",
      isActive: true,
    },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
  );
  console.log(`Super Admin created or updated: ${email.toLowerCase()}`);
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("Unable to seed Super Admin:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
