import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    CalendarDays,
    CircleUserRound,
    FileImage,
    KeyRound,
    LayoutList,
    LockKeyhole,
    MapPin,
    Menu,
    Send,
    ShieldCheck,
    Trash2,
    UserRound,
    Wrench,
    X,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';
import AccountMenu from '@/components/account-menu';
import BrandLogo from '@/components/brand-logo';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
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

type Tab = 'profile' | 'security' | 'requests';
type Profile = {
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
    bio: string | null;
    member_since: string | null;
};
type Repair = {
    id: number;
    service: string;
    area: string | null;
    message: string | null;
    status: string;
    created_at: string | null;
    photo_url: string | null;
};
type Props = {
    activeTab: Tab;
    profile: Profile;
    passwordRules: string;
    requestStats: { total: number; open: number; in_progress: number };
    requests: {
        data: Repair[];
        prev_page_url: string | null;
        next_page_url: string | null;
    } | null;
};

const tabs = [
    { key: 'profile' as const, label: 'My Profile', icon: UserRound },
    { key: 'security' as const, label: 'Security', icon: LockKeyhole },
    { key: 'requests' as const, label: 'My Requests', icon: Wrench },
];

export default function AccountPortal(props: Props) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const initials = props.profile.name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();

    return (
        <>
            <Head title="My account" />
            <div className="min-h-screen bg-[#f7f8f4] text-[#17251e]">
                <header className="sticky top-0 z-30 border-b border-[#dfe7dd] bg-white/95 backdrop-blur">
                    <div className="mx-auto flex min-h-20 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
                        <Link href="/" aria-label="SOMFIX home">
                            <BrandLogo
                                variant="light"
                                className="h-10 w-auto"
                            />
                        </Link>
                        <nav
                            className="ml-auto hidden items-center gap-7 text-sm font-semibold text-muted-foreground lg:flex"
                            aria-label="Public navigation"
                        >
                            <Link href="/">Home</Link>
                            <Link href="/services">Services</Link>
                            <Link href="/property-management">
                                Property management
                            </Link>
                            <Link href="/contact">Contact</Link>
                        </nav>
                        <button
                            className="ml-auto rounded-lg p-2 text-primary lg:hidden"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle account navigation"
                            aria-expanded={mobileMenuOpen}
                            aria-controls="mobile-account-navigation"
                        >
                            {mobileMenuOpen ? <X /> : <Menu />}
                        </button>
                        <AccountMenu compact />
                    </div>
                    {mobileMenuOpen && (
                        <div
                            id="mobile-account-navigation"
                            className="absolute inset-x-0 top-full border-b border-[#dfe7dd] bg-white p-4 shadow-xl lg:hidden"
                        >
                            <div className="mx-auto max-w-7xl rounded-2xl border border-[#dfe7dd] bg-white p-3">
                                <AccountNavigation
                                    activeTab={props.activeTab}
                                    profile={props.profile}
                                    requestStats={props.requestStats}
                                    initials={initials}
                                    onNavigate={() => setMobileMenuOpen(false)}
                                />
                            </div>
                        </div>
                    )}
                </header>

                <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-8 lg:py-10">
                    <aside className="hidden rounded-2xl border border-[#dfe7dd] bg-white p-3 shadow-sm lg:sticky lg:top-28 lg:block lg:self-start">
                        <AccountNavigation
                            activeTab={props.activeTab}
                            profile={props.profile}
                            requestStats={props.requestStats}
                            initials={initials}
                        />
                    </aside>

                    <main className="min-w-0">
                        {props.activeTab === 'profile' && (
                            <ProfileTab
                                profile={props.profile}
                                initials={initials}
                            />
                        )}
                        {props.activeTab === 'security' && (
                            <SecurityTab passwordRules={props.passwordRules} />
                        )}
                        {props.activeTab === 'requests' && (
                            <RequestsTab
                                profile={props.profile}
                                stats={props.requestStats}
                                requests={props.requests}
                            />
                        )}
                    </main>
                </div>
            </div>
        </>
    );
}

