/**
 * DISCRIMINATED UNION: AsyncState<T>
 * WHY: Replaces ad-hoc { loading, error, data } spreads.
 *      Every async operation uses the same pattern,
 *      making state handling predictable and exhaustive.
 *      TypeScript narrows the union on status check,
 *      so impossible states (loading + data together)
 *      cannot compile.
 */
export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string; retryable: boolean }
  | { status: 'success'; data: T };
