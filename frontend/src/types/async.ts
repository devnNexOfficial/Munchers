/**
 * WHAT: Discriminated union type for any asynchronous data-fetching operation
 * WHY:  Replaces scattered `{ loading: boolean; error: string | null; data: T | null }`
 *       patterns with a single typed union that TypeScript can exhaustively check.
 *       Components can switch on `status` and TypeScript narrows the type.
 * HOW:  Use `AsyncState<T>` as the state type. Check `.status` before accessing
 *       `.data` or `.message` — the compiler will enforce this.
 * EDGE CASES: `retryable: false` on 4xx errors (user's fault) — UI hides the
 *             retry button in that case. Network/5xx errors get `retryable: true`.
 */
export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string; retryable: boolean }
  | { status: 'success'; data: T }
