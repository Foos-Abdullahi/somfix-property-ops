import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";
import {
    ArrowLeft,
    Building2,
    Calendar,
    Edit,
    FileText,
    MapPin,
    Trash2,
    Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { destroy, edit, index } from "@/routes/properties";

type Property = {
    id: number;
    name: string;
    property_type: string;
    owner_name: string | null;
    district: string | null;
    city: string;
    address: string | null;
    units_count: number;
    status: "active" | "inactive";
    notes: string | null;
    created_at: string;
    updated_at: string;
};

function dateTime(value: string): string {
    return new Intl.DateTimeFormat("en", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(new Date(value));
}

export default function PropertyShow({ property }: { property: Property }) {
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const details = [
        {
            icon: MapPin,
            label: "Location",
            value:
                [property.address, property.district, property.city].filter(Boolean).join(", ") ||
                "Not provided",
        },
        { icon: Users, label: "Owner", value: property.owner_name || "Not assigned" },
        { icon: Building2, label: "Property type", value: property.property_type },
        { icon: Users, label: "Registered units", value: String(property.units_count) },
    ];

    return (
        <>
            <Head title={`${property.name} — SOMFIX`} />
            <div className="mx-auto w-full max-w-6xl p-4 md:p-6">
                <div className="mb-6 flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight">{property.name}</h1>
                            <Badge
                                variant="outline"
                                className={
                                    property.status === "active"
                                        ? "border-primary/20 bg-primary/10 text-primary"
                                        : "border-border bg-muted text-muted-foreground"
                                }
                            >
                                {property.status === "active" ? "Active" : "Inactive"}
                            </Badge>
                            <Badge variant="outline">{property.property_type}</Badge>
                        </div>
                        <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="size-4" /> Registered{" "}
                            {dateTime(property.created_at)}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline" size="sm">
                            <Link href={edit(property.id)}>
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
                                    onClick={() => router.delete(destroy.url(property.id))}
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
                                <Building2 className="size-5 text-primary" /> Property overview
                            </CardTitle>
                            <CardDescription>
                                Operational information for this portfolio location.
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
                                    Operational notes
                                </p>
                                <p className="mt-2 rounded-xl border border-border/70 bg-secondary/20 p-4 text-sm leading-6 text-foreground">
                                    {property.notes || "No operational notes have been added."}
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
                                <Timeline label="Created" value={dateTime(property.created_at)} />
                                <Timeline
                                    label="Last updated"
                                    value={dateTime(property.updated_at)}
                                />
                            </CardContent>
                        </Card>
                        <Card className="border-border/70 bg-secondary/25 shadow-sm">
                            <CardContent className="p-5">
                                <p className="font-semibold">Next: unit inventory</p>
                                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                    Add unit-level records to track occupancy, leases and
                                    maintenance on this property.
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

PropertyShow.layout = {
    breadcrumbs: [
        { title: "Properties", href: index() },
        { title: "Property details", href: index() },
    ],
};
