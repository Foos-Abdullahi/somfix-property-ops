import { Wrench } from 'lucide-react';
import DetailPage, { money } from '@/components/detail-page';
import { destroy, edit, index } from '@/routes/service-list';

type ServiceDetail = {
    id: number;
    name: string;
    category: string;
    description: string | null;
    unit: string | null;
    price: string | null;
    duration: string | null;
    status: string;
    notes: string | null;
};

export default function ServiceListShow({
    service,
}: {
    service: ServiceDetail;
}) {
    return (
        <DetailPage
            title={service.name}
            subtitle={service.category}
            summary={[
                {
                    title: 'Pricing',
                    fields: [
                        { label: 'Price', value: money(service.price) },
                        { label: 'Pricing unit', value: service.unit },
                        {
                            label: 'Estimated duration',
                            value: service.duration,
                        },
                    ],
                },
            ]}
            sections={[
                { title: 'Description', text: service.description },
                { title: 'Internal notes', text: service.notes },
            ]}
            status={service.status}
            icon={Wrench}
            backHref={index.url()}
            managePermission="service-list.manage"
            editHref={edit.url(service.id)}
            deleteHref={destroy.url(service.id)}
        />
    );
}

ServiceListShow.layout = {
    breadcrumbs: [
        { title: 'Service List', href: index() },
        { title: 'Service details', href: index() },
    ],
};
