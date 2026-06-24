'use client'

/**
 * COMPONENT: ErrorBoundary
 * PURPOSE:   Catches React rendering errors in any child component tree and
 *            shows a friendly fallback UI instead of crashing the entire app.
 *            Wrap critical sections (customizer, cart, checkout) with this.
 * WHY:       A bug in one component should never white-screen the whole app.
 *            Error boundaries are the only way to catch render errors in React
 *            (try/catch does NOT work in render functions).
 * HOW:       Class component — React requires class components for error boundaries.
 *            getDerivedStateFromError captures the error; componentDidCatch logs it.
 * SIDE EFFECTS: None (display only). Errors are logged to console in development.
 * PERFORMANCE: Zero overhead during normal operation; only activates on error.
 *
 * @example
 * <ErrorBoundary fallback={<p>Cart couldn't load — please refresh 🛒</p>}>
 *   <CartPage />
 * </ErrorBoundary>
 */

import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  /** The component tree to protect */
  children: ReactNode
  /** Fallback UI to show when an error is caught. Can be any React node. */
  fallback: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  /**
   * Called during rendering when a child throws.
   * Returns new state to trigger fallback render — must be a pure function.
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  /**
   * Called after rendering with the error details.
   * Use this for logging (Sentry, console) — not for updating state.
   */
  componentDidCatch(error: Error, info: ErrorInfo): void {
    // TODO: Wire to Sentry in production — backend Section 30
    console.error('[ErrorBoundary] Caught render error:', error, info.componentStack)
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}
