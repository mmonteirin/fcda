import * as React from "react";
import { cn } from "@/lib/utils";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "hero" | "accent" | "gold";
  blur?: "sm" | "md" | "lg";
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", blur = "md", children, ...props }, ref) => {
    const variants = {
      default: "bg-white/10 backdrop-blur-md border-white/20",
      hero: "bg-white/5 backdrop-blur-lg border-white/10",
      accent: "bg-primary/10 backdrop-blur-md border-primary/20",
      gold: "bg-gold/10 backdrop-blur-md border-gold/20"
    };
    
    const blurs = {
      sm: "backdrop-blur-sm",
      md: "backdrop-blur-md", 
      lg: "backdrop-blur-lg"
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border shadow-card",
          variants[variant],
          blurs[blur],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export { GlassCard };