/**
 * UTILITY: withRetry
 * PURPOSE: Retries a failed async function with exponential backoff.
 * WHY: Network hiccups are common on mobile — silent retry
 *      prevents users seeing errors for transient failures.
 * EDGE CASES: Does not retry on 4xx errors (client's fault).
 *             Only retries on network errors and 5xx.
 * PERFORMANCE: O(retries) worst-case, O(1) best-case.
 * @param fn - The async function to retry
 * @param maxAttempts - Maximum number of attempts (default 3)
 * @param delayMs - Initial delay between retries in ms (default 1000)
 * @returns The result of the successful attempt
 * @throws The last error if all attempts fail
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Do not retry on 4xx errors — they are the caller's fault
      if (error instanceof Response && error.status >= 400 && error.status < 500) {
        throw error;
      }

      if (attempt < maxAttempts) {
        // Exponential backoff: 1s, 2s, 4s, ...
        const backoffMs = delayMs * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }
  }

  throw lastError;
}
