import { Head } from '@inertiajs/react';
import { Building2, CircleDollarSign, Clock3, Pencil, Save, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BreadcrumbItem } from '@/types';

type GeneralSettings = {
    companyName: string;
    phone: string;
    address: string;
    taxRate: string;
    lateFeeRate: string;
    leaseTerm: string;
    rentDueDay: string;
    maintenanceResponse: string;
};

const initialSettings: GeneralSettings = {
    companyName: 'Somfix Property Operations',
    phone: '',
    address: '',
    taxRate: '0',
    lateFeeRate: '0',
    leaseTerm: '12',
    rentDueDay: '1',
    maintenanceResponse: '48',
};

function Field({
    id,
    label,
    value,
    onChange,
    disabled,
    type = 'text',
    placeholder,
}: {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    disabled: boolean;
    type?: string;
    placeholder?: string;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id} className="text-xs font-medium">
                {label}
            </Label>
            <Input
                id={id}
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                disabled={disabled}
                placeholder={placeholder}
                min={type === 'number' ? 0 : undefined}
                step={type === 'number' ? 'any' : undefined}
                className="h-10 disabled:opacity-80"
            />
        </div>
    );
}

function Section({
    icon: Icon,
    title,
    children,
}: {
    icon: typeof Building2;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section className="overflow-hidden rounded-md border bg-card">
            <div className="flex items-center gap-3 border-b px-5 py-4">
                <span className="flex size-8 items-center justify-center rounded-sm bg-secondary text-secondary-foreground">
                    <Icon className="size-4" />
                </span>
                <h2 className="text-sm font-semibold">{title}</h2>
            </div>
            <div className="grid gap-x-6 gap-y-5 p-5 sm:grid-cols-2">
                {children}
            </div>
        </section>
    );
}

export default function GeneralSettings() {
    const [settings, setSettings] = useState(initialSettings);
    const [savedSettings, setSavedSettings] = useState(initialSettings);
    const [isEditing, setIsEditing] = useState(false);

    const update = (key: keyof GeneralSettings, value: string) => {
        setSettings((current) => ({ ...current, [key]: value }));
    };

    const cancelEditing = () => {
        setSettings(savedSettings);
        setIsEditing(false);
    };

    return (
        <>
            <Head title="General Settings" />

            <main className="mx-auto w-full max-w-[1440px] p-4 md:p-6">
                <header className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="mt-2 text-xl font-semibold tracking-normal">
                            General System Settings
                        </h1>
                        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                            Configure organization details, financial defaults,
                            and day-to-day operating standards.
                        </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                        {isEditing ? (
                            <>
                                <Button variant="outline" onClick={cancelEditing}>
                                    <X />
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => {
                                        setSavedSettings(settings);
                                        setIsEditing(false);
                                    }}
                                >
                                    <Save />
                                    Save Settings
                                </Button>
                            </>
                        ) : (
                            <Button onClick={() => setIsEditing(true)}>
                                <Pencil />
                                Edit Settings
                            </Button>
                        )}
                    </div>
                </header>

                <div className="space-y-4">
                    <Section icon={Building2} title="Organization & Contact Details">
                        <Field
                            id="company-name"
                            label="Organization Name"
                            value={settings.companyName}
                            onChange={(value) => update('companyName', value)}
                            disabled={!isEditing}
                        />
                        <Field
                            id="phone"
                            label="Phone Number"
                            value={settings.phone}
                            onChange={(value) => update('phone', value)}
                            disabled={!isEditing}
                            placeholder="Add a contact number"
                        />
                        <div className="sm:col-span-2">
                            <Field
                                id="address"
                                label="Business Address"
                                value={settings.address}
                                onChange={(value) => update('address', value)}
                                disabled={!isEditing}
                                placeholder="Add an office address"
                            />
                        </div>
                    </Section>

                    <Section icon={CircleDollarSign} title="Financial Configuration">
                        <div className="grid gap-2">
                            <Label htmlFor="currency" className="text-xs font-medium">
                                Operating Currency
                            </Label>
                            <Input
                                id="currency"
                                value="USD ($)"
                                readOnly
                                className="h-10 bg-muted/50"
                            />
                        </div>
                        <Field
                            id="tax-rate"
                            label="Tax Rate (%)"
                            type="number"
                            value={settings.taxRate}
                            onChange={(value) => update('taxRate', value)}
                            disabled={!isEditing}
                        />
                        <Field
                            id="late-fee-rate"
                            label="Late Fee Rate (%)"
                            type="number"
                            value={settings.lateFeeRate}
                            onChange={(value) => update('lateFeeRate', value)}
                            disabled={!isEditing}
                        />
                    </Section>

                    <Section icon={Clock3} title="Property Operations Defaults">
                        <Field
                            id="lease-term"
                            label="Default Lease Term (months)"
                            type="number"
                            value={settings.leaseTerm}
                            onChange={(value) => update('leaseTerm', value)}
                            disabled={!isEditing}
                        />
                        <Field
                            id="rent-due-day"
                            label="Rent Due Day of Month"
                            type="number"
                            value={settings.rentDueDay}
                            onChange={(value) => update('rentDueDay', value)}
                            disabled={!isEditing}
                        />
                        <Field
                            id="maintenance-response"
                            label="Target Maintenance Response (hours)"
                            type="number"
                            value={settings.maintenanceResponse}
                            onChange={(value) => update('maintenanceResponse', value)}
                            disabled={!isEditing}
                        />
                    </Section>
                </div>

                <p className="border-t pt-4 text-xs text-muted-foreground">
                    Settings are currently stored in this page only and will reset
                    when you leave until settings persistence is connected.
                </p>
            </main>
        </>
    );
}

GeneralSettings.layout = {
    breadcrumbs: [
        {
            title: 'General Settings',
            href: '/settings-general',
        },
    ] satisfies BreadcrumbItem[],
};