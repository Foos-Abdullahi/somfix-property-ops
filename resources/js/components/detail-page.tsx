import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Pencil, Trash2, type LucideIcon } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export type DetailSection = {
    title: string;
    fields?: { label: string; value: ReactNode }[];
    metric?: { label: string; value: ReactNode };
    text?: string | null;
};

export function label(value: string) {
    return value
        .replaceAll('_', ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function money(value: string | number | null, currency = 'USD') {
    if (value === null || value === '') return 'Not recorded';
    return new Intl.NumberFormat('en', { style: 'currency', currency }).format(
        Number(value),
    );
}

export function date(value: string | null | undefined) {
    if (!value) return 'Not set';
    const parsed = new Date(value.slice(0, 10) + 'T00:00:00');
    return Number.isNaN(parsed.getTime())
        ? 'Not set'
        : new Intl.DateTimeFormat('en', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
          }).format(parsed);
}

function Section({ section }: { section: DetailSection }) {
    return (
        <Card className="min-w-0 gap-3 rounded-xs py-4 shadow-none">
            <CardHeader className="px-4">
                <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    {section.title}
                </h2>
            </CardHeader>
            <CardContent className="space-y-4 px-4">
                {section.metric && (
                    <div className="rounded-xs bg-muted/50 p-3">
                        <p className="text-xs text-muted-foreground">
                            {section.metric.label}
                        </p>
                        <p className="mt-1 text-2xl font-semibold tracking-tight break-words tabular-nums">
                            {section.metric.value}
                        </p>
                    </div>
                )}
                {section.fields && (
                    <dl className="divide-y divide-border/60">
                        {section.fields.map((field) => (
                            <div
                                key={field.label}
                                className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3 first:pt-0 last:pb-0"
                            >
                                <dt className="text-sm text-muted-foreground">
                                    {field.label}
                                </dt>
                                <dd className="min-w-0 text-sm font-medium [overflow-wrap:anywhere] break-words whitespace-pre-wrap">
                                    {field.value === null ||
                                    field.value === undefined ||
                                    field.value === ''
                                        ? 'Not provided'
                                        : field.value}
                                </dd>
                            </div>
                        ))}
                    </dl>
                )}
                {section.text !== undefined && (
                    <p className="text-sm leading-7 [overflow-wrap:anywhere] break-words whitespace-pre-wrap">
                        {section.text?.trim() ||
                            `No ${section.title.toLowerCase()} added.`}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

export default function DetailPage({
    title,
    subtitle,
    status,
    icon: Icon,
    backHref,
    editHref,
    deleteHref,
    summary,
    sections,
    aside = [],
    badge,
}: {
    title: string;
    subtitle?: string;
    status: string;
    icon: LucideIcon;
    backHref: string;
    editHref: string;
    deleteHref: string;
    summary: DetailSection[];
    sections: DetailSection[];
    aside?: DetailSection[];
    badge?: string;
}) {
    const [confirming, setConfirming] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const positive = [
        'active',
        'completed',
        'paid',
        'available',
        'in_stock',
    ].includes(status);
    const negative = [
        'cancelled',
        'terminated',
        'overdue',
        'out_of_stock',
    ].includes(status);

    return (
        <>
            <Head title={`${title} — SOMFIX`} />
            <div className="mx-auto w-full max-w-screen-2xl space-y-3 p-4 sm:p-6">
                <header className="flex flex-col gap-4 rounded-xs border bg-card p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex min-w-0 items-center gap-4">
                        <div className="flex size-14 shrink-0 items-center justify-center rounded-xs border border-primary/15 bg-primary/10 text-primary">
                            <Icon className="size-6" aria-hidden="true" />
                        </div>
                        <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-xl font-bold [overflow-wrap:anywhere] break-words">
                                    {title}
                                </h1>
                                <Badge
                                    variant={
                                        negative
                                            ? 'destructive'
                                            : positive
                                              ? 'default'
                                              : 'secondary'
                                    }
                                    className="rounded-xs text-[11px]"
                                >
                                    {label(status)}
                                </Badge>
                                {badge && (
                                    <Badge
                                        variant="outline"
                                        className="rounded-xs text-[11px]"
                                    >
                                        {badge}
                                    </Badge>
                                )}
                            </div>
                            {subtitle && (
                                <p className="text-sm break-words text-muted-foreground">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                        <Button asChild variant="outline" size="sm">
                            <Link href={backHref}>
                                <ArrowLeft />
                                Back
                            </Link>
                        </Button>
                        <Button asChild size="sm">
                            <Link href={editHref}>
                                <Pencil />
                                Edit
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            aria-expanded={confirming}
                            onClick={() => setConfirming(!confirming)}
                            className="text-destructive hover:text-destructive"
                        >
                            <Trash2 />
                            Delete
                        </Button>
                    </div>
                </header>
                {confirming && (
                    <div
                        role="alert"
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xs border border-destructive/30 bg-card p-4"
                    >
                        <p className="text-sm">
                            Delete <strong>{title}</strong>? This action cannot
                            be undone.
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={deleting}
                                onClick={() => setConfirming(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                disabled={deleting}
                                onClick={() =>
                                    router.delete(deleteHref, {
                                        onStart: () => setDeleting(true),
                                        onFinish: () => setDeleting(false),
                                    })
                                }
                            >
                                {deleting ? 'Deleting…' : 'Confirm delete'}
                            </Button>
                        </div>
                    </div>
                )}
                <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-12">
                    <div className="min-w-0 space-y-3 lg:col-span-4 xl:col-span-3">
                        {summary.map((section) => (
                            <Section key={section.title} section={section} />
                        ))}
                    </div>
                    <div
                        className={
                            aside.length
                                ? 'min-w-0 space-y-3 lg:col-span-8 xl:col-span-6'
                                : 'min-w-0 space-y-3 lg:col-span-8 xl:col-span-9'
                        }
                    >
                        {sections.map((section) => (
                            <Section key={section.title} section={section} />
                        ))}
                    </div>
                    {aside.length > 0 && (
                        <div className="min-w-0 space-y-3 lg:col-span-12 xl:col-span-3">
                            {aside.map((section) => (
                                <Section
                                    key={section.title}
                                    section={section}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
