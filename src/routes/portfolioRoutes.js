const express = require("express");
const router = express.Router();
const portfolioController = require("../controllers/portfolioController");

// Single API endpoint for all portfolio data
router.get("/", portfolioController.getPortfolioData);

// Individual endpoints
router.get("/personal", portfolioController.getPersonal);
router.get("/projects", portfolioController.getProjects);
router.get("/technology", portfolioController.getTechnology);

module.exports = router;
