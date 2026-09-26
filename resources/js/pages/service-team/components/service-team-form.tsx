import { Link, useForm } from "@inertiajs/react";
import type { FormEvent } from "react";
import { ArrowLeft, Save } from "lucide-react";
import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { index, store, update } from "@/routes/service-team";

export type ServiceTeamFormValues = { name: string; specialization: string; phone: string; email: string; status: "active" | "inactive" | "on_leave"; notes: string };
const inputClass = "h-10 rounded-xl border-border/70 bg-background shadow-none focus-visible:ring-primary/20";

export function ServiceTeamForm({ mode, serviceTeam }: { mode: "create" | "edit"; serviceTeam?: ServiceTeamFormValues & { id: number } }) {
    const form = useForm<ServiceTeamFormValues>({ name: serviceTeam?.name ?? "", specialization: serviceTeam?.specialization ?? "", phone: serviceTeam?.phone ?? "", email: serviceTeam?.email ?? "", status: serviceTeam?.status ?? "active", notes: serviceTeam?.notes ?? "" });
    const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); mode === "create" ? form.post(store.url()) : form.put(update.url(serviceTeam!.id)); };
    return <form onSubmit={submit} className="space-y-6"><section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm"><div className="border-b border-border/70 bg-secondary/35 px-5 py-4"><h2 className="font-semibold">Service team member details</h2><p className="mt-1 text-xs text-muted-foreground">Contact information, specialization and availability.</p></div><div className="grid gap-5 p-5 md:grid-cols-2"><Field label="Name" value={form.data.name} onChange={(value) => form.setData("name", value)} error={form.errors.name} /><Field label="Specialization" value={form.data.specialization} onChange={(value) => form.setData("specialization", value)} error={form.errors.specialization} /><Field label="Phone" value={form.data.phone} onChange={(value) => form.setData("phone", value)} error={form.errors.phone} /><Field label="Email" type="email" value={form.data.email} onChange={(value) => form.setData("email", value)} error={form.errors.email} /><div className="space-y-2"><Label>Status</Label><Select value={form.data.status} onValueChange={(value) => form.setData("status", value as any)}><SelectTrigger className={`w-full ${inputClass}`}><SelectValue /></SelectTrigger><SelectContent>{["active", "inactive", "on_leave"].map((status) => <SelectItem key={status} value={status}>{status.replace("_", " ").toUpperCase()}</SelectItem>)}</SelectContent></Select><InputError message={form.errors.status} /></div><div className="md:col-span-2 space-y-2"><Label>Notes</Label><Textarea value={form.data.notes} onChange={(event) => form.setData("notes", event.target.value)} className="min-h-[80px] rounded-xl border-border/70 bg-background shadow-none focus-visible:ring-primary/20" /><InputError message={form.errors.notes} /></div></div></section><div className="flex items-center justify-end gap-2"><Button asChild variant="outline" type="button"><Link href={index()}><ArrowLeft />Back</Link></Button><Button type="submit" disabled={form.processing}><Save />Save changes</Button></div></form>;
}

function Field({ label, value, onChange, error, type = "text" }: { label: string; value: string; onChange: (value: string) => void; error?: string; type?: string }) { return <div className="space-y-2"><Label>{label}</Label><Input type={type} value={value} onChange={(event) => onChange(event.target.value)} className={inputClass} /><InputError message={error} /></div>; }
