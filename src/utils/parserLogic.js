// src/utils/parserLogic.js

/**
 * A helper function to automatically convert string values to numbers or booleans.
 * @param {string} value - The value from the CSV.
 * @returns {string|number|boolean} - The converted value.
 */
const autoConvertValue = (value) => {
  if (value === null || value === undefined) return null;

  // Check if it's a number (handles integers and floats)
  // Check for non-empty strings before isNaN
  if (value && !isNaN(value) && !isNaN(parseFloat(value))) {
    return parseFloat(value);
  }
  
  // Check for booleans
  if (value.toLowerCase() === 'true') return true;
  if (value.toLowerCase() === 'false') return false;

  // Return the original string if no conversion
  return value;
};

/**
 * Sets a value on a nested object using a dot-notation path.
 * This function modifies the object in place.
 * @param {object} obj - The object to modify.
 * @param {string} path - The dot-notation path (e.g., "address.line1").
 * @param {any} value - The value to set.
 */
const deepSet = (obj, path, value) => {
  const keys = path.split('.');
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    // Create a new nested object if it doesn't exist
    if (current[key] === undefined || current[key] === null) {
      current[key] = {};
    }
    current = current[key];
  }

  // Set the final value
  current[keys[keys.length - 1]] = autoConvertValue(value);
};

/**
 * Parses a single line of CSV text into a nested JSON object.
 * @param {string} line - The raw CSV line string.
 * @param {Array<string>} headers - The array of header strings.
 * @returns {object} - The parsed JSON object.
 */
const parseCsvLine = (line, headers) => {
  const obj = {};
  
  // Assumption: Values in the CSV do not contain commas.
  const values = line.split(',');

  headers.forEach((header, index) => {
    if (values[index] !== undefined) {
      deepSet(obj, header, values[index].trim());
    }
  });

  return obj;
};

/**
 * Maps the parsed JSON object to the structure required by the 'users' database table.
 * @param {object} jsonObj - The fully parsed JSON object.
 * @returns {Array<any>} - An array of values ready for the SQL INSERT query.
 */
const mapToDbRow = (jsonObj) => {
  // 1. Get the mandatory fields
  const { name, age, address } = jsonObj;

  // 2. Format the 'name' field as required
  const fullName = `${name.firstName || ''} ${name.lastName || ''}`.trim();

  // 3. Create the 'additional_info' JSON by cloning and removing the main fields
  const additional_info = { ...jsonObj };
  delete additional_info.name;
  delete additional_info.age;
  delete additional_info.address;

  // 4. Return the values in the correct order for our INSERT query
  return [
    fullName,
    age || null,
    address || null, // Handle cases where address might be missing
    additional_info,
  ];
};

module.exports = {
  parseCsvLine,
  mapToDbRow,
};