import { Head, Link } from "@inertiajs/react";
import { Building2, DoorOpen, Plus, UserCheck, Wrench } from "lucide-react";
import { unitColumns, type UnitRow } from "@/components/units/columns";
import { StatsCard, type StatSection } from "@/components/tools/StatsCard";
import { DataTable } from "@/components/tools/table/main-table";
import { Button } from "@/components/ui/button";
import { create, index } from "@/routes/units";

export default function UnitsIndex({ units, stats }: { units: UnitRow[]; stats: { totalUnits: number; vacantUnits: number; occupiedUnits: number; maintenanceUnits: number } }) {
    const sections: StatSection[] = [{ title: "Total units", value: stats.totalUnits, description: "Registered across properties", icon: DoorOpen, color: "primary" }, { title: "Vacant units", value: stats.vacantUnits, description: "Ready to allocate", icon: Building2, color: "success" }, { title: "Occupied units", value: stats.occupiedUnits, description: "Currently in use", icon: UserCheck, color: "info" }, { title: "In maintenance", value: stats.maintenanceUnits, description: "Temporarily unavailable", icon: Wrench, color: "warning" }];
    return <><Head title="Units Management — SOMFIX" /><div className="p-4 md:p-6"><div className="flex items-start justify-between gap-4"><div><h1 className="text-lg font-semibold">Units management</h1><p className="text-xs text-muted-foreground">Track unit inventory, occupancy, rent and operational status.</p></div><Button asChild size="sm"><Link href={create()}><Plus className="size-4" />Add <span className="hidden sm:inline">unit</span></Link></Button></div><StatsCard sections={sections} /><div className="mt-6 animate-in fade-in slide-in-from-bottom-6 duration-1000"><DataTable title="Units" searchTitle="Filter units by number, property or status..." columns={unitColumns} data={units} /></div></div></>;
}

UnitsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Units',
            href: index(),
        },
    ],
};
