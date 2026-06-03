// ── System-wide currency configuration ───────────────────────────────────────
// All prices are stored in USD as the base currency.
// Display conversion (if ever needed) must be applied here — never at the DB layer.

export const CURRENCY = {
  code:   "USD",   // ISO 4217
  symbol: "$",
};

/**
 * Format a price for display.
 *
 * @param {number|string} amount  - The price value (stored as integer USD cents or whole dollars)
 * @param {object}        opts
 * @param {boolean}       opts.showCode  - Append ISO code, e.g. "$120 USD"  (default: false)
 * @param {string}        opts.freeLabel - Label when price is 0 / falsy        (default: "Free")
 * @returns {string}
 */
export function formatPrice(amount, { showCode = false, freeLabel = "Free" } = {}) {
  const num = Number(amount);
  if (!amount || isNaN(num) || num <= 0) return freeLabel;
  const formatted = num.toLocaleString("en-US");
  return showCode
    ? `${CURRENCY.symbol}${formatted} ${CURRENCY.code}`
    : `${CURRENCY.symbol}${formatted}`;
}
