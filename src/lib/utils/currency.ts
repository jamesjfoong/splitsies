/**
 * Currency formatting utilities
 * Uses Intl.NumberFormat for generic, locale-aware formatting
 */

/**
 * Format a number as currency with the appropriate formatting
 * @param amount The amount to format
 * @param currencyCode ISO currency code (e.g., "USD", "IDR", "EUR")
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currencyCode: string = "USD"
): string {
  try {
    // Use Intl.NumberFormat for native browser formatting
    // This handles ALL currencies generically
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback if currency code is invalid
    console.warn(`Invalid currency code: ${currencyCode}`, error);
    return `${currencyCode} ${amount.toFixed(2)}`;
  }
}

/**
 * Parse a currency string to a number
 * @param currencyString String like "$10.50" or "Rp 10,000"
 * @returns Parsed number
 */
export function parseCurrency(currencyString: string): number {
  // Remove all non-numeric characters except decimal point
  const cleaned = currencyString.replace(/[^0-9.-]+/g, "");
  return Number.parseFloat(cleaned) || 0;
}
