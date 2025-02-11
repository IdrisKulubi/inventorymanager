import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function DashboardCard({
  title,
  value,
  variant = "default",
  icon
}: {
  title: string;
  value: number;
  variant?: "default" | "destructive" | "warning";
  icon: string;
}) {
  return (
    <Card className={cn(
      "hover:shadow-lg transition-shadow",
      variant === "destructive" && "bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-900",
      variant === "warning" && "bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900",
      variant === "default" && "dark:bg-card dark:border-border"
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <span className="text-2xl">{icon}</span>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
} 