import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  value: string | number;
  description?: string;
  variant?: "default" | "destructive" | "warning" | "success";
  icon: string;
  href?: string;
  onClick?: () => void;
}

export function DashboardCard({
  title,
  value,
  description,
  variant = "default",
  icon,
  href,
  onClick
}: DashboardCardProps) {
  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    if (href) {
      return <Link href={href} className="block">{children}</Link>;
    }
    if (onClick) {
      return <div onClick={onClick} className="cursor-pointer">{children}</div>;
    }
    return <>{children}</>;
  };

  return (
    <CardWrapper>
      <Card className={cn(
        "hover:shadow-lg transition-all",
        href || onClick ? "hover:scale-[1.02] cursor-pointer" : "",
        variant === "destructive" && "bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-900",
        variant === "warning" && "bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900",
        variant === "success" && "bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-900",
        variant === "default" && "dark:bg-card dark:border-border"
      )}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <span className="text-2xl">{icon}</span>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{value}</div>
          {description && (
            <p className="text-xs text-muted-foreground mt-2">{description}</p>
          )}
        </CardContent>
      </Card>
    </CardWrapper>
  );
} 