function AccountNavigation({
    activeTab,
    profile,
    requestStats,
    initials,
    onNavigate,
}: {
    activeTab: Tab;
    profile: Profile;
    requestStats: Props['requestStats'];
    initials: string;
    onNavigate?: () => void;
}) {
    return (
        <>
            <div className="mb-3 flex items-center gap-3 border-b p-3 pb-5">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {initials}
                </span>
                <span className="min-w-0">
                    <strong className="block truncate text-sm">
                        {profile.name}
                    </strong>
                    <span className="block truncate text-xs text-muted-foreground">
                        {profile.email}
                    </span>
                </span>
            </div>
            <nav className="space-y-1" aria-label="Account sections">
                {tabs.map(({ key, label, icon: Icon }) => (
                    <Link
                        key={key}
                        href={`/myaccount?tab=${key}`}
                        onClick={onNavigate}
                        className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${activeTab === key ? 'bg-gradient-to-r from-primary/15 to-primary/25 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                    >
                        <Icon className="size-4.5" />
                        {label}
                        {key === 'requests' && requestStats.open > 0 && (
                            <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-[10px] text-primary-foreground">
                                {requestStats.open}
                            </span>
                        )}
                    </Link>
                ))}
            </nav>
            <div className="mt-4 border-t pt-4">
                <button
                    onClick={() => router.post('/logout')}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                    <LogOutIcon />
                    Sign out
                </button>
            </div>
        </>
    );
}

function ProfileTab({
    profile,
    initials,
}: {
    profile: Profile;
    initials: string;
}) {
    const form = useForm({
        name: profile.name,
        email: profile.email,
        phone: profile.phone ?? '',
        address: profile.address ?? '',
        bio: profile.bio ?? '',
    });
    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.patch('/settings/profile', { preserveScroll: true });
    };
    return (
        <section>
            <PageHeading
                title="Profile settings"
                description="Update your personal information and contact details"
            />
            <form
                onSubmit={submit}
                className="overflow-hidden rounded-2xl border border-[#dfe7dd] bg-white shadow-sm"
            >
                <div className="flex flex-col gap-4 bg-gradient-to-r from-primary/10 to-[#eef5e9] p-5 sm:flex-row sm:items-center">
                    <span className="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[#147c48] text-xl font-bold text-white ring-4 ring-white">
                        {initials}
                    </span>
                    <div>
                        <h2 className="text-xl font-bold">{profile.name}</h2>
                        <p className="text-sm text-muted-foreground">
                            {profile.email}
                        </p>
                        {profile.member_since && (
                            <p className="mt-1 text-xs text-muted-foreground">
                                Member since{' '}
                                {new Date(
                                    profile.member_since,
                                ).toLocaleDateString(undefined, {
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </p>
                        )}
                    </div>
                </div>
                <div className="grid gap-5 p-5 sm:p-7">
                    <Field label="Full name" error={form.errors.name}>
                        <Input
                            value={form.data.name}
                            onChange={(e) =>
                                form.setData('name', e.target.value)
                            }
                            required
                            autoComplete="name"
                        />
                    </Field>
                    <Field label="Email address" error={form.errors.email}>
                        <Input
                            type="email"
                            value={form.data.email}
                            onChange={(e) =>
                                form.setData('email', e.target.value)
                            }
                            required
                            autoComplete="email"
                        />
                    </Field>
                    <div className="grid gap-5 md:grid-cols-2">
                        <Field
                            label="Phone or WhatsApp"
                            error={form.errors.phone}
                        >
                            <Input
                                type="tel"
                                value={form.data.phone}
                                onChange={(e) =>
                                    form.setData('phone', e.target.value)
                                }
                                autoComplete="tel"
                                placeholder="e.g. 0617963640"
                            />
                        </Field>
                        <Field
                            label="Address / location"
                            error={form.errors.address}
                        >
                            <Input
                                value={form.data.address}
                                onChange={(e) =>
                                    form.setData('address', e.target.value)
                                }
                                autoComplete="street-address"
                                placeholder="Area in Mogadishu"
                            />
                        </Field>
                    </div>
                    <Field label="About you" error={form.errors.bio}>
                        <Textarea
                            value={form.data.bio}
                            onChange={(e) =>
                                form.setData('bio', e.target.value)
                            }
                            maxLength={1000}
                            rows={4}
                            placeholder="Optional notes that help us serve you"
                        />
                    </Field>
                    <div>
                        <Button disabled={form.processing}>
                            {form.processing ? 'Saving…' : 'Save profile'}
                        </Button>
                    </div>
                </div>
            </form>
        </section>
    );
}

function SecurityTab({ passwordRules }: { passwordRules: string }) {
    const password = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });
    const deletion = useForm({ password: '' });
    const submit = (event: FormEvent) => {
        event.preventDefault();
        password.put('/settings/password', {
            preserveScroll: true,
            onSuccess: () => password.reset(),
        });
    };
    return (
        <section>
            <PageHeading
                title="Security"
                description="Manage your password and account security"
            />
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                <form
                    onSubmit={submit}
                    className="rounded-2xl border border-[#dfe7dd] bg-white p-5 shadow-sm sm:p-7"
                >
                    <div className="mb-6 flex items-center gap-3">
                        <span className="rounded-xl bg-primary/10 p-3 text-primary">
                            <ShieldCheck />
                        </span>
                        <div>
                            <h2 className="font-bold">Update password</h2>
                            <p className="text-sm text-muted-foreground">
                                Use a long, unique password to protect your
                                account.
                            </p>
                        </div>
                    </div>
                    <div className="space-y-5">
                        <Field
                            label="Current password"
                            error={password.errors.current_password}
                        >
                            <PasswordInput
                                value={password.data.current_password}
                                onChange={(e) =>
                                    password.setData(
                                        'current_password',
                                        e.target.value,
                                    )
                                }
                                autoComplete="current-password"
                            />
                        </Field>
                        <Field
                            label="New password"
                            error={password.errors.password}
                        >
                            <PasswordInput
                                value={password.data.password}
                                onChange={(e) =>
                                    password.setData('password', e.target.value)
                                }
                                autoComplete="new-password"
                                passwordrules={passwordRules}
                            />
                        </Field>
                        <Field
                            label="Confirm new password"
                            error={password.errors.password_confirmation}
                        >
                            <PasswordInput
                                value={password.data.password_confirmation}
                                onChange={(e) =>
                                    password.setData(
                                        'password_confirmation',
                                        e.target.value,
                                    )
                                }
                                autoComplete="new-password"
                                passwordrules={passwordRules}
                            />
                        </Field>
                        <Button disabled={password.processing}>
                            <KeyRound />
                            {password.processing
                                ? 'Updating…'
                                : 'Update password'}
                        </Button>
                    </div>
                </form>
                <div className="self-start rounded-2xl border border-red-200 bg-red-50 p-5 sm:p-7">
                    <Trash2 className="mb-4 size-7 text-red-600" />
                    <h2 className="font-bold text-red-700">Delete account</h2>
                    <p className="mt-2 text-sm text-red-700/80">
                        This permanently removes your account. This action
                        cannot be undone.
                    </p>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="destructive" className="mt-5">
                                Delete account
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogTitle>
                                Delete your SOMFIX account?
                            </DialogTitle>
                            <DialogDescription>
                                Enter your current password to permanently
                                delete the account.
                            </DialogDescription>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    deletion.delete('/settings/profile');
                                }}
                                className="space-y-4"
                            >
                                <Field
                                    label="Current password"
                                    error={deletion.errors.password}
                                >
                                    <PasswordInput
                                        value={deletion.data.password}
                                        onChange={(e) =>
                                            deletion.setData(
                                                'password',
                                                e.target.value,
                                            )
                                        }
                                        autoComplete="current-password"
                                    />
                                </Field>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button type="button" variant="outline">
                                            Cancel
                                        </Button>
                                    </DialogClose>
                                    <Button
                                        type="submit"
                                        variant="destructive"
                                        disabled={deletion.processing}
                                    >
                                        Delete permanently
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </section>
    );
}

