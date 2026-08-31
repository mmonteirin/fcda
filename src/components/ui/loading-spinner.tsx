import * as React from "react";
import { cn } from "@/lib/utils";

export interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "gold" | "primary";
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size = "md", variant = "default", ...props }, ref) => {
    const sizes = {
      sm: "h-4 w-4",
      md: "h-8 w-8",
      lg: "h-12 w-12"
    };
    
    const variants = {
      default: "border-primary border-t-transparent",
      gold: "border-gold border-t-transparent",
      primary: "border-primary border-t-transparent"
    };

    return (
      <div
        ref={ref}
        className={cn(
          "animate-spin rounded-full border-2",
          sizes[size],
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

LoadingSpinner.displayName = "LoadingSpinner";

export { LoadingSpinner };
