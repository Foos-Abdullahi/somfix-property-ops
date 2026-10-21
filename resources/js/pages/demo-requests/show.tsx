import { Link } from '@inertiajs/react';
import { ClipboardList } from 'lucide-react';
import DetailPage from '@/components/detail-page';
import { Can } from '@/components/can';
import { stages, type Inquiry } from './types';
const appointment = (value: string | null) =>
    value ? new Date(value).toLocaleString() : 'Not scheduled';
export default function RequestShow({ inquiry }: { inquiry: Inquiry }) {
    return (
        <div className="w-full animate-in duration-700 fade-in slide-in-from-bottom-6 [&>div]:max-w-none">
            <DetailPage
                title={inquiry.name}
                subtitle={`${inquiry.company} · ${inquiry.team_size} people`}
                status={stages[inquiry.status]}
                icon={ClipboardList}
                backHref="/demo-requests"
                deleteMessage="You can restore this request from Deleted requests."
                managePermission="demo-requests.manage"
                editHref={`/demo-requests/${inquiry.id}/edit`}
                deleteHref={`/demo-requests/${inquiry.id}`}
                summary={[
                    {
                        title: 'Contact',
                        fields: [
                            {
                                label: 'Work email',
                                value: (
                                    <a
                                        className="underline"
                                        href={`mailto:${inquiry.email}?subject=${encodeURIComponent('Your SOMFIX walkthrough request')}`}
                                    >
                                        {inquiry.email}
                                    </a>
                                ),
                            },
                            {
                                label: 'Received',
                                value: appointment(inquiry.created_at),
                            },
                        ],
                    },
                ]}
                sections={[
                    { title: 'Original inquiry', text: inquiry.message },
                    {
                        title: 'Walkthrough and follow-up',
                        fields: [
                            { label: 'Stage', value: stages[inquiry.status] },
                            {
                                label: 'Next follow-up',
                                value: appointment(inquiry.follow_up_at),
                            },
                            {
                                label: 'Walkthrough time',
                                value: appointment(inquiry.walkthrough_at),
                            },
                            {
                                label: 'Tenant',
                                value: inquiry.tenant_id ? (
                                    <Can
                                        permission="tenants.view"
                                        fallback={<span>Tenant linked</span>}
                                    >
                                        <Link
                                            className="underline"
                                            href={`/tenants/${inquiry.tenant_id}`}
                                        >
                                            Open linked tenant #
                                            {inquiry.tenant_id}
                                        </Link>
                                    </Can>
                                ) : (
                                    'No tenant linked'
                                ),
                            },
                        ],
                    },
                    { title: 'Contact notes and outcome', text: inquiry.notes },
                ]}
                aside={[
                    {
                        title: 'From inquiry to tenant',
                        text: 'Review → contact → schedule walkthrough → complete walkthrough → create tenant → link tenant → assign unit and create lease. Close requests that do not proceed.',
                    },
                    {
                        title: 'Next steps',
                        content: (
                            <div className="flex flex-col gap-3 text-sm">
                                <Can permission="tenants.manage">
                                    <Link
                                        className="underline"
                                        href="/tenants/create"
                                    >
                                        Create a tenant first
                                    </Link>
                                </Can>
                                <Can permission="leases.manage">
                                    <Link
                                        className="underline"
                                        href="/leases/create"
                                    >
                                        Create a lease
                                    </Link>
                                </Can>
                                <p className="text-xs text-muted-foreground">
                                    Email links open your mail app. Dates record
                                    appointments; invitations are sent
                                    separately. Deleted requests can be restored
                                    from the inbox.
                                </p>
                            </div>
                        ),
                    },
                ]}
            />
        </div>
    );
}
RequestShow.layout = {
    breadcrumbs: [
        { title: 'Demo Requests', href: '/demo-requests' },
        { title: 'Request details', href: '/demo-requests' },
    ],
};
