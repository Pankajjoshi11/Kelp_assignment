// src/services/reportService.js

const db = require('./databaseService');

/**
 * Calculates the percentage distribution for each age group.
 * @param {number} count - The count for a specific age group.
 * @param {number} total - The total number of users.
 * @returns {number} - The calculated percentage.
 */
const calculatePercentage = (count, total) => {
  if (total === 0) {
    return 0; // Avoid division by zero
  }
  return ((count / total) * 100);
};

/**
 * Generates and prints the age distribution report to the console.
 */
const generateReport = async () => {
  console.log('Calculating age distribution...');
  
  const queryText = `
    SELECT
      COUNT(*) AS total_users,
      SUM(CASE WHEN age < 20 THEN 1 ELSE 0 END) AS group_lt_20,
      SUM(CASE WHEN age >= 20 AND age <= 40 THEN 1 ELSE 0 END) AS group_20_40,
      SUM(CASE WHEN age > 40 AND age <= 60 THEN 1 ELSE 0 END) AS group_40_60,
      SUM(CASE WHEN age > 60 THEN 1 ELSE 0 END) AS group_gt_60
    FROM public.users;
  `;

  try {
    const { rows } = await db.query(queryText);
    if (rows.length === 0) {
      console.log('No data found to generate report.');
      return;
    }

    const stats = rows[0];
    const total = parseInt(stats.total_users, 10);

    // Get percentages, rounded to the nearest whole number as in the example
    const pct_lt_20 = calculatePercentage(stats.group_lt_20, total).toFixed(0);
    const pct_20_40 = calculatePercentage(stats.group_20_40, total).toFixed(0);
    const pct_40_60 = calculatePercentage(stats.group_40_60, total).toFixed(0);
    const pct_gt_60 = calculatePercentage(stats.group_gt_60, total).toFixed(0);

    // Print the report in the exact format requested
    console.log('\n--- Age Distribution Report ---');
    console.log('"Age-Group","% Distribution"');
    console.log(`"< 20","${pct_lt_20}"`);
    console.log(`"20 to 40","${pct_20_40}"`);
    console.log(`"40 to 60","${pct_40_60}"`);
    console.log(`"> 60","${pct_gt_60}"`);
    console.log('-------------------------------\n');

  } catch (err) {
    console.error('Error generating age report:', err.stack);
  }
};

module.exports = {
  generateReport
};