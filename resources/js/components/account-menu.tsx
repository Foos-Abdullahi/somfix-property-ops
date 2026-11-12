import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, LogIn, LogOut, UserRound, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type AccountUser = {
    name: string;
    email: string;
    role?: { slug: string; name: string } | null;
};

export default function AccountMenu({
    compact = false,
}: {
    compact?: boolean;
}) {
    const { auth } = usePage<{ auth: { user: AccountUser | null } }>().props;
    const user = auth.user;

    if (!user) {
        return (
            <Link className="repair-header-cta" href="/login">
                <LogIn size={17} />
                <span className={compact ? 'hidden sm:inline' : undefined}>
                    Sign in
                </span>
            </Link>
        );
    }

    const standardUser = user.role?.slug === 'standard-user';
    const accountUrl = standardUser
        ? '/myaccount?tab=profile'
        : '/settings/profile';
    const initials = user.name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className="h-11 gap-2 rounded-xl bg-white px-2.5 shadow-sm sm:px-3"
                >
                    <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {initials}
                    </span>
                    <span className="hidden max-w-32 truncate text-sm font-semibold sm:block">
                        {user.name}
                    </span>
                    <ChevronDown className="hidden size-3.5 text-muted-foreground sm:block" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 rounded-xl p-2">
                <DropdownMenuLabel className="p-3 font-normal">
                    <div className="flex items-center gap-3">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                            {initials}
                        </span>
                        <span className="min-w-0">
                            <span className="block truncate font-semibold text-foreground">
                                {user.name}
                            </span>
                            <span className="block truncate text-xs text-muted-foreground">
                                {user.email}
                            </span>
                            <span className="mt-1 inline-flex rounded bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                                {standardUser
                                    ? 'CUSTOMER'
                                    : user.role?.name?.toUpperCase() || 'STAFF'}
                            </span>
                        </span>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href={accountUrl} className="cursor-pointer py-2.5">
                        <UserRound />
                        Profile
                    </Link>
                </DropdownMenuItem>
                {standardUser && (
                    <DropdownMenuItem asChild>
                        <Link
                            href="/myaccount?tab=requests"
                            className="cursor-pointer py-2.5"
                        >
                            <Wrench />
                            My requests
                        </Link>
                    </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    asChild
                    className="text-red-600 focus:bg-red-50 focus:text-red-700 [&_svg]:text-red-600"
                >
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="w-full cursor-pointer py-2.5"
                    >
                        <LogOut />
                        Sign out
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
