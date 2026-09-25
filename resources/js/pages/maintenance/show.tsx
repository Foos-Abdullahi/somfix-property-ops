import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";
import {
    ArrowLeft,
    Calendar,
    Edit,
    FileText,
    MapPin,
    Trash2,
    Users,
    Wrench,
    AlertCircle,
    DollarSign,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { destroy, edit, index } from "@/routes/maintenance";

type Maintenance = {
    id: number;
    property_id: number;
    unit_id: number | null;
    tenant_id: number | null;
    category: string;
    priority: "low" | "medium" | "high" | "urgent";
    title: string;
    description: string;
    status: "open" | "in_progress" | "scheduled" | "completed" | "cancelled";
    assigned_to: string | null;
    scheduled_date: string | null;
    completed_date: string | null;
    estimated_cost: number | null;
    actual_cost: number | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    property?: {
        id: number;
        name: string;
        address: string | null;
    };
    unit?: {
        id: number;
        unit_number: string;
    };
    tenant?: {
        id: number;
        first_name: string;
        last_name: string;
        email: string | null;
        phone: string | null;
    };
};

function dateTime(value: string): string {
    return new Intl.DateTimeFormat("en", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(new Date(value));
}

export default function MaintenanceShow({ maintenance }: { maintenance: Maintenance }) {
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const details = [
        {
            icon: MapPin,
            label: "Property",
            value: maintenance.property?.name || "Not assigned",
        },
        {
            icon: MapPin,
            label: "Unit",
            value: maintenance.unit?.unit_number || "Not assigned",
        },
        {
            icon: Users,
            label: "Tenant",
            value: maintenance.tenant
                ? `${maintenance.tenant.first_name} ${maintenance.tenant.last_name}`
                : "Not assigned",
        },
        {
            icon: Wrench,
            label: "Category",
            value: maintenance.category,
        },
        {
            icon: AlertCircle,
            label: "Priority",
            value: maintenance.priority.charAt(0).toUpperCase() + maintenance.priority.slice(1),
        },
        {
            icon: Users,
            label: "Assigned to",
            value: maintenance.assigned_to || "Not assigned",
        },
        {
            icon: Calendar,
            label: "Scheduled date",
            value: maintenance.scheduled_date ? dateTime(maintenance.scheduled_date) : "Not scheduled",
        },
        {
            icon: Calendar,
            label: "Completed date",
            value: maintenance.completed_date ? dateTime(maintenance.completed_date) : "Not completed",
        },
        {
            icon: DollarSign,
            label: "Estimated cost",
            value: maintenance.estimated_cost ? `$${Number(maintenance.estimated_cost).toFixed(2)}` : "Not estimated",
        },
        {
            icon: DollarSign,
            label: "Actual cost",
            value: maintenance.actual_cost ? `$${Number(maintenance.actual_cost).toFixed(2)}` : "Not recorded",
        },
    ];

    const statusColors = {
        open: "border-warning/20 bg-warning/10 text-warning",
        in_progress: "border-info/20 bg-info/10 text-info",
        scheduled: "border-primary/20 bg-primary/10 text-primary",
        completed: "border-success/20 bg-success/10 text-success",
        cancelled: "border-muted-foreground/20 bg-muted-foreground/10 text-muted-foreground",
    };

    const statusLabels = {
        open: "Open",
        in_progress: "In Progress",
        scheduled: "Scheduled",
        completed: "Completed",
        cancelled: "Cancelled",
    };

    return (
        <>
            <Head title={`Maintenance #${maintenance.id} — SOMFIX`} />
            <div className="mx-auto w-full max-w-6xl p-4 md:p-6">
                <div className="mb-6 flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight">Maintenance #{maintenance.id}</h1>
                            <Badge
                                variant="outline"
                                className={statusColors[maintenance.status] || ""}
                            >
                                {statusLabels[maintenance.status] || maintenance.status}
                            </Badge>
                            <Badge variant="outline">
                                {maintenance.priority.charAt(0).toUpperCase() + maintenance.priority.slice(1)} Priority
                            </Badge>
                        </div>
                        <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="size-4" /> Created{" "}
                            {dateTime(maintenance.created_at)}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline" size="sm">
                            <Link href={edit(maintenance.id)}>
                                <Edit className="size-4" /> Edit
                            </Link>
                        </Button>
                        {confirmingDelete ? (
                            <>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setConfirmingDelete(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => router.delete(destroy.url(maintenance.id))}
                                >
                                    Confirm delete
                                </Button>
                            </>
                        ) : (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setConfirmingDelete(true)}
                                className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            >
                                <Trash2 className="size-4" /> Delete
                            </Button>
                        )}
                        <Button asChild variant="outline" size="sm">
                            <Link href={index()}>
                                <ArrowLeft className="size-4" /> Back
                            </Link>
                        </Button>
                    </div>
                </div>
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.75fr)]">
                    <Card className="overflow-hidden border-border/70 shadow-sm">
                        <CardHeader className="border-b border-border/70 bg-secondary/35">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Wrench className="size-5 text-primary" /> Request details
                            </CardTitle>
                            <CardDescription>
                                Maintenance request information and assignment details.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-5 p-5 sm:grid-cols-2">
                            {details.map((detail) => (
                                <div key={detail.label}>
                                    <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                                        <detail.icon className="size-3.5 text-primary" />{" "}
                                        {detail.label}
                                    </p>
                                    <p className="mt-2 text-sm font-medium">{detail.value}</p>
                                </div>
                            ))}
                            <div className="sm:col-span-2">
                                <p className="text-xs font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                                    Description
                                </p>
                                <p className="mt-2 rounded-xl border border-border/70 bg-secondary/20 p-4 text-sm leading-6 text-foreground">
                                    {maintenance.description}
                                </p>
                            </div>
                            <div className="sm:col-span-2">
                                <p className="text-xs font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                                    Notes
                                </p>
                                <p className="mt-2 rounded-xl border border-border/70 bg-secondary/20 p-4 text-sm leading-6 text-foreground">
                                    {maintenance.notes || "No notes have been added."}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <div className="space-y-6">
                        <Card className="border-border/70 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <FileText className="size-5 text-primary" /> Record timeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Timeline label="Created" value={dateTime(maintenance.created_at)} />
                                <Timeline
                                    label="Last updated"
                                    value={dateTime(maintenance.updated_at)}
                                />
                            </CardContent>
                        </Card>
                        <Card className="border-border/70 bg-secondary/25 shadow-sm">
                            <CardContent className="p-5">
                                <p className="font-semibold">Contact information</p>
                                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                    {maintenance.tenant?.email && (
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">Email:</span>
                                            {maintenance.tenant.email}
                                        </div>
                                    )}
                                    {maintenance.tenant?.phone && (
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">Phone:</span>
                                            {maintenance.tenant.phone}
                                        </div>
                                    )}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

function Timeline({ label, value }: { label: string; value: string }) {
    return (
        <div className="border-b border-border/70 pb-4 last:border-0 last:pb-0">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-sm font-semibold">{value}</p>
        </div>
    );
}

MaintenanceShow.layout = {
    breadcrumbs: [
        { title: "Maintenance", href: index() },
        { title: "Request details", href: index() },
    ],
};
