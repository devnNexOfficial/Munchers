import React from 'react';

/**
 * COMPONENT: LoadingSpinner
 * PURPOSE: Consistent loading spinner used throughout the app.
 * WHY: Replaces ad-hoc "Loading..." text and inconsistent spinners.
 */
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const sizeClasses: Record<string, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-3',
  lg: 'h-12 w-12 border-4',
};

export default function LoadingSpinner({ size = 'md', label }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12" role="status">
      <div
        className={`animate-spin rounded-full border-muncherz-red border-t-transparent ${sizeClasses[size]}`}
        aria-hidden="true"
      />
      {label && <p className="mt-3 text-sm font-medium text-gray-500">{label}</p>}
    </div>
  );
}
