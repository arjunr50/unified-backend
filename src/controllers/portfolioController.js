const Personal = require("../models/personal");
const Project = require("../models/project");
const Technology = require("../models/technology");

exports.getPortfolioData = async (req, res) => {
  try {
    // Fetch all data from 3 collections in parallel
    const [personal, projects, technology] = await Promise.allSettled([
      Personal.findOne().sort({ createdAt: -1 }),
      Project.find().sort({ project_id: 1 }),
      Technology.find().sort({ tech_id: 1 }),
    ]);

    // Handle results
    const data = {
      personal: personal.status === "fulfilled" ? personal.value : null,
      projects: projects.status === "fulfilled" ? projects.value : [],
      technology: technology.status === "fulfilled" ? technology.value : [],
    };

    // Check if data exists
    if (
      !data.personal &&
      data.projects.length === 0 &&
      data.technology.length === 0
    ) {
      return res.status(404).json({
        success: false,
        description: "No portfolio data found in database",
        suggestion: "Please check if data is inserted in collections",
      });
    }

    res.status(200).json({
      success: true,
      description: "Portfolio data retrieved successfully",
      timestamp: new Date().toISOString(),
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      description: "Failed to fetch portfolio data",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Individual endpoints (optional)
exports.getPersonal = async (req, res) => {
  try {
    const personal = await Personal.findOne().sort({ createdAt: -1 });
    if (!personal) {
      return res.status(404).json({
        success: false,
        description: "No personal data found",
      });
    }
    res.json({
      success: true,
      description: "Personal data retrieved successfully",
      data: personal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      description: error.message,
    });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ project_id: -1 });
    res.json({
      success: true,
      description: `Retrieved ${projects.length} project(s)`,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      description: error.message,
    });
  }
};

exports.getTechnology = async (req, res) => {
  try {
    const technology = await Technology.find().sort({ tech_id: 1 });
    res.json({
      success: true,
      description: `Retrieved ${technology.length} technology item(s)`,
      count: technology.length,
      data: technology,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      description: error.message,
    });
  }
};
