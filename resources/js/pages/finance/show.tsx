import { Receipt } from 'lucide-react';
import DetailPage, { date, label, money } from '@/components/detail-page';
import { destroy, edit, index } from '@/routes/finance';

type RecordDetail = {
    id: number;
    invoice_number: string;
    title: string;
    description: string;
    type: string;
    currency: string;
    amount: string;
    paid_amount: string;
    balance: string;
    due_date: string | null;
    paid_date: string | null;
    status: string;
    property: { name: string } | null;
    unit: { unit_number: string } | null;
    tenant: { first_name: string; last_name: string } | null;
    recipient_name: string | null;
    recipient_email: string | null;
    notes: string | null;
};

export default function FinanceShow({ finance }: { finance: RecordDetail }) {
    return (
        <DetailPage
            title={finance.invoice_number}
            subtitle={`${finance.title} · ${label(finance.type)}`}
            summary={[
                {
                    title: 'Payment',
                    metric: {
                        label: 'Outstanding balance',
                        value: money(finance.balance, finance.currency),
                    },
                    fields: [
                        {
                            label: 'Total amount',
                            value: money(finance.amount, finance.currency),
                        },
                        {
                            label: 'Paid amount',
                            value: money(finance.paid_amount, finance.currency),
                        },
                    ],
                },
                {
                    title: 'Dates',
                    fields: [
                        { label: 'Due date', value: date(finance.due_date) },
                        { label: 'Paid date', value: date(finance.paid_date) },
                    ],
                },
            ]}
            sections={[
                { title: 'Description', text: finance.description },
                ...(finance.notes && finance.notes !== finance.description
                    ? [{ title: 'Notes', text: finance.notes }]
                    : []),
            ]}
            aside={[
                {
                    title: 'Billing details',
                    fields: [
                        { label: 'Property', value: finance.property?.name },
                        { label: 'Unit', value: finance.unit?.unit_number },
                        {
                            label: 'Tenant',
                            value: finance.tenant
                                ? `${finance.tenant.first_name} ${finance.tenant.last_name}`
                                : null,
                        },
                        ...(finance.recipient_name &&
                        finance.recipient_name !==
                            (finance.tenant
                                ? `${finance.tenant.first_name} ${finance.tenant.last_name}`
                                : null)
                            ? [
                                  {
                                      label: 'Recipient',
                                      value: finance.recipient_name,
                                  },
                              ]
                            : []),
                        {
                            label: 'Recipient email',
                            value: finance.recipient_email,
                        },
                    ],
                },
            ]}
            status={finance.status}
            icon={Receipt}
            backHref={index.url()}
            editHref={edit.url(finance.id)}
            deleteHref={destroy.url(finance.id)}
        />
    );
}

FinanceShow.layout = {
    breadcrumbs: [
        { title: 'Finance', href: index() },
        { title: 'Record details', href: index() },
    ],
};
