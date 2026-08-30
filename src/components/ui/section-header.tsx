import * as React from "react";
import { cn } from "@/lib/utils";

export interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  description?: string;
  alignment?: "left" | "center" | "right";
  variant?: "default" | "gradient" | "gold";
  badge?: string;
}

const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({ className, title, subtitle, description, alignment = "left", variant = "default", badge, ...props }, ref) => {
    const alignments = {
      left: "text-left",
      center: "text-center",
      right: "text-right"
    };
    
    const variants = {
      default: "",
      gradient: "bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent",
      gold: "text-gold"
    };

    return (
      <div
        ref={ref}
        className={cn("mb-8", alignments[alignment], className)}
        {...props}
      >
        {badge && (
          <span className="inline-block mb-3 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 rounded-full">
            {badge}
          </span>
        )}
        
        {subtitle && (
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold mb-2">
            {subtitle}
          </p>
        )}
        
        <h2 className={cn("text-3xl md:text-4xl font-bold text-deep mb-3", variants[variant])}>
          {title}
        </h2>
        
        {description && (
          <p className="text-lg text-muted-foreground max-w-2xl">
            {description}
          </p>
        )}
      </div>
    );
  }
);

SectionHeader.displayName = "SectionHeader";

export { SectionHeader };