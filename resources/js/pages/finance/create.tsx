import { Head, Link } from '@inertiajs/react';
import { FileText, Receipt } from 'lucide-react';
import { create, index } from '@/routes/finance';

const DOCUMENT_TYPES = [
    {
        key: 'invoice',
        label: 'Invoice',
        description: 'Bill a tenant or client for rent, services, or maintenance.',
        icon: Receipt,
        href: '/finance/create/invoice',
        color: 'text-primary',
        bg: 'bg-primary/10 border-primary/20',
    },
    {
        key: 'quote',
        label: 'Quotation',
        description: 'Send a price quote to a tenant or prospective client.',
        icon: FileText,
        href: '/finance/create/quote',
        color: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800',
    },
] as const;

export default function FinanceCreate() {
    return (
        <>
            <Head title="Create Finance Record — SOMFIX" />
            <div className="w-full p-4 md:p-6">
                <div className="mb-8">
                    <h1 className="text-lg font-semibold">Create Finance Document</h1>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Choose the type of document you want to generate.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-2xl">
                    {DOCUMENT_TYPES.map((type) => {
                        const Icon = type.icon;
                        return (
                            <Link
                                key={type.key}
                                href={type.href}
                                className="group flex flex-col gap-4 rounded-xl border-2 border-border/70 bg-card p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                            >
                                <div className={`flex size-12 items-center justify-center rounded-lg border ${type.bg}`}>
                                    <Icon className={`size-6 ${type.color}`} />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">{type.label}</p>
                                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                                        {type.description}
                                    </p>
                                </div>
                                <span className="mt-auto text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                                    Create {type.label} →
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </>
    );
}

FinanceCreate.layout = {
    breadcrumbs: [
        { title: 'Finance', href: index() },
        { title: 'Create document', href: create() },
    ],
};
