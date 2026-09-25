import { Link, router, useForm } from "@inertiajs/react";
import type { FormEvent } from "react";
import { ArrowLeft, FileText, Save } from "lucide-react";
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
import { create, index, store, update } from "@/routes/leases";

export type LeaseFormValues = {
    tenant_id: string;
    unit_id: string;
    start_date: string;
    end_date: string;
    monthly_rent: string;
    deposit_amount: string;
    status: "active" | "expired" | "pending" | "terminated";
    payment_due_day: string;
    currency: string;
    notes: string;
};

type LeaseFormProps = {
    mode: "create" | "edit";
    lease?: LeaseFormValues & { id: number };
    tenants?: Array<{ id: number; first_name: string; last_name: string }>;
    units?: Array<{ id: number; unit_number: string; property?: { name: string } }>;
};

const fieldClassName =
    "h-10 rounded-xl border-border/70 bg-background shadow-none focus-visible:ring-primary/20";

export function LeaseForm({ mode, lease, tenants = [], units = [] }: LeaseFormProps) {
    const form = useForm<LeaseFormValues>({
        tenant_id: lease?.tenant_id ?? "",
        unit_id: lease?.unit_id ?? "",
        start_date: lease?.start_date ?? "",
        end_date: lease?.end_date ?? "",
        monthly_rent: lease?.monthly_rent ?? "",
        deposit_amount: lease?.deposit_amount ?? "",
        status: lease?.status ?? "active",
        payment_due_day: lease?.payment_due_day ?? "1",
        currency: lease?.currency ?? "USD",
        notes: lease?.notes ?? "",
    });

    function submit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();

        if (mode === "create") {
            router.post(store.url(), form.data);

            return;
        }

        router.put(update.url(lease!.id), form.data);
    }

    return (
        <form onSubmit={submit} className="space-y-6">
            <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
                <div className="flex items-center gap-3 border-b border-border/70 bg-secondary/35 px-5 py-4">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <FileText className="size-4" />
                    </span>
                    <div>
                        <h2 className="font-semibold">Lease agreement</h2>
                        <p className="text-xs text-muted-foreground">
                            Connect tenant, unit, and payment terms.
                        </p>
                    </div>
                </div>

                <div className="grid gap-5 p-5 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="tenant_id">Tenant</Label>
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
                        <Label htmlFor="unit_id">Unit</Label>
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
                        <Label htmlFor="start_date">Start date</Label>
                        <Input
                            id="start_date"
                            type="date"
                            value={form.data.start_date}
                            onChange={(event) => form.setData("start_date", event.target.value)}
                            className={fieldClassName}
                        />
                        <InputError message={form.errors.start_date} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="end_date">End date</Label>
                        <Input
                            id="end_date"
                            type="date"
                            value={form.data.end_date}
                            onChange={(event) => form.setData("end_date", event.target.value)}
                            className={fieldClassName}
                        />
                        <InputError message={form.errors.end_date} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="status">Lease status</Label>
                        <Select
                            value={form.data.status}
                            onValueChange={(value) =>
                                form.setData("status", value as LeaseFormValues["status"])
                            }
                        >
                            <SelectTrigger
                                id="status"
                                className={`w-full ${fieldClassName}`}
                                aria-invalid={Boolean(form.errors.status)}
                            >
                                <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="expired">Expired</SelectItem>
                                <SelectItem value="terminated">Terminated</SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={form.errors.status} />
                    </div>
                </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
                <div className="border-b border-border/70 bg-secondary/35 px-5 py-4">
                    <h2 className="font-semibold">Payment terms</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Rent amount, deposit, and payment schedule.
                    </p>
                </div>
                <div className="grid gap-5 p-5 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="monthly_rent">Monthly rent</Label>
                        <Input
                            id="monthly_rent"
                            type="number"
                            step="0.01"
                            min="0"
                            value={form.data.monthly_rent}
                            onChange={(event) => form.setData("monthly_rent", event.target.value)}
                            className={fieldClassName}
                            placeholder="0.00"
                        />
                        <InputError message={form.errors.monthly_rent} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="deposit_amount">Deposit amount</Label>
                        <Input
                            id="deposit_amount"
                            type="number"
                            step="0.01"
                            min="0"
                            value={form.data.deposit_amount}
                            onChange={(event) => form.setData("deposit_amount", event.target.value)}
                            className={fieldClassName}
                            placeholder="0.00"
                        />
                        <InputError message={form.errors.deposit_amount} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <Select
                            value={form.data.currency}
                            onValueChange={(value) => form.setData("currency", value)}
                        >
                            <SelectTrigger
                                id="currency"
                                className={`w-full ${fieldClassName}`}
                                aria-invalid={Boolean(form.errors.currency)}
                            >
                                <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="USD">USD</SelectItem>
                                <SelectItem value="EUR">EUR</SelectItem>
                                <SelectItem value="GBP">GBP</SelectItem>
                                <SelectItem value="SOS">SOS</SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={form.errors.currency} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="payment_due_day">Payment due day</Label>
                        <Select
                            value={form.data.payment_due_day}
                            onValueChange={(value) => form.setData("payment_due_day", value)}
                        >
                            <SelectTrigger
                                id="payment_due_day"
                                className={`w-full ${fieldClassName}`}
                                aria-invalid={Boolean(form.errors.payment_due_day)}
                            >
                                <SelectValue placeholder="Select due day" />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.from({ length: 28 }, (_, i) => (
                                    <SelectItem key={i + 1} value={String(i + 1)}>
                                        Day {i + 1}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={form.errors.payment_due_day} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="notes">Lease notes</Label>
                        <Textarea
                            id="notes"
                            value={form.data.notes}
                            onChange={(event) => form.setData("notes", event.target.value)}
                            className="min-h-28 rounded-xl border-border/70 bg-background shadow-none focus-visible:ring-primary/20"
                            placeholder="Special terms, conditions, or notes about this lease agreement."
                        />
                        <InputError message={form.errors.notes} />
                    </div>
                </div>
            </section>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <Button asChild variant="outline" className="rounded-xl">
                    <Link href={index()}>
                        <ArrowLeft /> Back to leases
                    </Link>
                </Button>
                <Button disabled={form.processing} className="rounded-xl">
                    <Save />
                    {form.processing
                        ? "Saving..."
                        : mode === "create"
                          ? "Create lease"
                          : "Save changes"}
                </Button>
            </div>
        </form>
    );
}
