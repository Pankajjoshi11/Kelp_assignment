// src/controllers/uploadController.js

const uploadService = require('../services/uploadService');

/**
 * @controller POST /api/upload
 * Triggers the CSV processing service to run in the background.
 */
const triggerUpload = (req, res, next) => {
  try {
    // We call processCsv() but DO NOT 'await' it.
    // This allows it to run in the background while we send
    // an immediate response to the user.
    uploadService.processCsv();

    // Send a 202 "Accepted" status.
    // This tells the client "I've received your request and am working on it."
    res.status(202).json({
      message: "CSV processing started. Check server logs for progress and completion report."
    });
    
  } catch (err) {
    // This would catch any *immediate* errors (e.g., if uploadService failed to load)
    console.error("Error triggering upload:", err.message);
    next(err); // Pass the error to the main error handler
  }
};

module.exports = {
  triggerUpload,
};  