import { Head, Link } from "@inertiajs/react";
import { CheckCircle2, Plus, UserCheck, UserX } from "lucide-react";
import { serviceTeamColumns, type ServiceTeamRow } from "@/components/service-team/columns";
import { StatsCard, type StatSection } from "@/components/tools/StatsCard";
import { DataTable } from "@/components/tools/table/main-table";
import { Button } from "@/components/ui/button";
import { create, index } from "@/routes/service-team";

export default function ServiceTeamIndex({ serviceTeams, stats }: { serviceTeams: ServiceTeamRow[]; stats: { totalMembers: number; activeMembers: number; onLeave: number } }) {
    const sections: StatSection[] = [{ title: "Total members", value: stats.totalMembers, description: "All service team members", icon: UserCheck, color: "primary" }, { title: "Active", value: stats.activeMembers, description: "Currently available", icon: CheckCircle2, color: "success" }, { title: "On leave", value: stats.onLeave, description: "Temporarily unavailable", icon: UserX, color: "warning" }];
    return <><Head title="Service Team — SOMFIX" /><div className="p-4 md:p-6"><div className="flex items-start justify-between gap-4"><div><h1 className="page-title-enter text-lg font-semibold">Service team</h1><p className="page-description-enter text-xs text-muted-foreground">Manage service team members, specializations, and availability.</p></div><Button asChild size="sm"><Link href={create()}><Plus className="size-4" />Add <span className="hidden sm:inline">member</span></Link></Button></div><StatsCard sections={sections} /><div className="mt-6 animate-in fade-in slide-in-from-bottom-6 duration-1000"><DataTable title="Service Team" searchTitle="Filter members by name, specialization or status..." columns={serviceTeamColumns} data={serviceTeams} /></div></div></>;
}

ServiceTeamIndex.layout = {
    breadcrumbs: [
        {
            title: 'Service Team',
            href: index(),
        },
    ],
};
