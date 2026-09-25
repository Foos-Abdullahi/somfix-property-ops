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
    DollarSign,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { destroy, edit, index } from "@/routes/leases";

type Lease = {
    id: number;
    tenant_id: number;
    unit_id: number;
    start_date: string;
    end_date: string;
    monthly_rent: number;
    deposit_amount: number;
    status: "active" | "expired" | "pending" | "terminated";
    payment_due_day: number;
    currency: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
    tenant?: {
        id: number;
        first_name: string;
        last_name: string;
        email: string | null;
        phone: string | null;
    };
    unit?: {
        id: number;
        unit_number: string;
        property?: {
            id: number;
            name: string;
            address: string | null;
        };
    };
};

function dateTime(value: string): string {
    return new Intl.DateTimeFormat("en", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(new Date(value));
}

export default function LeaseShow({ lease }: { lease: Lease }) {
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const details = [
        {
            icon: Users,
            label: "Tenant",
            value: lease.tenant
                ? `${lease.tenant.first_name} ${lease.tenant.last_name}`
                : "Not assigned",
        },
        {
            icon: MapPin,
            label: "Unit",
            value: lease.unit
                ? `${lease.unit.unit_number} — ${lease.unit.property?.name || "Unknown Property"}`
                : "Not assigned",
        },
        {
            icon: Calendar,
            label: "Lease period",
            value: `${dateTime(lease.start_date)} — ${dateTime(lease.end_date)}`,
        },
        {
            icon: DollarSign,
            label: "Monthly rent",
            value: `${lease.currency} ${Number(lease.monthly_rent).toFixed(2)}`,
        },
        {
            icon: DollarSign,
            label: "Deposit amount",
            value: `${lease.currency} ${Number(lease.deposit_amount).toFixed(2)}`,
        },
        {
            icon: Calendar,
            label: "Payment due day",
            value: `Day ${lease.payment_due_day}`,
        },
    ];

    const statusColors = {
        active: "border-success/20 bg-success/10 text-success",
        expired: "border-destructive/20 bg-destructive/10 text-destructive",
        pending: "border-warning/20 bg-warning/10 text-warning",
        terminated: "border-muted-foreground/20 bg-muted-foreground/10 text-muted-foreground",
    };

    return (
        <>
            <Head title={`Lease #${lease.id} — SOMFIX`} />
            <div className="mx-auto w-full max-w-6xl p-4 md:p-6">
                <div className="mb-6 flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight">Lease #{lease.id}</h1>
                            <Badge
                                variant="outline"
                                className={statusColors[lease.status] || ""}
                            >
                                {lease.status.charAt(0).toUpperCase() + lease.status.slice(1)}
                            </Badge>
                        </div>
                        <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="size-4" /> Created{" "}
                            {dateTime(lease.created_at)}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline" size="sm">
                            <Link href={edit(lease.id)}>
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
                                    onClick={() => router.delete(destroy.url(lease.id))}
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
                                <FileText className="size-5 text-primary" /> Lease details
                            </CardTitle>
                            <CardDescription>
                                Agreement terms and payment information.
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
                                    Lease notes
                                </p>
                                <p className="mt-2 rounded-xl border border-border/70 bg-secondary/20 p-4 text-sm leading-6 text-foreground">
                                    {lease.notes || "No notes have been added."}
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
                                <Timeline label="Created" value={dateTime(lease.created_at)} />
                                <Timeline
                                    label="Last updated"
                                    value={dateTime(lease.updated_at)}
                                />
                            </CardContent>
                        </Card>
                        <Card className="border-border/70 bg-secondary/25 shadow-sm">
                            <CardContent className="p-5">
                                <p className="font-semibold">Contact information</p>
                                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                    {lease.tenant?.email && (
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">Email:</span>
                                            {lease.tenant.email}
                                        </div>
                                    )}
                                    {lease.tenant?.phone && (
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">Phone:</span>
                                            {lease.tenant.phone}
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

LeaseShow.layout = {
    breadcrumbs: [
        { title: "Leases", href: index() },
        { title: "Lease details", href: index() },
    ],
};