function RequestsTab({
    profile,
    stats,
    requests,
}: {
    profile: Profile;
    stats: Props['requestStats'];
    requests: Props['requests'];
}) {
    const form = useForm({
        name: profile.name,
        phone: profile.phone ?? '',
        area: profile.address ?? '',
        service: 'Not sure',
        message: '',
        photo: null as File | null,
    });
    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post('/my-requests', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => form.reset('service', 'message', 'photo'),
        });
    };
    return (
        <section>
            <PageHeading
                title="My repair requests"
                description="Submit a repair and follow its progress with SOMFIX"
            />
            <div className="mb-6 grid grid-cols-3 gap-3">
                <Stat label="Total" value={stats.total} icon={LayoutList} />
                <Stat label="New" value={stats.open} icon={CircleUserRound} />
                <Stat
                    label="In progress"
                    value={stats.in_progress}
                    icon={Wrench}
                />
            </div>
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
                <div className="space-y-3">
                    {!requests?.data.length ? (
                        <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-[#dfe7dd] bg-gradient-to-br from-white to-primary/5 p-8 text-center">
                            <span className="mb-4 rounded-full bg-primary/10 p-5 text-primary">
                                <Wrench className="size-9" />
                            </span>
                            <h2 className="text-lg font-bold">
                                No repair requests yet
                            </h2>
                            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                                Tell us what needs fixing using the form. Your
                                requests and updates will appear here.
                            </p>
                        </div>
                    ) : (
                        requests.data.map((request) => (
                            <article
                                key={request.id}
                                className="rounded-2xl border border-[#dfe7dd] bg-white p-5 shadow-sm"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <h2 className="font-bold">
                                            {request.service}
                                        </h2>
                                        <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                                            {request.area && (
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="size-3.5" />
                                                    {request.area}
                                                </span>
                                            )}
                                            {request.created_at && (
                                                <time className="flex items-center gap-1">
                                                    <CalendarDays className="size-3.5" />
                                                    {new Date(
                                                        request.created_at,
                                                    ).toLocaleDateString()}
                                                </time>
                                            )}
                                        </div>
                                    </div>
                                    <RequestStatus status={request.status} />
                                </div>
                                {request.message && (
                                    <p className="mt-4 text-sm whitespace-pre-wrap text-muted-foreground">
                                        {request.message}
                                    </p>
                                )}
                                {request.photo_url && (
                                    <a
                                        href={request.photo_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary"
                                    >
                                        <FileImage className="size-4" />
                                        View attached photo
                                    </a>
                                )}
                            </article>
                        ))
                    )}
                    <div className="flex gap-4 text-sm font-semibold text-primary">
                        {requests?.prev_page_url && (
                            <Link href={requests.prev_page_url}>Previous</Link>
                        )}
                        {requests?.next_page_url && (
                            <Link href={requests.next_page_url}>Next</Link>
                        )}
                    </div>
                </div>
                <form
                    onSubmit={submit}
                    className="self-start rounded-2xl bg-primary p-5 text-white shadow-lg sm:p-6 xl:sticky xl:top-28"
                >
                    <div className="mb-5">
                        <h2 className="text-lg font-bold">Request a repair</h2>
                        <p className="mt-1 text-sm text-white/75">
                            Share the problem and we will contact you with next
                            steps.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <DarkField label="Your name" error={form.errors.name}>
                            <Input
                                value={form.data.name}
                                onChange={(e) =>
                                    form.setData('name', e.target.value)
                                }
                                className="bg-white text-foreground"
                                required
                            />
                        </DarkField>
                        <DarkField
                            label="Phone or WhatsApp"
                            error={form.errors.phone}
                        >
                            <Input
                                type="tel"
                                value={form.data.phone}
                                onChange={(e) =>
                                    form.setData('phone', e.target.value)
                                }
                                className="bg-white text-foreground"
                                required
                            />
                        </DarkField>
                        <DarkField label="Area" error={form.errors.area}>
                            <Input
                                value={form.data.area}
                                onChange={(e) =>
                                    form.setData('area', e.target.value)
                                }
                                className="bg-white text-foreground"
                            />
                        </DarkField>
                        <DarkField
                            label="Service needed"
                            error={form.errors.service}
                        >
                            <select
                                value={form.data.service}
                                onChange={(e) =>
                                    form.setData('service', e.target.value)
                                }
                                className="h-9 w-full rounded-md border bg-white px-3 text-sm text-foreground"
                            >
                                {services.map((service) => (
                                    <option key={service}>{service}</option>
                                ))}
                            </select>
                        </DarkField>
                        <DarkField
                            label="Describe the problem"
                            error={form.errors.message}
                        >
                            <Textarea
                                value={form.data.message}
                                onChange={(e) =>
                                    form.setData('message', e.target.value)
                                }
                                className="min-h-24 bg-white text-foreground"
                                maxLength={3000}
                            />
                        </DarkField>
                        <DarkField
                            label="Photo (optional, up to 5 MB)"
                            error={form.errors.photo}
                        >
                            <Input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="bg-white text-foreground"
                                onChange={(e) =>
                                    form.setData(
                                        'photo',
                                        e.target.files?.[0] ?? null,
                                    )
                                }
                            />
                        </DarkField>
                        <Button
                            className="w-full bg-white font-bold text-primary hover:bg-white/90"
                            disabled={form.processing}
                        >
                            <Send />
                            {form.processing ? 'Sending…' : 'Send request'}
                        </Button>
                    </div>
                </form>
            </div>
        </section>
    );
}

function PageHeading({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {title}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                {description}
            </p>
        </div>
    );
}
function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="grid gap-2">
            <Label>{label}</Label>
            {children}
            <InputError message={error} />
        </div>
    );
}
function DarkField({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="grid gap-1.5">
            <Label className="text-white">{label}</Label>
            {children}
            {error && <p className="text-xs text-red-200">{error}</p>}
        </div>
    );
}
function Stat({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: number;
    icon: typeof Wrench;
}) {
    return (
        <div className="rounded-xl border border-[#dfe7dd] bg-white p-3 sm:p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
                <Icon className="size-4 text-primary" />
                <span className="text-[11px] font-semibold sm:text-xs">
                    {label}
                </span>
            </div>
            <strong className="mt-2 block text-xl sm:text-2xl">{value}</strong>
        </div>
    );
}
function RequestStatus({ status }: { status: string }) {
    const inProgress = status === 'converted';
    return (
        <span
            className={`rounded-full px-2.5 py-1 text-xs font-bold ${inProgress ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}
        >
            {inProgress ? 'In progress' : 'New'}
        </span>
    );
}
function LogOutIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="size-4"
        >
            <path d="M10 17l5-5-5-5M15 12H3M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
        </svg>
    );
}
