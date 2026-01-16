const mongoose = require("mongoose");
const logger = require("../utils/logger");
require("dotenv").config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    logger.info("Connected successfully", {
      database: conn.connection.name,
      environment: process.env.NODE_ENV,
    });

    return conn;
  } catch (error) {
    logger.error("Connection failed", {
      error: error.message,
      code: error.code,
      stack: error.stack,
      uri: process.env.MONGODB_URI ? "Set" : "Not set", // Don't log actual URI for security
    });
    process.exit(1);
  }
};

module.exports = connectDB;
