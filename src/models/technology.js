const mongoose = require("mongoose");

const technologySchema = new mongoose.Schema(
  {
    name: String,
    icon: String,
    category: String,
  },
  {
    collection: "portfolio_technology",
  }
);

module.exports = mongoose.model("Technology", technologySchema);
