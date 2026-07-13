const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");

dotenv.config();

const authRoutes = require("./routes/auth.routes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Health Check
app.get("/", (req, res) => {
  res.send("PulseCRM Backend Running 🚀");
});

// Test API
app.get("/api/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Frontend Connected Successfully",
  });
});

// Authentication Routes
app.use("/api/auth", authRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

module.exports = app;