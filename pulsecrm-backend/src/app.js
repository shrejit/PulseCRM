const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");

dotenv.config();

const swaggerSpec = require("./config/swagger");

const authRoutes = require("./routes/auth.routes");
const companyRoutes = require("./routes/company.routes");
const teamRoutes = require("./routes/team.routes");
const userRoutes = require("./routes/user.routes");
const invitationRoutes = require("./routes/invitation.routes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Health Check
app.get("/", (req, res) => {
  res.send("PulseCRM Backend Running 🚀");
});

// Test Route
app.get("/api/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Frontend Connected Successfully",
  });
});

// API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api-docs.json", (req, res) => res.json(swaggerSpec));

// Authentication Routes
app.use("/api/auth", authRoutes);

// Organization Routes
app.use("/api/companies", companyRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/users", userRoutes);
app.use("/api/invitations", invitationRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;
