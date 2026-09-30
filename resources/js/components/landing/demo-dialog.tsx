import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowRight, CheckCircle2, LoaderCircle } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export function DemoDialog({
    open,
    onOpenChange,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const [complete, setComplete] = useState(false);
    const form = useForm({
        name: '',
        email: '',
        company: '',
        team_size: '',
        message: '',
        website: '',
    });
    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (!form.processing) {
                    onOpenChange(next);
                    if (!next) setComplete(false);
                }
            }}
        >
            <DialogContent className="landing-dialog max-h-[90dvh] overflow-y-auto rounded-2xl sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-2xl">
                        {complete
                            ? 'Your request is saved.'
                            : 'Let’s talk about your operations.'}
                    </DialogTitle>
                    <DialogDescription>
                        {complete
                            ? 'Thank you for your interest in SOMFIX. Your details have been submitted for a demo conversation.'
                            : 'Tell us a little about your team. We’ll use these details to understand your needs.'}
                    </DialogDescription>
                </DialogHeader>
                {complete ? (
                    <div className="space-y-6 py-4">
                        <CheckCircle2 className="size-12 text-[#087A50]" />
                        <Button
                            className="w-full"
                            onClick={() => {
                                onOpenChange(false);
                                setComplete(false);
                            }}
                        >
                            Back to SOMFIX
                        </Button>
                    </div>
                ) : (
                    <form
                        className="space-y-4"
                        onSubmit={(event) => {
                            event.preventDefault();
                            form.post('/demo-requests', {
                                preserveScroll: true,
                                onSuccess: () => {
                                    setComplete(true);
                                    form.reset();
                                },
                                onError: () =>
                                    document
                                        .getElementById('demo-errors')
                                        ?.focus(),
                            });
                        }}
                    >
                        {Object.keys(form.errors).length > 0 && (
                            <div
                                id="demo-errors"
                                tabIndex={-1}
                                role="alert"
                                className="rounded-lg border border-destructive/30 p-3 text-sm text-destructive"
                            >
                                {Object.values(form.errors).map((error) => (
                                    <p key={error}>{error}</p>
                                ))}
                            </div>
                        )}
                        {(['name', 'email', 'company'] as const).map(
                            (field) => (
                                <div key={field} className="space-y-2">
                                    <Label htmlFor={`demo-${field}`}>
                                        {field === 'name'
                                            ? 'Full name'
                                            : field === 'email'
                                              ? 'Work email'
                                              : 'Company name'}
                                    </Label>
                                    <Input
                                        id={`demo-${field}`}
                                        required
                                        type={
                                            field === 'email' ? 'email' : 'text'
                                        }
                                        autoComplete={
                                            field === 'company'
                                                ? 'organization'
                                                : field
                                        }
                                        maxLength={
                                            field === 'name'
                                                ? 120
                                                : field === 'company'
                                                  ? 160
                                                  : 255
                                        }
                                        value={form.data[field]}
                                        onChange={(event) =>
                                            form.setData(
                                                field,
                                                event.target.value,
                                            )
                                        }
                                        aria-invalid={!!form.errors[field]}
                                    />
                                </div>
                            ),
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="demo-size">Team size</Label>
                            <Select
                                required
                                value={form.data.team_size}
                                onValueChange={(value) =>
                                    form.setData('team_size', value)
                                }
                            >
                                <SelectTrigger
                                    id="demo-size"
                                    className="w-full"
                                >
                                    <SelectValue placeholder="Select your team size" />
                                </SelectTrigger>
                                <SelectContent>
                                    {['1-5', '6-20', '21-50', '51+'].map(
                                        (size) => (
                                            <SelectItem key={size} value={size}>
                                                {size} people
                                            </SelectItem>
                                        ),
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="demo-message">
                                What would you like to improve?{' '}
                                <span className="text-muted-foreground">
                                    (optional)
                                </span>
                            </Label>
                            <Textarea
                                id="demo-message"
                                maxLength={2000}
                                value={form.data.message}
                                onChange={(event) =>
                                    form.setData('message', event.target.value)
                                }
                                placeholder="Properties, maintenance, finance, or a bit of everything…"
                            />
                        </div>
                        <div className="hidden" aria-hidden="true">
                            <Input
                                tabIndex={-1}
                                autoComplete="off"
                                value={form.data.website}
                                onChange={(event) =>
                                    form.setData('website', event.target.value)
                                }
                                aria-label="Leave empty"
                            />
                        </div>
                        <p className="text-xs leading-5 text-muted-foreground">
                            Your name, email and company details are stored with
                            this inquiry so SOMFIX can respond. Please don’t
                            include tenant or payment information.
                        </p>
                        <Button
                            disabled={form.processing || !form.data.team_size}
                            className="w-full bg-[#075B3E] text-white hover:bg-[#064E3B]"
                        >
                            {form.processing ? (
                                <>
                                    <LoaderCircle className="animate-spin" />
                                    Sending request…
                                </>
                            ) : (
                                <>
                                    Request a Demo
                                    <ArrowRight />
                                </>
                            )}
                        </Button>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
