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
    deleted_at?: string | null;
};
export type TenantOption = {
    id: number;
    first_name: string;
    last_name: string;
    email: string | null;
};
