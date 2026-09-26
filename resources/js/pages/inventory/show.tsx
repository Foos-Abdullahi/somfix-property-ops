import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { destroy, edit, index } from "@/routes/inventory";

export default function InventoryShow({ inventory }: { inventory: { id: number; name: string; description: string; sku: string; unit_of_measure: string; category: string; opening_stock: number; current_stock: number; reorder_level: number; supplier: string; unit_cost: string; total_value: string; status: string; notes: string | null } }) {
    const [confirming, setConfirming] = useState(false);
    return <><Head title={`${inventory.name} — SOMFIX`} /><div className="w-full p-4 md:p-6"><div className="flex flex-wrap items-start justify-between gap-4 border-b pb-5"><div><div className="flex gap-2"><h1 className="text-2xl font-bold">{inventory.name}</h1><Badge variant="outline">{inventory.status.replace("_", " ").toUpperCase()}</Badge></div><p className="mt-1 text-sm text-muted-foreground">{inventory.sku} · {inventory.category}</p></div><div className="flex gap-2"><Button asChild size="sm" variant="outline"><Link href={edit(inventory.id)}><Edit />Edit</Link></Button>{confirming ? <Button size="sm" variant="destructive" onClick={() => router.delete(destroy.url(inventory.id))}>Confirm delete</Button> : <Button size="sm" variant="outline" onClick={() => setConfirming(true)}><Trash2 />Delete</Button>}<Button asChild size="sm" variant="outline"><Link href={index()}><ArrowLeft />Back</Link></Button></div></div><div className="mt-6 grid gap-4 rounded-2xl border bg-card p-5 sm:grid-cols-3"><Detail label="SKU" value={inventory.sku} /><Detail label="Unit of measure" value={inventory.unit_of_measure} /><Detail label="Category" value={inventory.category} /><Detail label="Opening stock" value={String(inventory.opening_stock)} /><Detail label="Current stock" value={String(inventory.current_stock)} /><Detail label="Reorder level" value={String(inventory.reorder_level)} /><Detail label="Supplier" value={inventory.supplier} /><Detail label="Unit cost" value={`$${Number(inventory.unit_cost).toFixed(2)}`} /><Detail label="Total value" value={`$${Number(inventory.total_value).toFixed(2)}`} /><div className="sm:col-span-3"><Detail label="Description" value={inventory.description} /></div><div className="sm:col-span-3"><Detail label="Notes" value={inventory.notes ?? "No notes added."} /></div></div></div></>;
}

function Detail({ label, value }: { label: string; value: string }) { return <div><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-medium">{value}</p></div>; }

InventoryShow.layout = { breadcrumbs: [{ title: "Inventory", href: index() }, { title: "Item details", href: index() }] };
