import * as React from "react";
import { LoadingSpinner } from "./loading-spinner";

export interface SuspenseBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function SuspenseBoundary({
  children,
  fallback,
}: SuspenseBoundaryProps) {
  return (
    <React.Suspense
      fallback={
        fallback || (
          <div className="flex items-center justify-center p-8">
            <LoadingSpinner size="lg" />
          </div>
        )
      }
    >
      {children}
    </React.Suspense>
  );
}

SuspenseBoundary.displayName = "SuspenseBoundary";
