import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, AlertCircle, Info } from "lucide-react";

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: "success" | "error" | "warning" | "info";
  message?: string;
}

const StatusBadge = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ className, status, message, ...props }, ref) => {
    const variants = {
      success: "bg-green-100 text-green-700 border-green-200",
      error: "bg-red-100 text-red-700 border-red-200",
      warning: "bg-yellow-100 text-yellow-700 border-yellow-200",
      info: "bg-blue-100 text-blue-700 border-blue-200"
    };
    
    const icons = {
      success: CheckCircle2,
      error: XCircle,
      warning: AlertCircle,
      info: Info
    };
    
    const Icon = icons[status];
    const animations = {
      success: "animate-bounce-in",
      error: "animate-scale-in",
      warning: "animate-pulse-glow",
      info: "animate-fade-in"
    };

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold",
          variants[status],
          animations[status],
          className
        )}
        {...props}
      >
        <Icon className="h-4 w-4" />
        {message}
      </div>
    );
  }
);

StatusBadge.displayName = "StatusBadge";

export { StatusBadge };
