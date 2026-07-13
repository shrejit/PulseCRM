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

// Authentication Routes
app.use("/api/auth", authRoutes);

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

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;