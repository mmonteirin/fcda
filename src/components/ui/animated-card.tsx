import * as React from "react";
import { cn } from "@/lib/utils";

export interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  animation?: "fade-in-up" | "fade-in-down" | "fade-in-left" | "fade-in-right" | "scale-in" | "bounce-in";
  delay?: number;
  duration?: "fast" | "normal" | "slow";
  hover?: boolean;
}

const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ className, animation = "fade-in-up", delay = 0, duration = "normal", hover = true, children, ...props }, ref) => {
    const animationClass = `animate-${animation}`;
    const delayClass = delay > 0 ? `delay-${Math.min(delay, 500)}` : "";
    const durationClass = `duration-${duration}`;
    
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border border-border bg-card p-6 shadow-card transition-all duration-300",
          animationClass,
          delayClass,
          durationClass,
          hover && "hover:shadow-elegant hover:-translate-y-1",
          className
        )}
        style={{ animationDelay: `${delay}ms` }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

AnimatedCard.displayName = "AnimatedCard";

export { AnimatedCard };