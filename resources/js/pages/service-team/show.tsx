import { HardHat } from 'lucide-react';
import DetailPage, { label } from '@/components/detail-page';
import { destroy, edit, index } from '@/routes/service-team';

type RecordDetail = {
    id: number;
    name: string;
    specialization: string;
    phone: string;
    email: string;
    status: string;
    notes: string | null;
};

export default function ServiceTeamShow({
    serviceTeam,
}: {
    serviceTeam: RecordDetail;
}) {
    return (
        <DetailPage
            title={serviceTeam.name}
            subtitle={label(serviceTeam.specialization)}
            summary={[
                {
                    title: 'Contact',
                    fields: [
                        { label: 'Phone', value: serviceTeam.phone },
                        { label: 'Email', value: serviceTeam.email },
                    ],
                },
            ]}
            sections={[{ title: 'Team notes', text: serviceTeam.notes }]}
            status={serviceTeam.status}
            icon={HardHat}
            backHref={index.url()}
            editHref={edit.url(serviceTeam.id)}
            deleteHref={destroy.url(serviceTeam.id)}
        />
    );
}

ServiceTeamShow.layout = {
    breadcrumbs: [
        { title: 'Service Team', href: index() },
        { title: 'Member details', href: index() },
    ],
};
