// src/config/index.js

// This line loads the variables from your .env file into process.env
require('dotenv').config();

const config = {
  databaseUrl: process.env.DATABASE_URL,
  csvFilePath: process.env.CSV_FILE_PATH,
  port: process.env.PORT || 3000, // Use port 3000 as a default
};

// Error handling: Exit the app if critical env variables are missing
if (!config.databaseUrl) {
  console.error("FATAL ERROR: DATABASE_URL is not defined in .env file.");
  process.exit(1); // Exit the process with an error code
}

if (!config.csvFilePath) {
  console.error("FATAL ERROR: CSV_FILE_PATH is not defined in .env file.");
  process.exit(1);
}

module.exports = config;