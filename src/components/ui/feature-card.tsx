import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface FeatureCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon;
  title: string;
  description: string;
  variant?: "default" | "emerald" | "gold" | "blue" | "purple";
  size?: "sm" | "md" | "lg";
}

const FeatureCard = React.forwardRef<HTMLDivElement, FeatureCardProps>(
  ({ className, icon: Icon, title, description, variant = "default", size = "md", ...props }, ref) => {
    const variants = {
      default: "border-border bg-card hover:border-primary/30 hover:bg-primary/5 active:scale-95",
      emerald: "border-primary/20 bg-primary/5 hover:border-primary/50 hover:bg-primary/10 active:scale-95",
      gold: "border-gold/20 bg-gold/5 hover:border-gold/50 hover:bg-gold/10 active:scale-95",
      blue: "border-blue/20 bg-blue/5 hover:border-blue/50 hover:bg-blue/10 active:scale-95",
      purple: "border-purple/20 bg-purple/5 hover:border-purple/50 hover:bg-purple/10 active:scale-95"
    };
    
    const sizes = {
      sm: "p-4",
      md: "p-6",
      lg: "p-8"
    };
    
    const iconVariants = {
      default: "bg-primary/10 text-primary",
      emerald: "bg-primary/20 text-primary",
      gold: "bg-gold/20 text-gold",
      blue: "bg-blue/20 text-blue",
      purple: "bg-purple/20 text-purple"
    };
    
    const iconSizes = {
      sm: "h-8 w-8",
      md: "h-10 w-10",
      lg: "h-12 w-12"
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border shadow-card transition-all duration-300 ease-out hover:shadow-elegant hover:-translate-y-1 active:scale-95 group cursor-pointer",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        <div className={cn("rounded-xl p-3 mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 ease-out", iconVariants[variant])}>
          <Icon className={iconSizes[size]} />
        </div>
        
        <h3 className="text-xl font-bold text-deep mb-2 group-hover:text-primary transition-colors duration-300">
          {title}
        </h3>
        
        <p className="text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
          {description}
        </p>
      </div>
    );
  }
);

FeatureCard.displayName = "FeatureCard";

export { FeatureCard };