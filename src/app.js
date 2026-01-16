const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import database connection
const connectDB = require("./config/database");

// Import routes
const portfolioRoutes = require("./routes/portfolioRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

// Initialize Express
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // Parse JSON bodies

// Single API Route
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/payment", paymentRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "API is running!",
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    database: "Connected",
    uptime: process.uptime(),
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handler
app.use((err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {});

module.exports = app;
