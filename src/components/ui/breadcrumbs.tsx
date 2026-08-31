import * as React from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  homeHref?: string;
}

const Breadcrumbs = React.forwardRef<HTMLElement, BreadcrumbsProps>(
  ({ className, items, homeHref = "/", ...props }, ref) => {
    if (!items || items.length === 0) return null;

    return (
      <nav
        ref={ref}
        aria-label="Navegação estrutural"
        className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}
        {...props}
      >
        <Link
          to={homeHref}
          className="flex items-center gap-1 hover:text-foreground transition-colors"
          aria-label="Página inicial"
        >
          <Home className="h-4 w-4" />
        </Link>
        
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <ChevronRight className="h-4 w-4 text-border" aria-hidden="true" />
            {item.href ? (
              <Link
                to={item.href}
                className="hover:text-foreground transition-colors animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                {item.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </nav>
    );
  }
);

Breadcrumbs.displayName = "Breadcrumbs";

export { Breadcrumbs };
