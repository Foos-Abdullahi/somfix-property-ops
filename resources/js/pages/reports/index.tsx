import { StatsCard, type StatSection } from "@/components/tools/StatsCard";
import { Head } from "@inertiajs/react";
import { Building2, DoorOpen, Package, UserCheck, Wallet, Wrench, Users, HardHat, TrendingUp, Layers3, ClipboardList } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { index } from "@/routes/reports";

export default function ReportsIndex({ stats, occupancy, maintenance, finance, inventory }: { stats: { properties: number; units: number; tenants: number; leases: number; maintenance: number; workOrders: number; serviceTeam: number; inventory: number; finance: number }; occupancy: { totalUnits: number; occupiedUnits: number; vacantUnits: number; occupancyRate: number }; maintenance: { totalRequests: number; openRequests: number; inProgress: number; completed: number }; finance: { totalRevenue: number; totalPaid: number; totalBalance: number; totalExpenses: number }; inventory: { totalItems: number; inStock: number; lowStock: number; outOfStock: number } }) {
    const topMetrics: StatSection[] = [
        { title: "Properties", value: stats.properties, icon: Building2, color: "primary" },
        { title: "Occupancy Rate", value: `${occupancy.occupancyRate}%`, icon: UserCheck, color: "success" },
        { title: "Open Requests", value: maintenance.openRequests, icon: Wrench, color: "warning" },
        { title: "Revenue", value: `$${finance.totalRevenue.toLocaleString()}`, icon: Wallet, color: "info" },
    ];

    const moduleProgress = [
        { name: "Properties", value: 100, color: "bg-primary" },
        { name: "Units", value: 100, color: "bg-chart-4" },
        { name: "Tenants", value: 100, color: "bg-accent" },
        { name: "Leases", value: 100, color: "bg-emerald-500" },
        { name: "Maintenance", value: 100, color: "bg-orange-500" },
        { name: "Work Orders", value: 100, color: "bg-blue-500" },
        { name: "Service Team", value: 100, color: "bg-purple-500" },
        { name: "Inventory", value: 100, color: "bg-pink-500" },
        { name: "Finance", value: 100, color: "bg-red-500" },
    ];

    return (
        <>
            <Head title="Reports — SOMFIX" />
            <div className="w-full flex-1 p-4 md:p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="page-title-enter text-lg font-semibold">Reports management</h1>
                        <p className="page-description-enter mt-1 text-xs text-muted-foreground">Review operational and financial performance across properties, repairs, teams, and cash movement.</p>
                    </div>
                </div>
                <StatsCard sections={topMetrics} />

                <div className="mt-6 space-y-6 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-5 motion-safe:duration-700">
                    <section className="grid gap-6 lg:grid-cols-3">
                        <Card className="overflow-hidden border-border/70 shadow-sm lg:col-span-2">
                            <CardHeader className="pb-0">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <TrendingUp className="size-5 text-primary" />
                                            System Overview
                                        </CardTitle>
                                        <CardDescription className="mt-1 text-xs">
                                            Real-time operational metrics across all modules.
                                        </CardDescription>
                                    </div>
                                    <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                                        Live data
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-5">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="rounded-xl border border-border/70 bg-secondary/35 p-4">
                                        <h3 className="mb-3 text-sm font-semibold">Portfolio</h3>
                                        <div className="space-y-2">
                                            <Stat label="Properties" value={stats.properties} icon={Building2} />
                                            <Stat label="Units" value={stats.units} icon={DoorOpen} />
                                            <Stat label="Tenants" value={stats.tenants} icon={UserCheck} />
                                            <Stat label="Leases" value={stats.leases} icon={Users} />
                                        </div>
                                    </div>
                                    <div className="rounded-xl border border-border/70 bg-secondary/35 p-4">
                                        <h3 className="mb-3 text-sm font-semibold">Occupancy</h3>
                                        <div className="space-y-2">
                                            <Stat label="Total Units" value={occupancy.totalUnits} />
                                            <Stat label="Occupied" value={occupancy.occupiedUnits} />
                                            <Stat label="Vacant" value={occupancy.vacantUnits} />
                                            <Stat label="Rate" value={`${occupancy.occupancyRate}%`} />
                                        </div>
                                    </div>
                                    <div className="rounded-xl border border-border/70 bg-secondary/35 p-4">
                                        <h3 className="mb-3 text-sm font-semibold">Maintenance</h3>
                                        <div className="space-y-2">
                                            <Stat label="Total" value={maintenance.totalRequests} icon={Wrench} />
                                            <Stat label="Open" value={maintenance.openRequests} />
                                            <Stat label="In Progress" value={maintenance.inProgress} />
                                            <Stat label="Completed" value={maintenance.completed} />
                                        </div>
                                    </div>
                                    <div className="rounded-xl border border-border/70 bg-secondary/35 p-4">
                                        <h3 className="mb-3 text-sm font-semibold">Operations</h3>
                                        <div className="space-y-2">
                                            <Stat label="Work Orders" value={stats.workOrders} icon={Wrench} />
                                            <Stat label="Service Team" value={stats.serviceTeam} icon={HardHat} />
                                            <Stat label="Inventory" value={inventory.totalItems} icon={Package} />
                                            <Stat label="Finance" value={stats.finance} icon={Wallet} />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-border/70 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Package className="size-5 text-primary" />
                                    Module Coverage
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Implementation progress across all modules.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {moduleProgress.map((module) => (
                                    <div key={module.name} className="space-y-2">
                                        <div className="flex items-center justify-between text-xs font-semibold">
                                            <span>{module.name}</span>
                                            <span className="font-mono text-muted-foreground">
                                                {module.value}%
                                            </span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-secondary">
                                            <div
                                                className={`h-full rounded-full transition-all duration-700 ${module.color}`}
                                                style={{ width: `${module.value}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </section>

                    <section className="grid gap-6 lg:grid-cols-2">
                        <Card className="border-border/70 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Layers3 className="size-5 text-primary" />
                                    Financial Overview
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Revenue, expenses, and payment tracking summary.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid min-h-[170px] grid-cols-4 items-end gap-4 border-b border-border/70 pt-4">
                                    {[
                                        { name: "Revenue", value: finance.totalRevenue > 0 ? Math.min(100, (finance.totalRevenue / Math.max(finance.totalRevenue, 1)) * 100) : 0, color: "bg-green-500" },
                                        { name: "Paid", value: finance.totalPaid > 0 ? Math.min(100, (finance.totalPaid / Math.max(finance.totalRevenue, 1)) * 100) : 0, color: "bg-blue-500" },
                                        { name: "Balance", value: finance.totalBalance > 0 ? Math.min(100, (finance.totalBalance / Math.max(finance.totalRevenue, 1)) * 100) : 0, color: "bg-orange-500" },
                                        { name: "Expenses", value: finance.totalExpenses > 0 ? Math.min(100, (finance.totalExpenses / Math.max(finance.totalRevenue, 1)) * 100) : 0, color: "bg-red-500" },
                                    ].map((item) => (
                                        <div
                                            key={item.name}
                                            className="flex min-w-0 flex-col items-center gap-2"
                                        >
                                            <span className="text-xs font-bold text-foreground">
                                                {item.value.toFixed(0)}%
                                            </span>
                                            <div className="flex h-28 w-full max-w-24 items-end rounded-t-lg bg-secondary/60 px-2">
                                                <div
                                                    className={`w-full rounded-t-md ${item.color}`}
                                                    style={{ height: `${item.value}%` }}
                                                />
                                            </div>
                                            <span className="truncate text-xs text-muted-foreground">
                                                {item.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="overflow-hidden border-border/70 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <ClipboardList className="size-5 text-primary" />
                                    Inventory Status
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Stock levels and reorder alerts across all items.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid min-h-[170px] grid-cols-4 items-end gap-4 border-b border-border/70 pt-4">
                                    {[
                                        { name: "In Stock", value: inventory.totalItems > 0 ? (inventory.inStock / inventory.totalItems) * 100 : 0, color: "bg-green-500" },
                                        { name: "Low Stock", value: inventory.totalItems > 0 ? (inventory.lowStock / inventory.totalItems) * 100 : 0, color: "bg-yellow-500" },
                                        { name: "Out of Stock", value: inventory.totalItems > 0 ? (inventory.outOfStock / inventory.totalItems) * 100 : 0, color: "bg-red-500" },
                                        { name: "Available", value: inventory.totalItems > 0 ? ((inventory.inStock + inventory.lowStock) / inventory.totalItems) * 100 : 0, color: "bg-blue-500" },
                                    ].map((item) => (
                                        <div
                                            key={item.name}
                                            className="flex min-w-0 flex-col items-center gap-2"
                                        >
                                            <span className="text-xs font-bold text-foreground">
                                                {item.value.toFixed(0)}%
                                            </span>
                                            <div className="flex h-28 w-full max-w-24 items-end rounded-t-lg bg-secondary/60 px-2">
                                                <div
                                                    className={`w-full rounded-t-md ${item.color}`}
                                                    style={{ height: `${item.value}%` }}
                                                />
                                            </div>
                                            <span className="truncate text-xs text-muted-foreground">
                                                {item.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </section>
                </div>
            </div>
        </>
    );
}

function Stat({ label, value, icon: Icon }: { label: string; value: string | number; icon?: any }) {
    return (
        <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{label}</p>
            <div className="flex items-center gap-2">
                {Icon && <Icon className="size-4 text-muted-foreground" />}
                <p className="font-semibold text-sm">{value}</p>
            </div>
        </div>
    );
}

ReportsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Reports',
            href: index(),
        },
    ],
};
