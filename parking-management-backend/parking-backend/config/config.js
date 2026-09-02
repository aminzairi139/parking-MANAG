const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const required = ["JWT_SECRET"];
if (process.env.NODE_ENV === "production") {
  required.push("MONGODB_URI", "FRONTEND_URL");
}

const missing = required.filter((name) => !process.env[name]);
if (missing.length) {
  throw new Error(
    `Missing required environment variables: ${missing.join(", ")}`,
  );
}
if (
  process.env.NODE_ENV === "production" &&
  process.env.JWT_SECRET.length < 32
) {
  throw new Error(
    "JWT_SECRET must contain at least 32 characters in production",
  );
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/parking_db",
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE || "1d",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
};
