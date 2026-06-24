/**
 * UTILITY: formatPKR
 * PURPOSE: Formats a number as PKR currency.
 * WHY: Single source of truth for currency display.
 *      Replaces inline Intl.NumberFormat everywhere.
 * @param amount - The numeric amount to format
 * @returns Formatted string like "Rs. 1,500"
 */
export function formatPKR(amount: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
