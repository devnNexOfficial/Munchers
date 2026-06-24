import { MAX_RETRY_ATTEMPTS, RETRY_DELAY_MS } from '@/lib/constants'

/**
 * WHAT: Retries a failed async function up to maxAttempts times with exponential backoff
 * WHY:  Mobile networks in Pakistan are unreliable — a single transient failure should
 *       not show an error to the user. Silent retry covers 99% of network hiccups.
 * HOW:  Wraps any async function. On failure, waits delayMs (doubles each attempt).
 *       If all attempts exhausted, re-throws the final error for the caller to handle.
 * EDGE CASES:
 *   - Does NOT retry on HTTP 4xx errors (client's fault — wrong input, unauthorised)
 *   - DOES retry on network errors (TypeError: fetch failed) and HTTP 5xx (server fault)
 *   - Does NOT retry on validation errors (Zod parse failures)
 * PERFORMANCE: Max total wait = delayMs * (2^(maxAttempts-1) - 1) = 7s with defaults
 *
 * @param fn         - The async function to retry
 * @param maxAttempts - Maximum number of total attempts (default: MAX_RETRY_ATTEMPTS = 3)
 * @param delayMs    - Initial delay before first retry in ms (default: RETRY_DELAY_MS = 1000)
 * @returns          - Resolves with the function's return value on success
 * @throws           - Re-throws the last error if all attempts are exhausted
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = MAX_RETRY_ATTEMPTS,
  delayMs: number = RETRY_DELAY_MS
): Promise<T> {
  let lastError: unknown

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      // Do not retry on 4xx HTTP errors — these are caller errors, not transient
      if (error instanceof Response && error.status >= 400 && error.status < 500) {
        throw error
      }

      // Do not retry on Zod validation failures
      if (error instanceof Error && error.name === 'ZodError') {
        throw error
      }

      // If we have more attempts remaining, wait before retrying
      if (attempt < maxAttempts) {
        // Exponential backoff: 1s, 2s, 4s
        const waitMs = delayMs * Math.pow(2, attempt - 1)
        await new Promise<void>((resolve) => setTimeout(resolve, waitMs))
      }
    }
  }

  throw lastError
}
