import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { CalendarDays, FileImage, LogOut, MapPin, Send, Wrench } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const services = [
    'Door repair',
    'Window repair',
    'Plumbing',
    'Mosquito screens',
    'Broken glass',
    'Wardrobes & cabinets',
    'Kitchen repair',
    'Cleaning',
    'Renovation',
    'Any other household repair',
    'Property management',
    'Not sure',
];

type RepairRequest = {
    id: number;
    service: string;
    area: string | null;
    message: string | null;
    status: string;
    created_at: string | null;
    photo_url: string | null;
};

const statusClass: Record<string, string> = {
    new: 'bg-amber-100 text-amber-800',
    converted: 'bg-emerald-100 text-emerald-800',
};

export default function MyRequests({
    requests,
}: {
    requests: { data: RepairRequest[]; prev_page_url: string | null; next_page_url: string | null };
}) {
    const { auth } = usePage<{ auth: { user: { name: string } } }>().props;
    const form = useForm({
        name: auth.user.name,
        phone: '',
        area: '',
        service: 'Not sure',
        message: '',
        photo: null as File | null,
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post('/my-requests', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => form.reset('phone', 'area', 'service', 'message', 'photo'),
        });
    };

    return (
        <>
            <Head title="My repair requests" />
            <main className="min-h-screen bg-slate-50 text-slate-950">
                <header className="border-b bg-white">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
                        <Link href="/" className="flex items-center gap-2 font-bold text-primary">
                            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-white">
                                <Wrench className="size-5" />
                            </span>
                            SOMFIX
                        </Link>
                        <div className="flex items-center gap-3 text-sm">
                            <span className="hidden text-muted-foreground sm:inline">{auth.user.name}</span>
                            <Button variant="ghost" size="sm" onClick={() => router.post('/logout')}>
                                <LogOut className="size-4" />
                                Log out
                            </Button>
                        </div>
                    </div>
                </header>

                <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,420px)]">
                    <section className="order-2 lg:order-1">
                        <div className="mb-5">
                            <h1 className="text-2xl font-bold">My repair requests</h1>
                            <p className="mt-1 text-sm text-muted-foreground">Track the requests you have sent to SOMFIX.</p>
                        </div>
                        {requests.data.length === 0 ? (
                            <div className="rounded-2xl border border-dashed bg-white p-8 text-center">
                                <Wrench className="mx-auto mb-3 size-8 text-primary" />
                                <h2 className="font-semibold">No requests yet</h2>
                                <p className="mt-1 text-sm text-muted-foreground">Use the form to tell us what needs fixing.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {requests.data.map((request) => (
                                    <article key={request.id} className="rounded-2xl border bg-white p-5 shadow-sm">
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                <h2 className="font-semibold">{request.service}</h2>
                                                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                                    {request.area && <span className="flex items-center gap-1"><MapPin className="size-3.5" />{request.area}</span>}
                                                    {request.created_at && <time className="flex items-center gap-1" dateTime={request.created_at}><CalendarDays className="size-3.5" />{new Date(request.created_at).toLocaleDateString()}</time>}
                                                </div>
                                            </div>
                                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusClass[request.status] ?? 'bg-slate-100 text-slate-700'}`}>
                                                {request.status === 'converted' ? 'In progress' : request.status}
                                            </span>
                                        </div>
                                        {request.message && <p className="mt-4 whitespace-pre-wrap text-sm text-slate-700">{request.message}</p>}
                                        {request.photo_url && <a href={request.photo_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"><FileImage className="size-4" />View my photo</a>}
                                    </article>
                                ))}
                            </div>
                        )}
                        <nav className="mt-5 flex gap-4 text-sm font-medium text-primary" aria-label="Request pagination">
                            {requests.prev_page_url && <Link href={requests.prev_page_url}>Previous</Link>}
                            {requests.next_page_url && <Link href={requests.next_page_url}>Next</Link>}
                        </nav>
                    </section>

                    <aside className="order-1 rounded-2xl bg-primary p-5 text-primary-foreground shadow-lg lg:order-2 lg:sticky lg:top-6 lg:self-start">
                        <h2 className="text-lg font-bold">Request a repair</h2>
                        <p className="mt-1 text-sm text-white/80">Send the details and a photo if you have one. We will contact you to confirm the work and price.</p>
                        <form className="mt-5 space-y-4" onSubmit={submit}>
                            <Field label="Your name" error={form.errors.name}><Input value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} className="bg-white text-slate-950" required /></Field>
                            <Field label="Phone or WhatsApp" error={form.errors.phone}><Input type="tel" value={form.data.phone} onChange={(event) => form.setData('phone', event.target.value)} className="bg-white text-slate-950" required /></Field>
                            <Field label="Area in Mogadishu" error={form.errors.area}><Input value={form.data.area} onChange={(event) => form.setData('area', event.target.value)} className="bg-white text-slate-950" /></Field>
                            <Field label="Service needed" error={form.errors.service}><select value={form.data.service} onChange={(event) => form.setData('service', event.target.value)} className="h-9 w-full rounded-md border bg-white px-3 text-sm text-slate-950">{services.map((service) => <option key={service}>{service}</option>)}</select></Field>
                            <Field label="Describe the problem" error={form.errors.message}><Textarea value={form.data.message} onChange={(event) => form.setData('message', event.target.value)} className="min-h-24 bg-white text-slate-950" maxLength={3000} /></Field>
                            <Field label="Photo (optional, up to 5 MB)" error={form.errors.photo}><Input type="file" accept="image/jpeg,image/png,image/webp" className="bg-white text-slate-950" onChange={(event) => form.setData('photo', event.target.files?.[0] ?? null)} /></Field>
                            <Button type="submit" className="w-full bg-white font-semibold text-primary hover:bg-white/90" disabled={form.processing}>
                                <Send className="size-4" />{form.processing ? 'Sending…' : 'Send request'}
                            </Button>
                        </form>
                    </aside>
                </div>
            </main>
        </>
    );
}

function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: ReactNode;
}) {
    return <div className="space-y-1.5"><Label className="text-white" >{label}</Label>{children}{error && <p className="text-xs text-red-200" role="alert">{error}</p>}</div>;
}
