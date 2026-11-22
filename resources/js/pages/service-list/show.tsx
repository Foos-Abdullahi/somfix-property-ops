import { Wrench } from 'lucide-react';
import { ImageGallery } from '@/components/image-gallery';
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
    images: string[] | null;
};

export default function ServiceListShow({
    service,
    usage,
}: {
    service: ServiceDetail;
    usage: { requests: number; leads: number; jobs: number };
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
                {
                    title: 'Where this service is used',
                    fields: [
                        {
                            label: 'Website & customer requests',
                            value: String(usage.requests),
                        },
                        { label: 'Leads', value: String(usage.leads) },
                        {
                            label: 'Jobs (from those leads)',
                            value: String(usage.jobs),
                        },
                    ],
                },
            ]}
            sections={[
                {
                    title: 'Images',
                    content: <ImageGallery images={service.images} />,
                },
                { title: 'Description', text: service.description },
                {
                    title: 'How it connects',
                    text:
                        service.status === 'active'
                            ? 'Active: customers can choose this service on the website and in their account. Staff pick it on leads, and its price fills the lead’s estimated value.'
                            : 'Inactive: hidden from the website, customer account and lead forms. Past requests and leads keep the name.',
                },
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
