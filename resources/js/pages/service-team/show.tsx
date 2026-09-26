import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { destroy, edit, index } from "@/routes/service-team";

export default function ServiceTeamShow({ serviceTeam }: { serviceTeam: { id: number; name: string; specialization: string; phone: string; email: string; status: string; notes: string | null } }) {
    const [confirming, setConfirming] = useState(false);
    return <><Head title={`${serviceTeam.name} — SOMFIX`} /><div className="w-full p-4 md:p-6"><div className="flex flex-wrap items-start justify-between gap-4 border-b pb-5"><div><div className="flex gap-2"><h1 className="text-2xl font-bold">{serviceTeam.name}</h1><Badge variant="outline">{serviceTeam.status}</Badge></div><p className="mt-1 text-sm text-muted-foreground">{serviceTeam.specialization}</p></div><div className="flex gap-2"><Button asChild size="sm" variant="outline"><Link href={edit(serviceTeam.id)}><Edit />Edit</Link></Button>{confirming ? <Button size="sm" variant="destructive" onClick={() => router.delete(destroy.url(serviceTeam.id))}>Confirm delete</Button> : <Button size="sm" variant="outline" onClick={() => setConfirming(true)}><Trash2 />Delete</Button>}<Button asChild size="sm" variant="outline"><Link href={index()}><ArrowLeft />Back</Link></Button></div></div><div className="mt-6 grid gap-4 rounded-2xl border bg-card p-5 sm:grid-cols-2"><Detail label="Phone" value={serviceTeam.phone} /><Detail label="Email" value={serviceTeam.email} /><Detail label="Specialization" value={serviceTeam.specialization} /><Detail label="Status" value={serviceTeam.status} /><div className="sm:col-span-2"><Detail label="Notes" value={serviceTeam.notes ?? "No notes added."} /></div></div></div></>;
}

function Detail({ label, value }: { label: string; value: string }) { return <div><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-medium">{value}</p></div>; }

ServiceTeamShow.layout = { breadcrumbs: [{ title: "Service Team", href: index() }, { title: "Member details", href: index() }] };
