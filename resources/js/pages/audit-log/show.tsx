import { ClipboardList } from 'lucide-react';
import DetailPage from '@/components/detail-page';

type Log = {
    id: number;
    actor_name: string | null;
    action: string;
    subject_type: string;
    subject_id: number | null;
    record_name: string;
    created_at: string;
    changes: {
        before: Record<string, unknown>;
        after: Record<string, unknown>;
        password_changed?: boolean;
    } | null;
};
function display(value: unknown): string {
    if (value === undefined) return 'Not present';
    if (value === null) return 'Empty';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
}
export default function AuditShow({ log }: { log: Log }) {
    const before = log.changes?.before ?? {};
    const after = log.changes?.after ?? {};
    const fields = [
        ...new Set([...Object.keys(before), ...Object.keys(after)]),
    ];
    return (
        <DetailPage
            title={`Audit event #${log.id}`}
            status={log.action}
            icon={ClipboardList}
            backHref="/settings/audit-log"
            summary={[
                {
                    title: 'Activity',
                    fields: [
                        { label: 'Actor', value: log.actor_name ?? 'System' },
                        {
                            label: 'Record',
                            value: log.record_name,
                        },
                        {
                            label: 'Time',
                            value: new Date(log.created_at).toLocaleString(),
                        },
                    ],
                },
            ]}
            sections={[
                ...(fields.length
                    ? fields.map((field) => ({
                          title: field.replaceAll('_', ' '),
                          fields: [
                              {
                                  label: 'Before',
                                  value: display(before[field]),
                              },
                              { label: 'After', value: display(after[field]) },
                          ],
                      }))
                    : [
                          {
                              title: 'Changes',
                              text: log.changes?.password_changed
                                  ? 'Password updated.'
                                  : 'No record field changes were recorded for this event.',
                          },
                      ]),
                ...(log.changes?.password_changed && fields.length
                    ? [
                          {
                              title: 'Password',
                              text: 'Password updated. Password values are never stored in the audit log.',
                          },
                      ]
                    : []),
            ]}
        />
    );
}
AuditShow.layout = {
    breadcrumbs: [
        { title: 'Audit Log', href: '/settings/audit-log' },
        { title: 'Event details', href: '#' },
    ],
};
