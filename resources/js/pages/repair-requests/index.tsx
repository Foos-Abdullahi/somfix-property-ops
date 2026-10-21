import { Head, Link, router } from '@inertiajs/react';
import { ArrowRight, CheckCircle2, Globe2 } from 'lucide-react';
import { Can } from '@/components/can';
import { Badge, badgeToneClasses } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type Repair = {
    id: number;
    name: string;
    phone: string;
    area: string | null;
    service: string;
    message: string | null;
    created_at: string;
    photo_url: string | null;
    status: string;
    lead_url: string | null;
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
            <div className="w-full space-y-6 p-4 md:p-6">
                <div className="flex items-start gap-3">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Globe2 className="size-5" />
                    </span>
                    <div>
                        <h1 className="text-xl font-semibold">
                            Website repair requests
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Review public enquiries, contact the customer, then
                            convert the request into the Sales and Jobs
                            workflow.
                        </p>
                    </div>
                </div>
                {requests.data.length === 0 && <p>No repair requests yet.</p>}
                <div className="grid gap-4">
                    {requests.data.map((request) => (
                        <article
                            key={request.id}
                            className="space-y-3 rounded-xl border bg-card p-5"
                        >
                            <div className="flex flex-wrap items-start justify-between gap-2">
                                <div>
                                    <h2 className="font-semibold">
                                        {request.name} · {request.service}
                                    </h2>
                                    <Badge
                                        variant="outline"
                                        className={`mt-2 capitalize ${request.status === 'converted' ? badgeToneClasses.success : badgeToneClasses.warning}`}
                                    >
                                        {request.status}
                                    </Badge>
                                </div>
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
                            <div className="flex justify-end border-t pt-3">
                                {request.lead_url ? (
                                    <Button asChild size="sm" variant="outline">
                                        <Link href={request.lead_url}>
                                            <CheckCircle2 />
                                            Open lead
                                        </Link>
                                    </Button>
                                ) : (
                                    <Can
                                        anyOf={[
                                            'maintenance.manage',
                                            'sales.manage',
                                        ]}
                                    >
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                router.post(
                                                    `/repair-requests/${request.id}/convert`,
                                                )
                                            }
                                        >
                                            Create customer and lead
                                            <ArrowRight />
                                        </Button>
                                    </Can>
                                )}
                            </div>
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
