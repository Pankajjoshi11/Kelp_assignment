// src/services/uploadService.js

const fs = require('fs');
const readline = require('readline');
const config = require('../config');
const db = require('./databaseService');
const parser = require('../utils/parserLogic');
const reportService = require('./reportService'); // We will create this next

const BATCH_SIZE = 1000; // Insert 1000 rows at a time

/**
 * Inserts a batch of rows into the database using a single query.
 * @param {Array<Array<any>>} rows - An array of rows to insert.
 */
const insertBatch = async (rows) => {
  if (rows.length === 0) return;

  // 1. Create the placeholder string: ($1, $2, $3, $4), ($5, $6, $7, $8), ...
  let paramIndex = 1;
  const valuePlaceholders = rows.map(row => {
    // Each row has 4 columns: name, age, address, additional_info
    return `($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`;
  }).join(', ');

  // 2. Create the full query text
  const queryText = `
    INSERT INTO public.users (name, age, address, additional_info)
    VALUES ${valuePlaceholders}
  `;

  // 3. Flatten the rows array from [[r1c1, r1c2], [r2c1, r2c2]] to [r1c1, r1c2, r2c1, r2c2]
  const values = rows.flat();

  try {
    await db.query(queryText, values);
    console.log(`Successfully inserted batch of ${rows.length} rows.`);
  } catch (err) {
    console.error('Error inserting batch:', err.stack);
    // In a real app, you might add this batch to a retry queue
  }
};

/**
 * Internal function (wrapped in a Promise) to handle the stream processing.
 */
const _processFile = () => {
  return new Promise((resolve, reject) => {
    const fileStream = fs.createReadStream(config.csvFilePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity // Handle all types of line endings
    });

    let headers = [];
    let batch = [];
    let lineCounter = 0;

    // Handle file read errors
    fileStream.on('error', (err) => {
      reject(new Error(`File stream error: ${err.message}`));
    });
    
    // Handle readline errors
    rl.on('error', (err) => {
      reject(new Error(`Readline error: ${err.message}`));
    });

    // Process file line by line
    rl.on('line', async (line) => {
      try {
        lineCounter++;
        // First line is headers
        if (lineCounter === 1) {
          headers = line.split(',');
          return;
        }

        // Parse the line and map it to a DB row
        const jsonObject = parser.parseCsvLine(line, headers);
        const dbRow = parser.mapToDbRow(jsonObject);
        batch.push(dbRow);

        // When batch is full, pause the stream, insert, and resume
        if (batch.length >= BATCH_SIZE) {
          rl.pause(); // Stop reading new lines
          await insertBatch(batch);
          batch = []; // Clear the batch
          rl.resume(); // Continue reading lines
        }
      } catch (err) {
        console.error(`Error processing line ${lineCounter}: ${err.message}`);
        // In this setup, we'll skip the bad line and continue
        // You could also reject() here to stop the whole process
      }
    });

    // End of file stream
    rl.on('close', async () => {
      try {
        console.log('File reading finished.');
        // Insert any remaining records
        if (batch.length > 0) {
          await insertBatch(batch);
        }
        
        console.log('All data uploaded. Generating age report...');
        // Run the final report
        await reportService.generateReport();
        resolve('CSV processing and reporting complete.');
      } catch (err) {
        reject(new Error(`Error on final batch/report: ${err.message}`));
      }
    });
  });
};

/**
 * Main exported function. This is "fire and forget."
 * The controller calls this, and it runs in the background.
 */
const processCsv = () => {
  console.log('Starting CSV processing...');

  // We don't "await" this in the controller, so we handle
  // the promise completion and errors here with .then() and .catch()
  _processFile()
    .then((message) => {
      console.log(message);
    })
    .catch((err) => {
      console.error('FATAL ERROR during CSV processing:', err);
    });
};

module.exports = {
  processCsv
};