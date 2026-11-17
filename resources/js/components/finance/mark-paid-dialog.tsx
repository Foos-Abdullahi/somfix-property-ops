import { useForm } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { today } from './format';
import { Field, SelectField, SubmitButton } from './kit';

/** Records when and how a pending commission or salary was actually paid. */
export function MarkPaidDialog({ url, title, description, methods, trigger }: { url: string; title: string; description: string; methods: Record<string, string>; trigger?: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const form = useForm({ paid_at: today(), payment_method: 'cash', reference: '' });
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button size="sm">
                        <CheckCircle2 className="size-4" />
                        Mark as paid
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.post(url, { preserveScroll: true, onSuccess: () => setOpen(false) });
                    }}
                    className="grid gap-4"
                >
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription>{description}</DialogDescription>
                    </DialogHeader>
                    <Field label="Date paid" error={form.errors.paid_at} required>
                        <Input type="date" value={form.data.paid_at} onChange={(e) => form.setData('paid_at', e.target.value)} />
                    </Field>
                    <Field label="Paid via" error={form.errors.payment_method} required>
                        <SelectField value={form.data.payment_method} onChange={(v) => form.setData('payment_method', v)} options={Object.entries(methods).map(([value, label]) => ({ value, label }))} />
                    </Field>
                    <Field label="Reference / transaction ID" error={form.errors.reference}>
                        <Input value={form.data.reference} onChange={(e) => form.setData('reference', e.target.value)} />
                    </Field>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <SubmitButton processing={form.processing}>Confirm payment</SubmitButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
