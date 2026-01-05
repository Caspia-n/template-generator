'use client';

import React from 'react';

interface LoadingStateProps {
  isLoading: boolean;
  message?: string;
  progress?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'skeleton' | 'pulse' | 'progress';
  children?: React.ReactNode;
}

/**
 * Reusable loading state component with multiple variants
 */
export function LoadingState({ 
  isLoading, 
  message, 
  progress,
  size = 'md',
  variant = 'spinner',
  children 
}: LoadingStateProps) {
  if (!isLoading) {
    return children ? <>{children}</> : null;
  }

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const spinnerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  switch (variant) {
    case 'spinner':
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <div className={`${sizeClasses[size]} text-blue-500 animate-spin`}>
            <svg className="w-full h-full" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          {message && (
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
              {message}
            </p>
          )}
          {progress !== undefined && (
            <div className="mt-4 w-full max-w-xs">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-gray-500 text-center">
                {Math.round(progress)}%
              </p>
            </div>
          )}
        </div>
      );

    case 'pulse':
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <div className={`${sizeClasses[size]} bg-blue-200 rounded-full animate-pulse`} />
          {message && (
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
              {message}
            </p>
          )}
        </div>
      );

    case 'skeleton':
      return (
        <div className="space-y-4 p-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
            </div>
          ))}
        </div>
      );

    case 'progress':
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>{message || 'Processing...'}</span>
              {progress !== undefined && <span>{Math.round(progress)}%</span>}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress || 0}%` }}
              />
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}

/**
 * Specific loading components for common use cases
 */
export function GeneratingTemplateLoading() {
  return (
    <LoadingState
      isLoading={true}
      message="Generating your Notion template with AI..."
      variant="progress"
      size="lg"
    />
  );
}

export function ModelLoading() {
  return (
    <LoadingState
      isLoading={true}
      message="Loading AI model..."
      variant="spinner"
      size="lg"
    />
  );
}

export function NotionConnectionLoading() {
  return (
    <LoadingState
      isLoading={true}
      message="Connecting to Notion..."
      variant="pulse"
      size="md"
    />
  );
}

export function PageLoading({ message = "Loading page..." }: { message?: string }) {
  return (
    <LoadingState
      isLoading={true}
      message={message}
      variant="skeleton"
      size="sm"
    />
  );
}

export function DataLoading({ message = "Loading data..." }: { message?: string }) {
  return (
    <LoadingState
      isLoading={true}
      message={message}
      variant="skeleton"
    />
  );
}

/**
 * Skeleton components for common content types
 */
export function TemplateCardSkeleton() {
  return (
    <div className="p-6 border rounded-lg space-y-4">
      <div className="h-6 bg-gray-200 rounded animate-pulse" />
      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded animate-pulse" />
        <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse" />
        <div className="h-3 bg-gray-200 rounded w-4/6 animate-pulse" />
      </div>
      <div className="flex space-x-2">
        <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
        <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-6 bg-white dark:bg-gray-800 rounded-lg border">
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-8 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <TemplateCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/**
 * Full page loading overlay
 */
export function PageLoadingOverlay({ 
  isLoading, 
  message = "Loading..." 
}: { 
  isLoading: boolean; 
  message?: string;
}) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-xl">
        <LoadingState
          isLoading={true}
          message={message}
          variant="spinner"
          size="lg"
        />
      </div>
    </div>
  );
}