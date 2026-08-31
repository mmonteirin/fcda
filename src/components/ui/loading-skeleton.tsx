import * as React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "text" | "circular" | "card";
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "h-4 w-4 rounded",
      text: "h-4 w-full rounded-sm",
      circular: "h-12 w-12 rounded-full",
      card: "h-32 w-full rounded-2xl"
    };

    return (
      <div
        ref={ref}
        className={cn(
          "animate-shimmer bg-muted/50 rounded",
          variants[variant],
          className
        )}
        style={{
          background: 'linear-gradient(90deg, var(--color-muted) 0%, var(--color-muted/50) 50%, var(--color-muted) 100%)',
          backgroundSize: '200% auto',
          animation: 'shimmer 1.5s linear infinite'
        }}
        {...props}
      />
    );
  }
);

Skeleton.displayName = "Skeleton";

export { Skeleton };
