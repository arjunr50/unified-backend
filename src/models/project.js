const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    image: [String],
    url: String,
    tech_stack: [String],
    category: String,
  },
  {
    collection: "portfolio_projects",
  }
);

module.exports = mongoose.model("Project", projectSchema);
