const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const agentRoutes = require("./routes/agentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const statsRoutes = require("./routes/statsRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const reservationRoutes = require("./routes/reservationRoutes");
const parkingRoutes = require("./routes/parkingRoutes");
const authController = require("./controllers/authController");
const config = require("./config/config");
const { adminCreationLimiter } = require("./middleware/rateLimit");
const errorHandler = require("./middleware/errorHandler");

dotenv.config();
const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin: config.nodeEnv === "production" ? config.frontendUrl : true,
    credentials: true,
  }),
);
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false, limit: "100kb" }));

const loadModels = () => {
  const modelsDir = path.join(__dirname, "models");
  const modelFiles = fs
    .readdirSync(modelsDir)
    .filter((file) => file.endsWith(".js"));

  modelFiles.forEach((file) => {
    try {
      require(path.join(modelsDir, file));
      console.log(`[models] Chargé: ${file}`);
    } catch (error) {
      console.error(
        `[models] Erreur lors du chargement de ${file}:`,
        error.message,
      );
    }
  });
};

const startServer = async () => {
  await connectDB();
  loadModels();

  app.use("/api/auth", authRoutes);
  app.post("/api/register", authController.register);
  app.use("/api/users", userRoutes);
  app.use("/api/agents", agentRoutes);
  app.use("/api/admin", adminRoutes);
  app.use(
    "/api/admins",
    (req, res, next) =>
      req.method === "POST" ? adminCreationLimiter(req, res, next) : next(),
    adminRoutes,
  );
  app.use("/api/stats", statsRoutes);
  app.use("/api/vehicles", vehicleRoutes);
  app.use("/api/reservations", reservationRoutes);
  app.use("/api/parkings", parkingRoutes);

  app.get("/", (req, res) => {
    res.json({ success: true, message: "Parking backend is running" });
  });

  app.use(errorHandler);

  const PORT = config.port;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
