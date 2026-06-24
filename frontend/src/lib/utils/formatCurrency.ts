/**
 * WHAT: Formats a number as Pakistani Rupees (PKR) currency string
 * WHY:  Replaces inconsistent `Rs. ${price}` and `PKR ${price}` strings
 *       throughout the codebase with one consistent, locale-aware formatter.
 *       Intl.NumberFormat correctly handles thousands separators and rounding.
 * HOW:  Call formatPKR(price) anywhere a price needs to be displayed.
 * EDGE CASES: NaN and negative values are passed through — callers should
 *             ensure they pass valid non-negative numbers.
 * PERFORMANCE: Intl.NumberFormat is cached internally by V8; no memoization needed.
 *
 * @param amount - The price in PKR (must be a finite number)
 * @returns Formatted string e.g. "PKR 1,500" or "PKR 0"
 */
export function formatPKR(amount: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * WHAT: Formats a countdown in milliseconds as MM:SS
 * WHY:  Countdown timers appear in OrderTrackerPage and GlobalOrderTimer —
 *       centralising the format prevents duplicate logic.
 * HOW:  Pass remaining milliseconds; returns "--:--" if null.
 * EDGE CASES: Handles ms = 0 (shows 0:00), negative ms is clamped to 0.
 *
 * @param ms - Remaining milliseconds, or null if unknown
 * @returns Formatted string e.g. "12:34" or "--:--"
 */
export function formatCountdown(ms: number | null): string {
  if (ms === null) return '--:--'
  const totalSeconds = Math.ceil(Math.max(0, ms) / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
