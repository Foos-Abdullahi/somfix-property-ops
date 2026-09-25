import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Building2,
    Check,
    ClipboardList,
    ShieldCheck,
    Wallet,
    Wrench,
} from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { dashboard, home, login, register } from '@/routes';

const features = [
    {
        title: 'Property records',
        description:
            'Keep properties, units, tenants, leases, and documents connected.',
        icon: Building2,
    },
    {
        title: 'Maintenance workflow',
        description:
            'Move each repair from report and triage through completion.',
        icon: Wrench,
    },
    {
        title: 'Financial history',
        description:
            'Connect quotes, job orders, invoices, payments, and maintenance history.',
        icon: Wallet,
    },
];

const workflow = [
    'Report an issue',
    'Triage the request',
    'Approve the quote',
    'Schedule the technician',
    'Record completion',
    'Invoice and retain history',
];

export default function Welcome() {
    const { auth } = usePage().props;
    const primaryHref = auth.user ? dashboard() : register();
    const primaryLabel = auth.user ? 'Open dashboard' : 'Get started';

    return (
        <>
            <Head title="Property & Maintenance Operations" />

            <div className="min-h-screen bg-background text-foreground">
                <header className="border-b bg-background/90 backdrop-blur">
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                        <Link
                            href={auth.user ? dashboard() : home()}
                            className="flex items-center gap-3"
                        >
                            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <AppLogoIcon className="size-5" />
                            </span>
                            <span>
                                <span className="block text-sm font-bold tracking-tight">
                                    SOMFIX
                                </span>
                                <span className="block text-xs text-muted-foreground">
                                    Property Operations
                                </span>
                            </span>
                        </Link>

                        <nav className="flex items-center gap-2">
                            {auth.user ? (
                                <Button asChild size="sm">
                                    <Link href={dashboard()} prefetch>
                                        Dashboard
                                        <ArrowRight />
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button asChild variant="ghost" size="sm">
                                        <Link href={login()}>Log in</Link>
                                    </Button>
                                    <Button asChild size="sm">
                                        <Link href={register()}>
                                            Get started
                                            <ArrowRight />
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                <main>
                    <section className="relative overflow-hidden border-b">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.12),transparent_36%),radial-gradient(circle_at_bottom_right,hsl(var(--accent)/0.1),transparent_32%)]" />
                        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,0.9fr)_minmax(30rem,1.1fr)] lg:items-center lg:px-8 lg:py-24">
                            <div>
                                <Badge
                                    variant="outline"
                                    className="mb-6 gap-1.5 bg-card"
                                >
                                    <ShieldCheck className="size-3.5 text-primary" />
                                    Built for property and repair teams
                                </Badge>
                                <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                                    Run every property and repair from one clear
                                    workspace.
                                </h1>
                                <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                                    SOMFIX connects property records, tenant
                                    requests, technician work, invoices, and
                                    maintenance history in one practical
                                    operations system.
                                </p>

                                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                    <Button asChild size="lg">
                                        <Link href={primaryHref} prefetch>
                                            {primaryLabel}
                                            <ArrowRight />
                                        </Link>
                                    </Button>
                                    {!auth.user && (
                                        <Button
                                            asChild
                                            size="lg"
                                            variant="outline"
                                        >
                                            <Link href={login()}>Log in</Link>
                                        </Button>
                                    )}
                                </div>

                                <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
                                    {[
                                        'Property and tenancy',
                                        'Maintenance execution',
                                        'Finance and reporting',
                                    ].map((item) => (
                                        <span
                                            key={item}
                                            className="flex items-center gap-2"
                                        >
                                            <Check className="size-4 text-primary" />
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <Card className="overflow-hidden border-primary/20 bg-card shadow-xl shadow-primary/5">
                                <div className="grid min-h-[30rem] sm:grid-cols-[12rem_1fr]">
                                    <div className="bg-sidebar p-4 text-sidebar-foreground">
                                        <div className="mb-8 flex items-center gap-2">
                                            <span className="flex size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                                                <AppLogoIcon className="size-4" />
                                            </span>
                                            <span className="text-sm font-bold">
                                                SOMFIX
                                            </span>
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            {[
                                                'Dashboard',
                                                'Properties',
                                                'Units',
                                                'Tenants',
                                                'Maintenance',
                                                'Work Orders',
                                                'Finance',
                                            ].map((item, index) => (
                                                <div
                                                    key={item}
                                                    className={`rounded-md px-3 py-2 ${index === 0 ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/75'}`}
                                                >
                                                    {item}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-5">
                                        <div className="mb-6 flex items-center justify-between">
                                            <div>
                                                <p className="text-lg font-bold">
                                                    Operations overview
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Foundation workspace
                                                </p>
                                            </div>
                                            <span className="size-8 rounded-full bg-muted" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                ['Properties', '—'],
                                                ['Open requests', '—'],
                                                ['Scheduled jobs', '—'],
                                                ['Unpaid invoices', '—'],
                                            ].map(([label, value]) => (
                                                <div
                                                    key={label}
                                                    className="rounded-lg border bg-background p-3"
                                                >
                                                    <p className="text-xs text-muted-foreground">
                                                        {label}
                                                    </p>
                                                    <p className="mt-2 text-xl font-bold">
                                                        {value}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-4 rounded-lg border border-dashed p-5">
                                            <div className="mb-4 flex items-center gap-3">
                                                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                    <ClipboardList className="size-4" />
                                                </span>
                                                <div>
                                                    <p className="text-sm font-semibold">
                                                        Startup complete
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Ready for domain records
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                {[
                                                    'Routes',
                                                    'Sidebar',
                                                    'Page layouts',
                                                ].map((item) => (
                                                    <div
                                                        key={item}
                                                        className="flex items-center justify-between rounded-md bg-muted/60 px-3 py-2 text-xs"
                                                    >
                                                        <span>{item}</span>
                                                        <span className="flex items-center gap-1 text-primary">
                                                            <Check className="size-3" />
                                                            Ready
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </section>

                    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <Badge variant="secondary">
                                One connected workflow
                            </Badge>
                            <h2 className="mt-4 text-3xl font-bold tracking-tight">
                                From maintenance report to retained history
                            </h2>
                            <p className="mt-4 text-muted-foreground">
                                Each operational step stays connected to the
                                property, unit, tenant, job, and payment that
                                created it.
                            </p>
                        </div>

                        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {workflow.map((step, index) => (
                                <li
                                    key={step}
                                    className="flex items-center gap-3 rounded-xl border bg-card p-4"
                                >
                                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                                        {index + 1}
                                    </span>
                                    <span className="text-sm font-medium">
                                        {step}
                                    </span>
                                </li>
                            ))}
                        </ol>

                        <div className="mt-16 grid gap-5 md:grid-cols-3">
                            {features.map((feature) => (
                                <Card key={feature.title} className="gap-4">
                                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <feature.icon className="size-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">
                                            {feature.title}
                                        </h3>
                                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                            {feature.description}
                                        </p>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </section>
                </main>

                <footer className="border-t py-8">
                    <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                        <span>SOMFIX Property & Maintenance Operations</span>
                        <span>Designed for practical service in Mogadishu</span>
                    </div>
                </footer>
            </div>
        </>
    );
}
