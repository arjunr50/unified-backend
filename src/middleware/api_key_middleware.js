const verifyApiKey = (req, res, next) => {
  try {
    const appId = req.headers["x-api-key"] || req.headers["x-app-id"];

    if (!appId) {
      return res.status(401).json({
        success: false,
        description: "Application ID required (X-API-Key header)",
      });
    }

    // Load allowed app IDs from .env
    const allowedAppIds = process.env.APP_IDS
      ? process.env.APP_IDS.split(",").map((id) => id.trim())
      : [];

    if (!allowedAppIds.includes(appId)) {
      return res.status(401).json({
        success: false,
        description: "Invalid Application ID",
      });
    }

    req.appId = appId; // Pass to controller
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      description: "Application ID verification failed",
    });
  }
};

module.exports = verifyApiKey;
