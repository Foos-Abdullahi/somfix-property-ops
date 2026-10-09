import { Head } from "@inertiajs/react";
import { FinanceForm } from "@/pages/finance/components/finance-form";
import { create, index } from "@/routes/finance";

export default function FinanceCreate({ properties, units, tenants }: { properties: { id: number; name: string }[]; units: { id: number; unit_number: string }[]; tenants: { id: number; first_name: string; last_name: string }[] }) {
    return <><Head title="Add finance record — SOMFIX" /><div className="w-full p-4 md:p-6"><h1 className="text-2xl font-bold">Add a finance record</h1><p className="mt-1 mb-6 text-sm text-muted-foreground">Create a new invoice, quote, or expense record.</p><FinanceForm mode="create" properties={properties} units={units} tenants={tenants} /></div></>;
}

FinanceCreate.layout = { breadcrumbs: [{ title: "Finance", href: index() }, { title: "Add record", href: create() }] };
