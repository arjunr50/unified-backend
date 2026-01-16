const Personal = require("../models/personal");
const Project = require("../models/project");
const Technology = require("../models/technology");

exports.getPortfolioData = async (req, res) => {
  try {
    // Fetch all data from 3 collections in parallel
    const [personal, projects, technologies] = await Promise.allSettled([
      Personal.findOne().sort({ createdAt: -1 }),
      Project.find().sort({ project_id: 1 }),
      Technology.find().sort({ tech_id: 1 }),
    ]);

    // Handle results
    const data = {
      personal: personal.status === "fulfilled" ? personal.value : null,
      projects: projects.status === "fulfilled" ? projects.value : [],
      technologies:
        technologies.status === "fulfilled" ? technologies.value : [],
    };

    // Check if data exists
    if (
      !data.personal &&
      data.projects.length === 0 &&
      data.technologies.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message: "No portfolio data found in database",
        suggestion: "Please check if data is inserted in collections",
      });
    }

    res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch portfolio data",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Individual endpoints (optional)
exports.getPersonal = async (req, res) => {
  try {
    const personal = await Personal.findOne().sort({ createdAt: -1 });
    res.json({ success: true, data: personal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ project_id: -1 });
    res.json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTechnologies = async (req, res) => {
  try {
    const technologies = await Technology.find().sort({ tech_id: 1 });
    res.json({ success: true, count: technologies.length, data: technologies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
