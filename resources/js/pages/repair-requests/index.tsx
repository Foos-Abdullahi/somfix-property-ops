import { Head, Link } from '@inertiajs/react';

type Repair = {
    id: number;
    name: string;
    phone: string;
    area: string | null;
    service: string;
    message: string | null;
    created_at: string;
    photo_url: string | null;
};
export default function RepairInbox({
    requests,
}: {
    requests: {
        data: Repair[];
        prev_page_url: string | null;
        next_page_url: string | null;
    };
}) {
    return (
        <>
            <Head title="Website repair requests" />
            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-xl font-semibold">
                        Website repair requests
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Customer inquiries from the public contact form. Call or
                        WhatsApp the customer to arrange the job.
                    </p>
                </div>
                {requests.data.length === 0 && <p>No repair requests yet.</p>}
                <div className="grid gap-4">
                    {requests.data.map((request) => (
                        <article
                            key={request.id}
                            className="space-y-3 rounded-xl border bg-card p-5"
                        >
                            <div className="flex flex-wrap justify-between gap-2">
                                <h2 className="font-semibold">
                                    {request.name} · {request.service}
                                </h2>
                                <time
                                    className="text-xs text-muted-foreground"
                                    dateTime={request.created_at}
                                >
                                    {request.created_at.slice(0, 10)}
                                </time>
                            </div>
                            <p className="text-sm">
                                <a
                                    className="underline"
                                    href={`tel:${request.phone.replace(/[^+0-9]/g, '')}`}
                                >
                                    {request.phone}
                                </a>{' '}
                                · {request.area || 'Area not provided'}
                            </p>
                            <p className="text-sm whitespace-pre-wrap">
                                {request.message ||
                                    'No additional description.'}
                            </p>
                            {request.photo_url && (
                                <a
                                    className="text-sm underline"
                                    href={request.photo_url}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    View customer photo
                                </a>
                            )}
                        </article>
                    ))}
                </div>
                <nav aria-label="Inbox pagination" className="flex gap-6">
                    {requests.prev_page_url && (
                        <Link href={requests.prev_page_url}>Previous</Link>
                    )}
                    {requests.next_page_url && (
                        <Link href={requests.next_page_url}>Next</Link>
                    )}
                </nav>
            </div>
        </>
    );
}
RepairInbox.layout = {
    breadcrumbs: [
        { title: 'Website repair requests', href: '/repair-requests' },
    ],
};
