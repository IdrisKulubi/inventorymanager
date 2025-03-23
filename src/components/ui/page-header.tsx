import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  ChevronRight, 
  Home, 
  Plus, 
  ArrowLeft,
  Calendar,
  FileDown
} from "lucide-react";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface ActionButton {
  label?: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  variant?: "default" | "secondary" | "outline" | "ghost" | "link" | "destructive";
  component?: React.ReactNode;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: ActionButton[];
  backLink?: {
    label: string;
    href: string;
  };
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  backLink,
  children,
}: PageHeaderProps) {
  return (
    <div className="mb-8 space-y-4">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center text-sm text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="flex items-center hover:text-foreground">
                <Home className="h-3.5 w-3.5" />
                <span className="sr-only">Home</span>
              </Link>
            </li>
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center gap-1.5">
                <ChevronRight className="h-3.5 w-3.5" />
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-foreground">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-foreground">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Back button */}
      {backLink && (
        <Button variant="ghost" asChild className="mb-2 -ml-2 h-8 px-2">
          <Link href={backLink.href}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {backLink.label}
          </Link>
        </Button>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>

        {/* Action buttons */}
        {actions && actions.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {actions.map((action, index) => (
              action.component ? (
                <React.Fragment key={index}>{action.component}</React.Fragment>
              ) : action.href ? (
                <Button 
                  key={index} 
                  variant={action.variant || "default"} 
                  size="sm"
                  asChild
                >
                  <Link href={action.href}>
                    {action.icon}
                    {action.label}
                  </Link>
                </Button>
              ) : (
                <Button 
                  key={index} 
                  variant={action.variant || "default"} 
                  size="sm"
                  onClick={action.onClick}
                >
                  {action.icon}
                  {action.label}
                </Button>
              )
            ))}
          </div>
        )}
      </div>

      {/* Additional content */}
      {children}
    </div>
  );
}

// Common action buttons
export const AddItemAction = {
  label: "Add Item",
  href: "/inventory/add",
  icon: <Plus className="mr-2 h-4 w-4" />,
  variant: "default" as const,
};

export const DailyUpdatesAction = {
  label: "Daily Updates",
  href: "/inventory/daily-updates",
  icon: <Calendar className="mr-2 h-4 w-4" />,
  variant: "outline" as const,
};

export const ExportAction = {
  label: "Export",
  icon: <FileDown className="mr-2 h-4 w-4" />,
  variant: "outline" as const,
}; 