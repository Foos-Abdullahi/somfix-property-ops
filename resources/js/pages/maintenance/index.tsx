import { Head, Link } from "@inertiajs/react";
import { AlertCircle, Plus, Wrench, Calendar, Users, Timer } from "lucide-react";
import { maintenanceColumns, type MaintenanceRow } from "@/components/maintenance/columns";
import { StatsCard, type StatSection } from "@/components/tools/StatsCard";
import { DataTable } from "@/components/tools/table/main-table";
import { Button } from "@/components/ui/button";
import { create, index } from "@/routes/maintenance";

type Props = {
    maintenances: MaintenanceRow[];
    stats: {
        totalRequests: number;
        openRequests: number;
        inProgress: number;
        urgentRequests: number;
    };
};

export default function MaintenanceIndex({ maintenances, stats }: Props) {
    const sections: StatSection[] = [
        {
            title: "Total requests",
            value: stats.totalRequests,
            description: "All maintenance requests",
            icon: Wrench,
            color: "primary",
        },
        {
            title: "Open requests",
            value: stats.openRequests,
            description: "Awaiting attention",
            icon: Timer,
            color: "warning",
        },
        {
            title: "In progress",
            value: stats.inProgress,
            description: "Currently being worked on",
            icon: Users,
            color: "info",
        },
        {
            title: "Urgent requests",
            value: stats.urgentRequests,
            description: "Requires immediate attention",
            icon: AlertCircle,
            color: "destructive",
        },
    ];

    return (
        <>
            <Head title="Maintenance Management — SOMFIX" />

            <div className="p-4 md:p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-lg font-semibold">Maintenance management</h1>
                        <p className="text-xs text-muted-foreground">
                            Track, triage, and manage property maintenance requests.
                        </p>
                    </div>

                    <Button asChild size="sm">
                        <Link href={create()}>
                            <Plus className="size-4" />
                            Add <span className="hidden sm:inline">request</span>
                        </Link>
                    </Button>
                </div>

                <StatsCard sections={sections} />

                <div className="mt-6 animate-in fade-in slide-in-from-bottom-6 duration-1000 ease-in-out">
                    <DataTable
                        title="Maintenance Requests"
                        searchTitle="Filter requests by title, property, or status..."
                        columns={maintenanceColumns}
                        data={maintenances}
                    />
                </div>
            </div>
        </>
    );
}

MaintenanceIndex.layout = {
    breadcrumbs: [{ title: "Maintenance", href: index() }],
};
