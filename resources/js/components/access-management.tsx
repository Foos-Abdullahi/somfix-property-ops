import { Head, Link, router } from '@inertiajs/react';
import { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { StatsCard, type StatSection } from '@/components/tools/StatsCard';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};
export const selectClass =
    'h-9 rounded-xs border border-input bg-background px-3 text-sm';
export const tableClass =
    'w-full text-left text-sm [&_th]:px-4 [&_th]:py-3 [&_th]:font-medium [&_th]:text-muted-foreground [&_td]:px-4 [&_td]:py-3 [&_tr]:border-b';

export function AccessPage({
    title,
    description,
    children,
    actions,
    stats,
}: {
    title: string;
    description: string;
    children: ReactNode;
    actions?: ReactNode;
    stats?: StatSection[];
}) {
    return (
        <>
            <Head title={title} />
            <div className="p-4 md:p-6">
                <header className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="page-title-enter text-lg font-semibold">{title}</h1>
                        <p className="page-description-enter text-xs text-muted-foreground">
                            {description}
                        </p>
                    </div>
                    {actions}
                </header>
                {stats && <StatsCard sections={stats} />}
                <div className="mt-6 animate-in space-y-4 duration-1000 ease-in-out fade-in slide-in-from-bottom-6">
                    {children}
                </div>
            </div>
        </>
    );
}

export function Errors({ errors }: { errors: Record<string, string> }) {
    return Object.keys(errors).length > 0 ? (
        <div
            role="alert"
            className="rounded-xs border border-destructive/30 p-3 text-sm text-destructive"
        >
            {Object.entries(errors).map(([key, error]) => (
                <p key={key}>{error}</p>
            ))}
        </div>
    ) : null;
}

export function Pagination({
    page,
}: {
    page: Omit<Paginated<unknown>, 'data'>;
}) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">
                {page.total} records · Page {page.current_page} of{' '}
                {page.last_page}
            </span>
            <div className="flex gap-2">
                {page.prev_page_url && (
                    <Button variant="outline" size="sm" asChild>
                        <Link href={page.prev_page_url} preserveScroll>
                            Previous
                        </Link>
                    </Button>
                )}
                {page.next_page_url && (
                    <Button variant="outline" size="sm" asChild>
                        <Link href={page.next_page_url} preserveScroll>
                            Next
                        </Link>
                    </Button>
                )}
            </div>
        </div>
    );
}

export function DeleteRecord({
    url,
    name,
    onClose,
}: {
    url: string;
    name: string;
    onClose: () => void;
}) {
    const [busy, setBusy] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    return (
        <Dialog
            open
            onOpenChange={(open) => {
                if (!open && !busy) onClose();
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete {name}?</DialogTitle>
                    <DialogDescription>
                        This cannot be undone. Existing audit history will be
                        retained.
                    </DialogDescription>
                </DialogHeader>
                <Errors errors={errors} />
                <div className="flex justify-end gap-2">
                    <Button variant="outline" disabled={busy} onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        disabled={busy}
                        onClick={() =>
                            router.delete(url, {
                                onStart: () => setBusy(true),
                                onFinish: () => setBusy(false),
                                onError: setErrors,
                                onSuccess: onClose,
                            })
                        }
                    >
                        {busy ? 'Deleting…' : 'Delete'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
