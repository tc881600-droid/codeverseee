import React from 'react';

export function LoadingSkeleton({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton h-4" style={{ width: `${Math.random() * 40 + 60}%` }} />
      ))}
    </div>
  );
}

export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`card-pro p-6 ${className}`}>
      <div className="skeleton h-6 w-3/4 mb-4" />
      <LoadingSkeleton lines={3} />
      <div className="skeleton h-10 w-1/3 mt-4" />
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="flex items-center gap-4">
      <div className="skeleton h-16 w-16 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-5 w-1/2" />
        <div className="skeleton h-4 w-1/3" />
      </div>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card-pro p-4">
          <div className="skeleton h-4 w-1/2 mb-2" />
          <div className="skeleton h-8 w-3/4" />
        </div>
      ))}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-jade/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-jade rounded-full animate-spin"></div>
        </div>
        <div className="text-fog font-medium">Loading...</div>
      </div>
    </div>
  );
}
