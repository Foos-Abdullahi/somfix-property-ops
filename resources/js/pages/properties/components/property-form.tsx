import { Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { ArrowLeft, Building2, Save } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { index, store, update } from '@/routes/properties';

export type PropertyFormValues = {
    name: string;
    property_type: string;
    owner_name: string;
    district: string;
    city: string;
    address: string;
    units_count: string;
    status: 'active' | 'inactive';
    notes: string;
};

type PropertyFormProps = {
    mode: 'create' | 'edit';
    property?: PropertyFormValues & { id: number };
};

const fieldClassName =
    'h-10 rounded-xl border-border/70 bg-background shadow-none focus-visible:ring-primary/20';

export function PropertyForm({ mode, property }: PropertyFormProps) {
    const form = useForm<PropertyFormValues>({
        name: property?.name ?? '',
        property_type: property?.property_type ?? 'Apartment',
        owner_name: property?.owner_name ?? '',
        district: property?.district ?? '',
        city: property?.city ?? 'Mogadishu',
        address: property?.address ?? '',
        units_count: property?.units_count ?? '0',
        status: property?.status ?? 'active',
        notes: property?.notes ?? '',
    });

    function submit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();

        if (mode === 'create') {
            form.post(store.url());

            return;
        }

        form.put(update.url(property!.id));
    }

    return (
        <form onSubmit={submit} className="space-y-6">
            <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
                <div className="flex items-center gap-3 border-b border-border/70 bg-secondary/35 px-5 py-4">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Building2 className="size-4" />
                    </span>
                    <div>
                        <h2 className="font-semibold">Property profile</h2>
                        <p className="text-xs text-muted-foreground">
                            Core identity, ownership and location details.
                        </p>
                    </div>
                </div>

                <div className="grid gap-5 p-5 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="name">Property name</Label>
                        <Input
                            id="name"
                            value={form.data.name}
                            onChange={(event) =>
                                form.setData('name', event.target.value)
                            }
                            className={fieldClassName}
                            placeholder="e.g. Hodan Heights"
                        />
                        <InputError message={form.errors.name} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="property_type">Property type</Label>
                        <Select
                            value={form.data.property_type}
                            onValueChange={(value) =>
                                form.setData('property_type', value)
                            }
                        >
                            <SelectTrigger
                                id="property_type"
                                className={`w-full ${fieldClassName}`}
                                aria-invalid={Boolean(
                                    form.errors.property_type,
                                )}
                            >
                                <SelectValue placeholder="Select a property type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Apartment">
                                    Apartment
                                </SelectItem>
                                <SelectItem value="Villa">Villa</SelectItem>
                                <SelectItem value="Commercial">
                                    Commercial
                                </SelectItem>
                                <SelectItem value="Mixed use">
                                    Mixed use
                                </SelectItem>
                                <SelectItem value="Land">Land</SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={form.errors.property_type} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="owner_name">Owner name</Label>
                        <Input
                            id="owner_name"
                            value={form.data.owner_name}
                            onChange={(event) =>
                                form.setData('owner_name', event.target.value)
                            }
                            className={fieldClassName}
                            placeholder="Optional owner or organization"
                        />
                        <InputError message={form.errors.owner_name} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="status">Portfolio status</Label>
                        <Select
                            value={form.data.status}
                            onValueChange={(value) =>
                                form.setData(
                                    'status',
                                    value as PropertyFormValues['status'],
                                )
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
                                <SelectItem value="inactive">
                                    Inactive
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={form.errors.status} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="district">District</Label>
                        <Input
                            id="district"
                            value={form.data.district}
                            onChange={(event) =>
                                form.setData('district', event.target.value)
                            }
                            className={fieldClassName}
                            placeholder="e.g. Hodan"
                        />
                        <InputError message={form.errors.district} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                            id="city"
                            value={form.data.city}
                            onChange={(event) =>
                                form.setData('city', event.target.value)
                            }
                            className={fieldClassName}
                        />
                        <InputError message={form.errors.city} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="address">Street address</Label>
                        <Input
                            id="address"
                            value={form.data.address}
                            onChange={(event) =>
                                form.setData('address', event.target.value)
                            }
                            className={fieldClassName}
                            placeholder="Building, street or landmark"
                        />
                        <InputError message={form.errors.address} />
                    </div>
                </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
                <div className="border-b border-border/70 bg-secondary/35 px-5 py-4">
                    <h2 className="font-semibold">Operations setup</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Starting inventory for the property workspace.
                    </p>
                </div>
                <div className="grid gap-5 p-5 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="units_count">Number of units</Label>
                        <Input
                            id="units_count"
                            type="number"
                            min="0"
                            value={form.data.units_count}
                            onChange={(event) =>
                                form.setData('units_count', event.target.value)
                            }
                            className={fieldClassName}
                        />
                        <InputError message={form.errors.units_count} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="notes">Operational notes</Label>
                        <Textarea
                            id="notes"
                            value={form.data.notes}
                            onChange={(event) =>
                                form.setData('notes', event.target.value)
                            }
                            className="min-h-28 rounded-xl border-border/70 bg-background shadow-none focus-visible:ring-primary/20"
                            placeholder="Access details, facilities, inspection notes, or anything the operations team should know."
                        />
                        <InputError message={form.errors.notes} />
                    </div>
                </div>
            </section>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <Button asChild variant="outline" className="rounded-xl">
                    <Link href={index()}>
                        <ArrowLeft /> Back to properties
                    </Link>
                </Button>
                <Button disabled={form.processing} className="rounded-xl">
                    <Save />
                    {form.processing
                        ? 'Saving...'
                        : mode === 'create'
                          ? 'Create property'
                          : 'Save changes'}
                </Button>
            </div>
        </form>
    );
}
