import * as React from "react";
import { cn } from "@/lib/utils";

export interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string;
  shimmerSize?: string;
  shimmerDuration?: string;
}

const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  ({ className, shimmerColor = "rgba(255,255,255,0.3)", shimmerSize = "200%", shimmerDuration = "2s", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-lg bg-primary px-6 py-3 text-primary-foreground font-semibold transition-all hover:bg-primary/90 hover:shadow-glow active:scale-95",
          className
        )}
        style={{
          background: `linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary) 50%, ${shimmerColor} 50%, var(--color-primary) 100%)`,
          backgroundSize: shimmerSize,
          animation: `shimmer ${shimmerDuration} infinite`
        }}
        {...props}
      >
        {children}
      </button>
    );
  }
);

ShimmerButton.displayName = "ShimmerButton";

export { ShimmerButton };