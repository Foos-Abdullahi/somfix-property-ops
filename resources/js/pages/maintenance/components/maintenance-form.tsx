import { Link, router, useForm } from "@inertiajs/react";
import type { FormEvent } from "react";
import { ArrowLeft, Save, Wrench } from "lucide-react";
import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { create, index, store, update } from "@/routes/maintenance";

export type MaintenanceFormValues = {
    property_id: string;
    unit_id: string;
    tenant_id: string;
    category: string;
    priority: "low" | "medium" | "high" | "urgent";
    title: string;
    description: string;
    status: "open" | "in_progress" | "scheduled" | "completed" | "cancelled";
    assigned_to: string;
    scheduled_date: string;
    completed_date: string;
    estimated_cost: string;
    actual_cost: string;
    notes: string;
};

type MaintenanceFormProps = {
    mode: "create" | "edit";
    maintenance?: MaintenanceFormValues & { id: number };
    properties?: Array<{ id: number; name: string }>;
    units?: Array<{ id: number; unit_number: string; property?: { name: string } }>;
    tenants?: Array<{ id: number; first_name: string; last_name: string }>;
};

const fieldClassName =
    "h-10 rounded-xl border-border/70 bg-background shadow-none focus-visible:ring-primary/20";

export function MaintenanceForm({
    mode,
    maintenance,
    properties = [],
    units = [],
    tenants = [],
}: MaintenanceFormProps) {
    const form = useForm<MaintenanceFormValues>({
        property_id: maintenance?.property_id ?? "",
        unit_id: maintenance?.unit_id ?? "",
        tenant_id: maintenance?.tenant_id ?? "",
        category: maintenance?.category ?? "general",
        priority: maintenance?.priority ?? "medium",
        title: maintenance?.title ?? "",
        description: maintenance?.description ?? "",
        status: maintenance?.status ?? "open",
        assigned_to: maintenance?.assigned_to ?? "",
        scheduled_date: maintenance?.scheduled_date ?? "",
        completed_date: maintenance?.completed_date ?? "",
        estimated_cost: maintenance?.estimated_cost ?? "",
        actual_cost: maintenance?.actual_cost ?? "",
        notes: maintenance?.notes ?? "",
    });

    function submit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();

        if (mode === "create") {
            router.post(store.url(), form.data);

            return;
        }

        router.put(update.url(maintenance!.id), form.data);
    }

    return (
        <form onSubmit={submit} className="space-y-6">
            <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
                <div className="flex items-center gap-3 border-b border-border/70 bg-secondary/35 px-5 py-4">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Wrench className="size-4" />
                    </span>
                    <div>
                        <h2 className="font-semibold">Request details</h2>
                        <p className="text-xs text-muted-foreground">
                            Property, unit, and maintenance information.
                        </p>
                    </div>
                </div>

                <div className="grid gap-5 p-5 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="property_id">Property</Label>
                        <Select
                            value={form.data.property_id}
                            onValueChange={(value) => form.setData("property_id", value)}
                        >
                            <SelectTrigger
                                id="property_id"
                                className={`w-full ${fieldClassName}`}
                                aria-invalid={Boolean(form.errors.property_id)}
                            >
                                <SelectValue placeholder="Select a property" />
                            </SelectTrigger>
                            <SelectContent>
                                {properties.map((property) => (
                                    <SelectItem key={property.id} value={String(property.id)}>
                                        {property.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={form.errors.property_id} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="unit_id">Unit (optional)</Label>
                        <Select
                            value={form.data.unit_id}
                            onValueChange={(value) => form.setData("unit_id", value)}
                        >
                            <SelectTrigger
                                id="unit_id"
                                className={`w-full ${fieldClassName}`}
                                aria-invalid={Boolean(form.errors.unit_id)}
                            >
                                <SelectValue placeholder="Select a unit" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">None</SelectItem>
                                {units.map((unit) => (
                                    <SelectItem key={unit.id} value={String(unit.id)}>
                                        {unit.unit_number} — {unit.property?.name || 'Unknown Property'}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={form.errors.unit_id} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="tenant_id">Tenant (optional)</Label>
                        <Select
                            value={form.data.tenant_id}
                            onValueChange={(value) => form.setData("tenant_id", value)}
                        >
                            <SelectTrigger
                                id="tenant_id"
                                className={`w-full ${fieldClassName}`}
                                aria-invalid={Boolean(form.errors.tenant_id)}
                            >
                                <SelectValue placeholder="Select a tenant" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">None</SelectItem>
                                {tenants.map((tenant) => (
                                    <SelectItem key={tenant.id} value={String(tenant.id)}>
                                        {tenant.first_name} {tenant.last_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={form.errors.tenant_id} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                            value={form.data.category}
                            onValueChange={(value) => form.setData("category", value)}
                        >
                            <SelectTrigger
                                id="category"
                                className={`w-full ${fieldClassName}`}
                                aria-invalid={Boolean(form.errors.category)}
                            >
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="plumbing">Plumbing</SelectItem>
                                <SelectItem value="electrical">Electrical</SelectItem>
                                <SelectItem value="hvac">HVAC</SelectItem>
                                <SelectItem value="structural">Structural</SelectItem>
                                <SelectItem value="appliances">Appliances</SelectItem>
                                <SelectItem value="general">General</SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={form.errors.category} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select
                            value={form.data.priority}
                            onValueChange={(value) =>
                                form.setData("priority", value as MaintenanceFormValues["priority"])
                            }
                        >
                            <SelectTrigger
                                id="priority"
                                className={`w-full ${fieldClassName}`}
                                aria-invalid={Boolean(form.errors.priority)}
                            >
                                <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={form.errors.priority} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                            value={form.data.status}
                            onValueChange={(value) =>
                                form.setData("status", value as MaintenanceFormValues["status"])
                            }
                        >
                            <SelectTrigger
                                id="status"
                                className={`w-full ${fieldClassName}`}
                                aria-invalid={Boolean(form.errors.status)}
                            >
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="scheduled">Scheduled</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={form.errors.status} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={form.data.title}
                            onChange={(event) => form.setData("title", event.target.value)}
                            className={fieldClassName}
                            placeholder="Brief description of the issue"
                        />
                        <InputError message={form.errors.title} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={form.data.description}
                            onChange={(event) => form.setData("description", event.target.value)}
                            className="min-h-28 rounded-xl border-border/70 bg-background shadow-none focus-visible:ring-primary/20"
                            placeholder="Detailed description of the maintenance issue"
                        />
                        <InputError message={form.errors.description} />
                    </div>
                </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
                <div className="border-b border-border/70 bg-secondary/35 px-5 py-4">
                    <h2 className="font-semibold">Assignment & scheduling</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Who to assign and when to schedule the work.
                    </p>
                </div>
                <div className="grid gap-5 p-5 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="assigned_to">Assigned to</Label>
                        <Input
                            id="assigned_to"
                            value={form.data.assigned_to}
                            onChange={(event) => form.setData("assigned_to", event.target.value)}
                            className={fieldClassName}
                            placeholder="Technician or service provider name"
                        />
                        <InputError message={form.errors.assigned_to} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="scheduled_date">Scheduled date</Label>
                        <Input
                            id="scheduled_date"
                            type="date"
                            value={form.data.scheduled_date}
                            onChange={(event) => form.setData("scheduled_date", event.target.value)}
                            className={fieldClassName}
                        />
                        <InputError message={form.errors.scheduled_date} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="completed_date">Completed date</Label>
                        <Input
                            id="completed_date"
                            type="date"
                            value={form.data.completed_date}
                            onChange={(event) => form.setData("completed_date", event.target.value)}
                            className={fieldClassName}
                        />
                        <InputError message={form.errors.completed_date} />
                    </div>
                </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
                <div className="border-b border-border/70 bg-secondary/35 px-5 py-4">
                    <h2 className="font-semibold">Cost information</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Estimated and actual costs for the maintenance work.
                    </p>
                </div>
                <div className="grid gap-5 p-5 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="estimated_cost">Estimated cost</Label>
                        <Input
                            id="estimated_cost"
                            type="number"
                            step="0.01"
                            min="0"
                            value={form.data.estimated_cost}
                            onChange={(event) => form.setData("estimated_cost", event.target.value)}
                            className={fieldClassName}
                            placeholder="0.00"
                        />
                        <InputError message={form.errors.estimated_cost} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="actual_cost">Actual cost</Label>
                        <Input
                            id="actual_cost"
                            type="number"
                            step="0.01"
                            min="0"
                            value={form.data.actual_cost}
                            onChange={(event) => form.setData("actual_cost", event.target.value)}
                            className={fieldClassName}
                            placeholder="0.00"
                        />
                        <InputError message={form.errors.actual_cost} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            value={form.data.notes}
                            onChange={(event) => form.setData("notes", event.target.value)}
                            className="min-h-28 rounded-xl border-border/70 bg-background shadow-none focus-visible:ring-primary/20"
                            placeholder="Additional notes about the maintenance request"
                        />
                        <InputError message={form.errors.notes} />
                    </div>
                </div>
            </section>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <Button asChild variant="outline" className="rounded-xl">
                    <Link href={index()}>
                        <ArrowLeft /> Back to maintenance
                    </Link>
                </Button>
                <Button disabled={form.processing} className="rounded-xl">
                    <Save />
                    {form.processing
                        ? "Saving..."
                        : mode === "create"
                          ? "Create request"
                          : "Save changes"}
                </Button>
            </div>
        </form>
    );
}
