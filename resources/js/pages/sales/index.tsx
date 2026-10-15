import { Head, Link } from '@inertiajs/react';
import { BriefcaseBusiness, CircleDollarSign, Plus, Users, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function SalesIndex({ stats, recentJobs, recentLeads }: { stats: Record<string, number>; recentJobs: any[]; recentLeads: any[] }) {
    const cards = [
        ['New leads', stats.newLeads, Users], ['Quote value', `$${stats.quoteValue.toFixed(2)}`, CircleDollarSign],
        ['Jobs needing attention', stats.jobsInProgress, BriefcaseBusiness], ['Outstanding balance', `$${stats.outstandingBalance.toFixed(2)}`, Wallet],
        ['Collected this month', `$${stats.collectedThisMonth.toFixed(2)}`, CircleDollarSign],
    ];
    return <><Head title="Sales & Jobs — SOMFIX" /><div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-lg font-semibold">Sales & Jobs</h1><p className="text-xs text-muted-foreground">Turn customer requests into completed, profitable service work.</p></div><div className="flex gap-2"><Button asChild variant="outline" size="sm"><Link href="/sales/leads/create"><Plus />New lead</Link></Button><Button asChild size="sm"><Link href="/sales/jobs/create"><Plus />New job</Link></Button></div></div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{cards.map(([label, value, Icon]: any) => <Card key={label as string}><CardContent className="flex items-center gap-3 p-4"><Icon className="size-5 text-primary" /><div><p className="text-xs text-muted-foreground">{label}</p><p className="text-xl font-semibold">{value}</p></div></CardContent></Card>)}</div>
        <div className="grid gap-4 lg:grid-cols-2"><Card><CardContent className="p-4"><div className="mb-3 flex justify-between"><h2 className="font-semibold">Recent jobs</h2><Link className="text-sm text-primary" href="/sales/jobs">View jobs</Link></div><div className="space-y-2">{recentJobs.length ? recentJobs.map((job) => <Link className="flex justify-between rounded border p-3 hover:bg-muted" key={job.id} href={`/sales/jobs/${job.id}`}><span><b>{job.job_number}</b> · {job.title}<small className="block text-muted-foreground">{job.customer?.name ?? 'No customer'}</small></span><span className="capitalize text-sm">{job.status.replaceAll('_', ' ')}</span></Link>) : <p className="text-sm text-muted-foreground">No jobs yet.</p>}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="mb-3 flex justify-between"><h2 className="font-semibold">Recent leads</h2><Link className="text-sm text-primary" href="/sales/leads">View leads</Link></div><div className="space-y-2">{recentLeads.length ? recentLeads.map((lead) => <Link className="flex justify-between rounded border p-3 hover:bg-muted" key={lead.id} href={`/sales/leads/${lead.id}`}><span><b>{lead.title}</b><small className="block text-muted-foreground">{lead.customer?.name ?? 'Unassigned customer'}</small></span><span className="capitalize text-sm">{lead.status.replaceAll('_', ' ')}</span></Link>) : <p className="text-sm text-muted-foreground">No leads yet.</p>}</div></CardContent></Card></div>
    </div></>;
}
SalesIndex.layout = { breadcrumbs: [{ title: 'Sales & Jobs', href: '/sales' }] };
