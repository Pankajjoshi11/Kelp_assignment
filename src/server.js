// src/server.js

const app = require('./app');
const config = require('./config');
const db = require('./services/databaseService');

const startServer = async () => {
  try {
    // Test the database connection first
    await db.testConnection();

    // ADD THIS LINE TO LOG THE DB NAME
    await db.checkDatabaseName();

    // Start the Express server
    app.listen(config.port, () => {
      console.log(`Server listening on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();