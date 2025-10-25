// src/app.js

const express = require('express');
const app = express();
const mainRouter = require('./routes/index'); // We'll create this file next

// Middleware to parse incoming JSON payloads
app.use(express.json());

// Main entry point for all API routes
app.use('/api', mainRouter);

// A simple root route for testing if the server is up
app.get('/', (req, res) => {
  res.send('Kelp CSV Uploader API is running...');
});

// Basic error handling middleware (optional but good practice)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

module.exports = app;