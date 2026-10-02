import type { LucideIcon } from "lucide-react";
import { TrendingUp } from "lucide-react";
import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface Stat {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    className?: string;
    color?: "primary" | "info" | "success" | "warning" | "destructive" | "accent";
}

const colorStyles = {
    primary: {
        bg: "bg-primary/10 dark:bg-green-400/15",
        text: "text-primary dark:text-green-300",
        border: "border-primary/20 dark:border-green-400/30",
    },
    info: {
        bg: "bg-info/10 dark:bg-sky-400/15",
        text: "text-info dark:text-sky-300",
        border: "border-info/20 dark:border-sky-400/30",
    },
    success: {
        bg: "bg-emerald-500/10 dark:bg-emerald-400/15",
        text: "text-emerald-600 dark:text-emerald-300",
        border: "border-emerald-500/20 dark:border-emerald-400/30",
    },
    warning: {
        bg: "bg-accent/10 dark:bg-amber-400/15",
        text: "text-accent dark:text-amber-300",
        border: "border-accent/20 dark:border-amber-400/30",
    },
    destructive: {
        bg: "bg-destructive/10 dark:bg-red-400/15",
        text: "text-destructive dark:text-red-300",
        border: "border-destructive/20 dark:border-red-400/30",
    },
    accent: {
        bg: "bg-accent/10 dark:bg-violet-400/15",
        text: "text-accent-foreground dark:text-violet-300",
        border: "border-accent/20 dark:border-violet-400/30",
    },
};

export function MetricCard({
    title,
    value,
    icon: Icon,
    trend,
    className = "",
    color = "primary",
}: Stat) {
    const styles = colorStyles[color] || colorStyles.primary;

    return (
        <Card
            className={cn(
                "overflow-hidden rounded-xl border-border/70 bg-card py-0 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md",
                className,
            )}
        >
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex flex-col gap-1">
                        <p className=" lg:text-xs text-[11px] font-medium uppercase tracking-wider text-muted-foreground truncate">
                            {title}
                        </p>
                        <h3 className="text-xl font-medium tracking-tight text-foreground tabular-nums ">
                            {value}
                        </h3>
                    </div>
                    <div
                        className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
                            styles.bg,
                            styles.border,
                        )}
                    >
                        <Icon className={cn("h-3.5 w-3.5", styles.text)} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
