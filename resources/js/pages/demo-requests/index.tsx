import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
export const stages = {
    new: 'New',
    contacted: 'Contacted',
    scheduled: 'Walkthrough scheduled',
    completed: 'Walkthrough completed',
    converted: 'Linked to tenant',
    closed: 'Closed',
};
export type Inquiry = {
    id: number;
    name: string;
    email: string;
    company: string;
    team_size: string;
    message: string | null;
    status: keyof typeof stages;
    follow_up_at: string | null;
    walkthrough_at: string | null;
    notes: string | null;
    tenant_id: number | null;
    created_at: string;
};
export default function Requests({
    requests,
    filters,
}: {
    requests: {
        data: Inquiry[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: { search?: string; status?: string };
}) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    return (
        <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
            <Head title="Demo Requests" />
            <header>
                <h1 className="text-2xl font-bold">Demo Requests</h1>
                <p className="text-muted-foreground">
                    Landing-page inquiries from Get Early Access and Book a
                    Walkthrough.
                </p>
            </header>
            <form
                className="flex flex-wrap gap-3"
                onSubmit={(e) => {
                    e.preventDefault();
                    router.get(
                        '/demo-requests',
                        { search, status: status || undefined },
                        { preserveState: true },
                    );
                }}
            >
                <Input
                    className="max-w-sm"
                    aria-label="Search requests"
                    placeholder="Name, email or company"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select
                    className="rounded border bg-background p-2"
                    aria-label="Request status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                >
                    <option value="">All statuses</option>
                    {Object.entries(stages).map(([value, label]) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </select>
                <Button type="submit">Filter</Button>
            </form>
            <div className="overflow-x-auto rounded border">
                <table className="w-full text-left text-sm">
                    <thead className="bg-muted">
                        <tr>
                            {[
                                'Person / company',
                                'Contact',
                                'Stage',
                                'Received',
                                '',
                            ].map((label, i) => (
                                <th key={i} className="p-3">
                                    {label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {requests.data.map((item) => (
                            <tr key={item.id} className="border-t">
                                <td className="p-3">
                                    <strong>{item.name}</strong>
                                    <div>{item.company}</div>
                                </td>
                                <td className="p-3">
                                    <a
                                        className="underline"
                                        href={`mailto:${item.email}`}
                                    >
                                        {item.email}
                                    </a>
                                </td>
                                <td className="p-3">{stages[item.status]}</td>
                                <td className="p-3">
                                    {new Date(
                                        item.created_at,
                                    ).toLocaleDateString()}
                                </td>
                                <td className="p-3">
                                    <Link
                                        className="underline"
                                        href={`/demo-requests/${item.id}`}
                                    >
                                        Open request
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {requests.data.length === 0 && (
                    <p className="p-6 text-muted-foreground">
                        No requests match these filters.
                    </p>
                )}
            </div>
            <nav className="flex flex-wrap gap-2" aria-label="Request pages">
                {requests.links.map((link, i) =>
                    link.url ? (
                        <Link
                            key={i}
                            href={link.url}
                            className={`rounded border px-3 py-2 ${link.active ? 'bg-primary text-primary-foreground' : ''}`}
                        >
                            {link.label
                                .replace(/&laquo;/g, '‹')
                                .replace(/&raquo;/g, '›')}
                        </Link>
                    ) : null,
                )}
            </nav>
        </div>
    );
}
