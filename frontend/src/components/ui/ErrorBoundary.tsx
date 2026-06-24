'use client';

import React from 'react';

/**
 * COMPONENT: ErrorBoundary
 * PURPOSE: Catches React rendering errors and shows a fallback UI,
 *          preventing the entire app from crashing due to one component error.
 * WHERE: Wrap customizer, cart, checkout, and any data-heavy sections.
 * EDGE CASES: Does not catch errors in event handlers or async code —
 *             those need try/catch in the handler itself.
 */
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log to monitoring service (e.g., Sentry) in production
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
