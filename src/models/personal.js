const mongoose = require("mongoose");

const personalSchema = new mongoose.Schema(
  {
    name: String,
    title: [String],
    about: String,
    description: String,
    no_of_projects: Number,
    phone: String,
    email: String,
    location: [String],
    exp: Number,
    contact: String,
    linkedin: String,
    github: String,
  },
  {
    collection: "portfolio_personal",
  },
);

module.exports = mongoose.model("Personal", personalSchema);
