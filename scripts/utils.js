/* ─── Utility functions ────────────────────────────────── */

/**
 * Clamps a number between a minimum and maximum value.
 * @param {number} min - The lower bound.
 * @param {number} val - The value to clamp.
 * @param {number} max - The upper bound.
 * @returns {number} The clamped value.
 */
const clamp = (min, val, max) => Math.min(Math.max(val, min), max);

// Export for Node.js testing environment
if (typeof module === 'object' && typeof module.exports === 'object') {
  module.exports = { clamp };
}
