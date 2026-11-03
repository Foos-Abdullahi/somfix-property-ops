import { Plus } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export type CustomerOption = {
    id: number;
    name: string;
    phone?: string | null;
};

const NONE = "__none__";
const ADD = "__add__";

const fieldClass =
    "h-10 rounded-xl border-border/70 bg-background shadow-none focus-visible:ring-primary/20";

function xsrfToken(): string {
    const token = document.cookie
        .split("; ")
        .find((cookie) => cookie.startsWith("XSRF-TOKEN="))
        ?.slice("XSRF-TOKEN=".length);

    return decodeURIComponent(token ?? "");
}

type Props = {
    id?: string;
    label?: string;
    value: string;
    customers: CustomerOption[];
    onChange: (value: string) => void;
    error?: string;
};

/**
 * Customer picker with an inline "Add new customer" dialog. A freshly created
 * customer is added to the list and selected immediately.
 */
export function CustomerSelect({
    id = "customer_id",
    label = "Customer (optional)",
    value,
    customers,
    onChange,
    error,
}: Props) {
    const [extra, setExtra] = useState<CustomerOption[]>([]);
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [type, setType] = useState("individual");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [busy, setBusy] = useState(false);

    const options = [
        ...customers,
        ...extra.filter((c) => !customers.some((x) => x.id === c.id)),
    ];

    function reset(): void {
        setName("");
        setPhone("");
        setType("individual");
        setErrors({});
    }

    async function save(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        event.stopPropagation();

        if (busy) {
            return;
        }

        setBusy(true);
        setErrors({});

        try {
            const response = await fetch("/sales/customers/quick", {
                method: "POST",
                credentials: "same-origin",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "X-XSRF-TOKEN": xsrfToken(),
                },
                body: JSON.stringify({ name, phone, type }),
            });

            if (response.status === 403) {
                setErrors({
                    form: "You do not have permission to add customers.",
                });

                return;
            }

            if (!response.ok) {
                const body = await response.json().catch(() => null);
                const fieldErrors: Record<string, string> = {};

                for (const [key, messages] of Object.entries(
                    (body?.errors ?? {}) as Record<string, string[]>,
                )) {
                    fieldErrors[key] = messages[0];
                }

                setErrors(
                    Object.keys(fieldErrors).length
                        ? fieldErrors
                        : { form: "Could not save the customer. Try again." },
                );

                return;
            }

            const customer = (await response.json()) as CustomerOption;
            setExtra((current) => [...current, customer]);
            onChange(String(customer.id));
            setOpen(false);
            reset();
        } catch {
            setErrors({ form: "Network error. Check your connection." });
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="space-y-2">
            <Label htmlFor={id}>{label}</Label>
            <Select
                value={value || NONE}
                onValueChange={(next) => {
                    if (next === ADD) {
                        setOpen(true);

                        return;
                    }

                    onChange(next === NONE ? "" : next);
                }}
            >
                <SelectTrigger
                    id={id}
                    className={`w-full ${fieldClass}`}
                    aria-invalid={Boolean(error)}
                >
                    <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={NONE}>No customer</SelectItem>
                    {options.map((customer) => (
                        <SelectItem
                            key={customer.id}
                            value={String(customer.id)}
                        >
                            {customer.name}
                            {customer.phone ? ` · ${customer.phone}` : ""}
                        </SelectItem>
                    ))}
                    <SelectItem
                        value={ADD}
                        className="font-medium text-primary"
                    >
                        <Plus className="size-4" />
                        Add new customer…
                    </SelectItem>
                </SelectContent>
            </Select>
            {error && <p className="text-sm text-destructive">{error}</p>}

            <Dialog
                open={open}
                onOpenChange={(next) => {
                    setOpen(next);

                    if (!next) {
                        reset();
                    }
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <form onSubmit={save} className="space-y-4">
                        <DialogHeader>
                            <DialogTitle>Add new customer</DialogTitle>
                            <DialogDescription>
                                Quick details only. You can complete the profile
                                later under Sales &amp; Jobs.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-2">
                            <Label htmlFor="quick_customer_name">Name</Label>
                            <Input
                                id="quick_customer_name"
                                className={fieldClass}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoFocus
                                required
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">
                                    {errors.name}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="quick_customer_phone">Phone</Label>
                            <Input
                                id="quick_customer_phone"
                                className={fieldClass}
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                            />
                            {errors.phone && (
                                <p className="text-sm text-destructive">
                                    {errors.phone}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="quick_customer_type">Type</Label>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger
                                    id="quick_customer_type"
                                    className={`w-full ${fieldClass}`}
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="individual">
                                        Individual
                                    </SelectItem>
                                    <SelectItem value="company">
                                        Company
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {errors.form && (
                            <p className="text-sm text-destructive">
                                {errors.form}
                            </p>
                        )}
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={busy}>
                                {busy ? "Saving..." : "Save customer"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
