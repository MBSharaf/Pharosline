// @ts-check
// Aggregated results from Pharosline's real Meta ad campaigns (8 campaigns).
// Totals only — never add campaign or brand names here. Edit numbers in this file.

/**
 * @typedef {Object} AdStat
 * @property {number} value     The number to count up to
 * @property {number} decimals  Decimal places shown
 * @property {string} [prefix]
 * @property {string} [suffix]
 * @property {string} label
 */

/** @type {AdStat[]} */
export const AD_STATS = [
  { value: 4100, decimals: 0, suffix: '+', label: 'Messaging conversations' },
  { value: 8, decimals: 0, label: 'Campaigns run' },
  { value: 8.6, decimals: 1, prefix: 'EGP ', suffix: 'K', label: 'Total ad spend' },
  { value: 1.14, decimals: 2, prefix: 'EGP ', label: 'Best cost per conversation' },
];

export const AD_STATS_NOTE = 'Average cost per conversation: EGP 2.09. Real results from Meta ads, not estimates.';
