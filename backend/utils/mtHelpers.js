const logger = require('./logger');

/**
 * Validate symbol format
 * @param {string} symbol - Trading symbol
 * @returns {boolean} - True if valid
 */
function isValidSymbol(symbol) {
  if (!symbol || typeof symbol !== 'string') return false;
  // Basic validation - adjust according to your needs
  return symbol.length >= 3 && symbol.length <= 12 && 
         /^[A-Z]+$/.test(symbol);
}

/**
 * Validate trade volume
 * @param {number} volume - Trade volume
 * @param {string} symbol - Trading symbol
 * @returns {boolean} - True if valid
 */
function isValidVolume(volume, symbol) {
  const numericVolume = Number(volume);
  if (isNaN(numericVolume)) return false;
  
  // Basic validation - adjust according to your broker's requirements
  if (symbol.includes('XAU') || symbol.includes('GOLD')) {
    return numericVolume >= 0.01 && numericVolume <= 100;
  }
  return numericVolume >= 0.1 && numericVolume <= 100;
}

/**
 * Normalize symbol name
 * @param {string} symbol - Trading symbol
 * @returns {string} - Normalized symbol
 */
function normalizeSymbol(symbol) {
  if (!symbol) return '';
  // Remove any prefixes/suffixes your broker might add
  return symbol.replace(/^MT:/, '').replace(/\.\w+$/, '').toUpperCase();
}

/**
 * Calculate position size based on risk percentage
 * @param {number} balance - Account balance
 * @param {number} riskPercent - Risk percentage (1-100)
 * @param {number} pips - Stop loss in pips
 * @param {string} symbol - Trading symbol
 * @returns {number} - Calculated volume
 */
function calculatePositionSize(balance, riskPercent, pips, symbol) {
  // Simplified calculation - adjust based on your exact requirements
  const riskAmount = balance * (riskPercent / 100);
  const pipValue = symbol.endsWith('JPY') ? 0.01 : 0.0001;
  const volume = riskAmount / (pips * pipValue);
  
  return parseFloat(volume.toFixed(2));
}

module.exports = {
  isValidSymbol,
  isValidVolume,
  normalizeSymbol,
  calculatePositionSize
};