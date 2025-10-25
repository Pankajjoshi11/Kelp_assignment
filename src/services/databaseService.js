// src/services/databaseService.js

const { Pool } = require('pg');
const config = require('../config');

const pool = new Pool({
  connectionString: config.databaseUrl,
});

// ADD THIS NEW FUNCTION
const checkDatabaseName = async () => {
  try {
    const res = await pool.query('SELECT current_database()');
    console.log(`>>>>>> App is connected to database: "${res.rows[0].current_database}" <<<<<<`);
  } catch (err) {
    console.error('Failed to check database name:', err);
  }
};

module.exports = {
  query: (text, params) => pool.query(text, params),

  // EXPORT THE NEW FUNCTION
  checkDatabaseName,

  testConnection: async () => {
    try {
      await pool.query('SELECT NOW()');
      console.log('Database connected successfully.');
    } catch (err) {
      console.error('Database connection failed:', err.stack);
      process.exit(1);
    }
  }
};