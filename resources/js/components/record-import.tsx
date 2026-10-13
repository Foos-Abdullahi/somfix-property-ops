import { router } from '@inertiajs/react';
import { Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type ImportResult = {
    imported: number;
    duplicates: number;
    invalid: number;
    issues: { row: number; message: string }[];
};

export function RecordImport({
    module,
}: {
    module: 'tenants' | 'service-team';
}) {
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [busy, setBusy] = useState(false);
    const busyRef = useRef(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<ImportResult | null>(null);

    async function upload(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!file || busyRef.current) return;
        if (file.size > 5 * 1024 * 1024) {
            setError('Choose a file smaller than 5 MB.');
            return;
        }
        busyRef.current = true;
        setBusy(true);
        setError('');
        setResult(null);
        try {
            const body = new FormData();
            body.append('file', file);
            const token = document.cookie
                .split('; ')
                .find((cookie) => cookie.startsWith('XSRF-TOKEN='))
                ?.slice('XSRF-TOKEN='.length);
            const response = await fetch(`/${module}/import`, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'X-XSRF-TOKEN': decodeURIComponent(token ?? ''),
                },
                body,
            });
            if (!response.ok) {
                const failure = await response.json().catch(() => null);
                throw new Error(
                    failure?.errors?.file?.[0] ??
                        (response.status === 413
                            ? 'This file is too large.'
                            : 'Upload failed. Check your session and try again.'),
                );
            }
            setResult(await response.json());
            setFile(null);
            router.reload({
                only: [
                    module === 'tenants' ? 'tenants' : 'serviceTeams',
                    'stats',
                ],
            });
        } catch (exception) {
            setError(
                exception instanceof Error
                    ? exception.message
                    : 'Upload failed. Please try again.',
            );
        } finally {
            busyRef.current = false;
            setBusy(false);
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(value) => {
                if (!busy) setOpen(value);
            }}
        >
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Upload className="size-4" />
                    Import records
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        Import{' '}
                        {module === 'tenants' ? 'tenants' : 'service team'}
                    </DialogTitle>
                    <DialogDescription>
                        Upload Excel (.xlsx) or UTF-8 CSV. Maximum 5 MB and
                        2,000 records. Excel imports use the first worksheet.
                    </DialogDescription>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                    Duplicates in the file or existing records are skipped by
                    email or phone. Existing records are kept. Invalid rows are
                    skipped and listed below.
                </p>
                <a
                    className="text-sm underline"
                    href={`/${module}/import-template`}
                >
                    Download CSV template (opens in Excel)
                </a>
                <p className="text-xs text-muted-foreground">
                    Keep template column names. Status defaults to active. Use
                    YYYY-MM-DD for dates and format phone columns as text to
                    preserve + and leading zeros.
                    {module === 'tenants'
                        ? ' Optional unit_id must be an existing unit ID.'
                        : ' Status can be active, inactive or on_leave.'}
                </p>
                <form onSubmit={upload} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor={`${module}-import-file`}>
                            Spreadsheet file
                        </Label>
                        <Input
                            key={result ? 'completed' : 'upload'}
                            id={`${module}-import-file`}
                            type="file"
                            accept=".xlsx,.csv"
                            disabled={busy}
                            onChange={(event) => {
                                setFile(event.target.files?.[0] ?? null);
                                setError('');
                                setResult(null);
                            }}
                        />
                    </div>
                    {error && (
                        <p role="alert" className="text-sm text-destructive">
                            {error}
                        </p>
                    )}
                    <Button type="submit" disabled={!file || busy}>
                        {busy ? 'Importing…' : 'Upload and import'}
                    </Button>
                </form>
                {result && (
                    <div role="status" className="space-y-2 text-sm">
                        <p>
                            {result.imported} imported · {result.duplicates}{' '}
                            duplicates skipped · {result.invalid} invalid rows
                        </p>
                        {result.issues.length > 0 && (
                            <ul className="max-h-48 space-y-1 overflow-y-auto">
                                {result.issues.map((issue) => (
                                    <li key={issue.row}>
                                        Row {issue.row}: {issue.message}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
