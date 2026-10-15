import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { ArrowLeft, Save, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const inputClass = 'h-10 rounded-xl border-border/70 bg-background shadow-none focus-visible:ring-primary/20';

export default function CustomerForm({ customer }: { customer?: any }) {
    const editing = !!customer;
    const form = useForm({ name: customer?.name ?? '', type: customer?.type ?? 'individual', phone: customer?.phone ?? '', email: customer?.email ?? '', address: customer?.address ?? '', status: customer?.status ?? 'active', notes: customer?.notes ?? '' });
    const submit = (event: FormEvent) => { event.preventDefault(); editing ? form.put(`/sales/customers/${customer.id}`) : form.post('/sales/customers'); };

    return <><Head title={`${editing ? 'Edit' : 'New'} Customer — SOMFIX`} /><form onSubmit={submit} className="mx-auto w-full max-w-5xl space-y-6 p-4 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2"><div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><UserRound className="size-4" /></div><h1 className="page-title-enter text-lg font-semibold">{editing ? 'Edit customer' : 'New customer'}</h1></div><p className="page-description-enter mt-1 text-xs text-muted-foreground">Customer contact details used for leads, jobs, quotations, and invoices.</p></div><Button asChild variant="outline" size="sm"><Link href={editing ? `/sales/customers/${customer.id}` : '/sales/customers'}><ArrowLeft />Back</Link></Button></div>
        <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm"><div className="border-b border-border/70 bg-secondary/35 px-5 py-4"><h2 className="font-semibold">Customer profile</h2><p className="mt-1 text-xs text-muted-foreground">Identify the individual or company that receives the service.</p></div><div className="grid gap-5 p-5 md:grid-cols-2"><Field label="Customer name" required value={form.data.name} set={value => form.setData('name', value)} /><AppSelect label="Customer type" value={form.data.type} set={value => form.setData('type', value)} items={[[ 'individual', 'Individual' ], [ 'company', 'Company' ]]} /><Field label="Phone" required type="tel" value={form.data.phone} set={value => form.setData('phone', value)} /><Field label="Email" type="email" value={form.data.email} set={value => form.setData('email', value)} /><div className="space-y-2 md:col-span-2"><Label>Address</Label><Textarea className="min-h-24 rounded-xl border-border/70" value={form.data.address} onChange={event => form.setData('address', event.target.value)} placeholder="Street, district, city, and access information." /></div></div></section>
        <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm"><div className="border-b border-border/70 bg-secondary/35 px-5 py-4"><h2 className="font-semibold">Account status and notes</h2><p className="mt-1 text-xs text-muted-foreground">Control whether this customer can be used for new service work.</p></div><div className="grid gap-5 p-5 md:grid-cols-2"><AppSelect label="Customer status" value={form.data.status} set={value => form.setData('status', value)} items={[[ 'active', 'Active' ], [ 'inactive', 'Inactive' ]]} /><div className="space-y-2 md:col-span-2"><Label>Internal notes</Label><Textarea className="min-h-24 rounded-xl border-border/70" value={form.data.notes} onChange={event => form.setData('notes', event.target.value)} placeholder="Service preferences, billing notes, or company details." /></div></div></section>
        <div className="flex items-center justify-between"><Button asChild variant="outline"><Link href="/sales/customers"><ArrowLeft />Cancel</Link></Button><Button disabled={form.processing}><Save />{form.processing ? 'Saving...' : editing ? 'Save changes' : 'Create customer'}</Button></div>
    </form></>;
}

function Field({ label, value, set, type = 'text', required = false }: { label: string; value: string; set: (value: string) => void; type?: string; required?: boolean }) { return <div className="space-y-2"><Label>{label}</Label><Input className={inputClass} required={required} type={type} value={value} onChange={event => set(event.target.value)} /></div>; }
function AppSelect({ label, value, set, items }: { label: string; value: string; set: (value: string) => void; items: string[][] }) { return <div className="space-y-2"><Label>{label}</Label><Select value={value} onValueChange={set}><SelectTrigger className={`w-full ${inputClass}`}><SelectValue /></SelectTrigger><SelectContent>{items.map(([itemValue, text]) => <SelectItem key={itemValue} value={itemValue}>{text}</SelectItem>)}</SelectContent></Select></div>; }

CustomerForm.layout = { breadcrumbs: [{ title: 'Sales & Jobs', href: '/sales' }, { title: 'Customers', href: '/sales/customers' }, { title: 'Customer form', href: '/sales/customers/create' }] };
