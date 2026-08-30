import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface StatsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "emerald" | "gold" | "blue" | "purple" | "rose";
}

const StatsCard = React.forwardRef<HTMLDivElement, StatsCardProps>(
  ({ className, title, value, icon: Icon, trend, variant = "default", ...props }, ref) => {
    const variants = {
      default: "border-border bg-card",
      emerald: "border-primary/20 bg-primary/5",
      gold: "border-gold/20 bg-gold/5",
      blue: "border-blue/20 bg-blue/5",
      purple: "border-purple/20 bg-purple/5",
      rose: "border-rose/20 bg-rose/5"
    };
    
    const iconColors = {
      default: "text-primary",
      emerald: "text-primary",
      gold: "text-gold",
      blue: "text-blue",
      purple: "text-purple",
      rose: "text-rose"
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border p-6 shadow-card transition-all hover:shadow-elegant hover:-translate-y-1",
          variants[variant],
          className
        )}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <p className="text-3xl font-bold text-deep">{value}</p>
            
            {trend && (
              <div className="flex items-center mt-2 text-sm">
                <span className={cn(
                  "font-medium",
                  trend.isPositive ? "text-emerald-600" : "text-rose-600"
                )}>
                  {trend.isPositive ? "+" : ""}{trend.value}%
                </span>
                <span className="text-muted-foreground ml-1">vs. período anterior</span>
              </div>
            )}
          </div>
          
          {Icon && (
            <div className={cn("p-3 rounded-xl bg-primary/10", iconColors[variant])}>
              <Icon className="h-6 w-6" />
            </div>
          )}
        </div>
      </div>
    );
  }
);

StatsCard.displayName = "StatsCard";

export { StatsCard };