import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Head, router, useForm } from '@inertiajs/react';
import { type FormEvent } from 'react';
import { Errors } from '@/components/access-management';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Role = { id: number; name: string; slug: string; permissions: string[] };
type ManagedUser = {
    id: number;
    name: string;
    email: string;
    role_id: number | null;
    role: Role | null;
    is_active: boolean;
};

export default function UserEditor({
    user,
    roles,
    self,
}: {
    user: ManagedUser | null;
    roles: Role[];
    self: boolean;
}) {
    const onClose = () => router.visit('/settings/users');
    const form = useForm({
        name: user?.name ?? '',
        email: user?.email ?? '',
        password: '',
        password_confirmation: '',
        role_id: String(
            user?.role_id ??
                roles.find((role) => role.slug === 'viewer')?.id ??
                roles[0]?.id ??
                '',
        ),
        is_active: user?.is_active ?? true,
    });
    function submit(event: FormEvent) {
        event.preventDefault();
        const options = {
            onSuccess: () => {
                form.reset('password', 'password_confirmation');
            },
        };
        if (user) form.put(`/settings/users/${user.id}`, options);
        else form.post('/settings/users', options);
    }
    return (
        <div className="mx-auto w-full max-w-4xl space-y-6 p-4 md:p-6">
            <Head title={user ? 'Edit user' : 'Create user'} />
            <header>
                <h1 className="text-2xl font-bold">
                    {user ? 'Edit user' : 'Create user'}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    {user
                        ? 'Leave the password blank to keep the current password.'
                        : 'Create a verified staff account with a role and a password.'}
                </p>
            </header>
            <form
                onSubmit={submit}
                className="space-y-4 rounded-xs border bg-card p-6"
            >
                <Errors errors={form.errors} />
                <div className="space-y-2">
                    <Label htmlFor="user-name">Name</Label>
                    <Input
                        id="user-name"
                        required
                        value={form.data.name}
                        onChange={(e) => form.setData('name', e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="user-email">Email</Label>
                    <Input
                        id="user-email"
                        type="email"
                        required
                        value={form.data.email}
                        onChange={(e) => form.setData('email', e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="user-role">Role</Label>
                    <Select
                        disabled={self}
                        value={form.data.role_id}
                        onValueChange={(value) =>
                            form.setData('role_id', value)
                        }
                    >
                        <SelectTrigger id="user-role" className="w-full">
                            <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                            {roles.map((role) => (
                                <SelectItem
                                    key={role.id}
                                    value={String(role.id)}
                                >
                                    {role.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="user-password">
                        {user ? 'New password' : 'Password'} (12+ characters)
                    </Label>
                    <Input
                        id="user-password"
                        type="password"
                        autoComplete="new-password"
                        minLength={12}
                        required={!user}
                        value={form.data.password}
                        onChange={(e) =>
                            form.setData('password', e.target.value)
                        }
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="user-confirm">Confirm password</Label>
                    <Input
                        id="user-confirm"
                        type="password"
                        autoComplete="new-password"
                        required={!!form.data.password}
                        value={form.data.password_confirmation}
                        onChange={(e) =>
                            form.setData(
                                'password_confirmation',
                                e.target.value,
                            )
                        }
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="user-status">Account status</Label>
                    <Select
                        disabled={self}
                        value={form.data.is_active ? 'active' : 'inactive'}
                        onValueChange={(value) =>
                            form.setData('is_active', value === 'active')
                        }
                    >
                        <SelectTrigger id="user-status" className="w-full">
                            <SelectValue placeholder="Select account status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={form.processing}
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button disabled={form.processing || !form.data.role_id}>
                        {form.processing ? 'Saving…' : 'Save user'}
                    </Button>
                </div>
            </form>
        </div>
    );
}

UserEditor.layout = {
    breadcrumbs: [
        { title: 'users', href: '/settings/users' },
        { title: 'Form', href: '#' },
    ],
};
