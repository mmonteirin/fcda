import * as React from "react";
import { cn } from "@/lib/utils";

export interface GradientTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "emerald" | "gold" | "blue" | "purple" | "rose" | "teal" | "shimmer";
  size?: "sm" | "md" | "lg" | "xl";
}

const GradientText = React.forwardRef<HTMLSpanElement, GradientTextProps>(
  ({ className, variant = "emerald", size = "md", children, ...props }, ref) => {
    const gradients = {
      emerald: "bg-gradient-to-r from-emerald-600 to-emerald-400",
      gold: "bg-gradient-to-r from-amber-500 to-yellow-400", 
      blue: "bg-gradient-to-r from-blue-600 to-blue-400",
      purple: "bg-gradient-to-r from-purple-600 to-purple-400",
      rose: "bg-gradient-to-r from-rose-600 to-rose-400",
      teal: "bg-gradient-to-r from-teal-600 to-teal-400",
      shimmer: "bg-gradient-to-r from-emerald-600 via-gold-500 to-emerald-600 bg-[length:200%_auto]"
    };
    
    const sizes = {
      sm: "text-sm",
      md: "text-base", 
      lg: "text-lg",
      xl: "text-xl"
    };

    return (
      <span
        ref={ref}
        className={cn(
          "bg-clip-text text-transparent font-bold",
          gradients[variant],
          sizes[size],
          variant === "shimmer" && "animate-shimmer",
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

GradientText.displayName = "GradientText";

export { GradientText };