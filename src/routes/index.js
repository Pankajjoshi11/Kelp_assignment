// src/routes/index.js

const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');

/**
 * @route POST /api/upload
 * @description Triggers the CSV file processing.
 * @access Public
 */
router.post('/upload', uploadController.triggerUpload);

module.exports = router;