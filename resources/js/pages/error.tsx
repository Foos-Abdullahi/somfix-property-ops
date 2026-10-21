import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Clock,
    Ghost,
    Home,
    RotateCcw,
    SearchX,
    ServerCrash,
    ShieldAlert,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import BrandLogo from '@/components/brand-logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type {
    ErrorColor,
    ErrorConfig,
    ErrorPageProps,
    ErrorStatusCode,
} from './error/types';

/**
 * ONLY full-page system/server errors.
 */
export const ERROR_CONFIG: Record<ErrorStatusCode, ErrorConfig> = {
    403: {
        title: 'Access Denied',
        description: 'You do not have permission to access this page.',
        color: 'purple',
        icon: ShieldAlert,
        suggestions: [
            'Contact administrator',
            'Switch account',
            'Return to dashboard',
        ],
    },
    404: {
        title: 'Page Not Found',
        description: 'The page you are looking for could not be found.',
        color: 'blue',
        icon: SearchX,
        suggestions: [
            'Check the page URL',
            'Return to dashboard',
            'Use site navigation',
        ],
    },
    429: {
        title: 'Too Many Requests',
        description:
            'You have made too many requests. Please wait a moment and try again.',
        color: 'orange',
        icon: Clock,
        suggestions: [
            'Wait a minute before trying again',
            'Avoid rapid repeated actions',
            'Contact support if this keeps happening',
        ],
        showRetry: true,
        autoRetry: true,
    },
    500: {
        title: 'Server Error',
        description: 'Something unexpected happened on our side.',
        color: 'red',
        icon: ServerCrash,
        suggestions: [
            'Refresh the page',
            'Try again later',
            'Contact support if issue continues',
        ],
        showRetry: true,
    },
    502: {
        title: 'Bad Gateway',
        description: 'The server received an invalid response.',
        color: 'purple',
        icon: Ghost,
        suggestions: [
            'Try again shortly',
            'Check your internet connection',
            'The issue may be temporary',
        ],
        showRetry: true,
        autoRetry: true,
    },
    503: {
        title: 'Service Unavailable',
        description: 'The service is temporarily unavailable.',
        color: 'orange',
        icon: ServerCrash,
        suggestions: [
            'Wait a few minutes',
            'Refresh later',
            'Try again shortly',
        ],
        showRetry: true,
        autoRetry: true,
    },
    504: {
        title: 'Gateway Timeout',
        description: 'The server took too long to respond.',
        color: 'red',
        icon: Clock,
        suggestions: [
            'Check your internet connection',
            'Retry the request',
            'Try again later',
        ],
        showRetry: true,
        autoRetry: true,
    },
};

export const getErrorConfig = (status: ErrorStatusCode): ErrorConfig => {
    return ERROR_CONFIG[status] || ERROR_CONFIG[500];
};

const colorClasses: Record<
    ErrorColor,
    {
        bg: string;
        text: string;
        border: string;
        ring: string;
        glow: string;
    }
> = {
    purple: {
        bg: 'bg-purple-500/10 dark:bg-purple-500/20',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-500/20',
        ring: 'ring-purple-500/30',
        glow: 'from-purple-500/10 via-transparent to-transparent',
    },
    blue: {
        bg: 'bg-blue-500/10 dark:bg-blue-500/20',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-500/20',
        ring: 'ring-blue-500/30',
        glow: 'from-blue-500/10 via-transparent to-transparent',
    },
    orange: {
        bg: 'bg-amber-500/10 dark:bg-amber-500/20',
        text: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-500/20',
        ring: 'ring-amber-500/30',
        glow: 'from-amber-500/10 via-transparent to-transparent',
    },
    red: {
        bg: 'bg-red-500/10 dark:bg-red-500/20',
        text: 'text-red-600 dark:text-red-400',
        border: 'border-red-500/20',
        ring: 'ring-red-500/30',
        glow: 'from-red-500/10 via-transparent to-transparent',
    },
};

export default function ErrorPage({
    status,
    message,
    requestId,
    timestamp,
    route,
}: ErrorPageProps) {
    const config = getErrorConfig(status as ErrorStatusCode);
    const colors = colorClasses[config.color] || colorClasses.red;
    const Icon = config.icon;

    const [countdown, setCountdown] = useState<number | null>(
        config.autoRetry ? 30 : null,
    );

    useEffect(() => {
        if (!config.autoRetry || countdown === null) return;
        if (countdown <= 0) {
            window.location.reload();
            return;
        }
        const timer = setTimeout(() => {
            setCountdown((prev) => (prev !== null ? prev - 1 : null));
        }, 1000);
        return () => clearTimeout(timer);
    }, [countdown, config.autoRetry]);

    const handleRetry = () => {
        window.location.reload();
    };

    const handleBack = () => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = '/dashboard';
        }
    };

    return (
        <>
            <Head title={`${status} — ${config.title}`} />
            <div className="relative flex min-h-screen flex-col items-center justify-between bg-background p-4 sm:p-6 lg:p-8">
                {/* Background decorative gradient */}
                <div
                    className={`pointer-events-none absolute inset-x-0 top-0 h-96 bg-gradient-to-b ${colors.glow} opacity-60`}
                    aria-hidden="true"
                />

                {/* Top header with logo */}
                <header className="relative z-10 flex w-full max-w-3xl items-center justify-between py-4">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 transition-opacity hover:opacity-90"
                    >
                        <BrandLogo className="h-9 w-auto" />
                    </Link>
                    <span className="font-mono text-xs text-muted-foreground">
                        Status Code: {status}
                    </span>
                </header>

                {/* Main Card Content */}
                <main className="relative z-10 my-auto w-full max-w-xl">
                    <Card className="rounded-2xl border-border/70 shadow-lg backdrop-blur-xs">
                        <CardContent className="space-y-6 p-6 sm:p-8">
                            <div className="flex flex-col items-center text-center">
                                {/* Icon container */}
                                <div
                                    className={`relative flex size-20 items-center justify-center rounded-2xl border ${colors.border} ${colors.bg} ${colors.text} shadow-sm ring-4 ${colors.ring}`}
                                >
                                    <Icon className="size-10" />
                                </div>

                                {/* Status code pill */}
                                <div className="mt-4">
                                    <span
                                        className={`inline-flex items-center rounded-full px-3 py-1 font-mono text-xs font-semibold ${colors.bg} ${colors.text} border ${colors.border}`}
                                    >
                                        Error {status}
                                    </span>
                                </div>

                                {/* Title */}
                                <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                                    {config.title}
                                </h1>

                                {/* Description */}
                                <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                                    {message &&
                                    message !== 'Forbidden' &&
                                    message !== 'Unauthorized'
                                        ? message
                                        : config.description}
                                </p>
                            </div>

                            {/* Suggestions box */}
                            {config.suggestions.length > 0 && (
                                <div className="rounded-xl border bg-muted/40 p-4">
                                    <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Suggested actions
                                    </p>
                                    <ul className="mt-2.5 space-y-2 text-sm text-foreground/90">
                                        {config.suggestions.map(
                                            (suggestion) => (
                                                <li
                                                    key={suggestion}
                                                    className="flex items-start gap-2"
                                                >
                                                    <span
                                                        className={`mt-1.5 size-1.5 shrink-0 rounded-full ${colors.text} bg-current`}
                                                    />
                                                    <span>{suggestion}</span>
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                </div>
                            )}

                            {/* Auto-retry notice */}
                            {config.autoRetry && countdown !== null && (
                                <p className="text-center text-xs text-muted-foreground">
                                    Auto-retrying in{' '}
                                    <span className="font-semibold text-foreground tabular-nums">
                                        {countdown}s
                                    </span>
                                    …
                                </p>
                            )}

                            {/* Action buttons */}
                            <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-center">
                                <Button
                                    variant="outline"
                                    onClick={handleBack}
                                    className="gap-2"
                                >
                                    <ArrowLeft className="size-4" />
                                    Go back
                                </Button>

                                {config.showRetry && (
                                    <Button
                                        variant="outline"
                                        onClick={handleRetry}
                                        className="gap-2"
                                    >
                                        <RotateCcw className="size-4" />
                                        Try again
                                    </Button>
                                )}

                                <Button asChild className="gap-2">
                                    <Link href="/dashboard">
                                        <Home className="size-4" />
                                        Return to dashboard
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </main>

                {/* Footer metadata */}
                <footer className="relative z-10 w-full max-w-3xl py-4 text-center text-xs text-muted-foreground">
                    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-mono text-[11px]">
                        {route && <span>Path: /{route}</span>}
                        {requestId && <span>Request ID: {requestId}</span>}
                        {timestamp && (
                            <span>
                                Time: {new Date(timestamp).toLocaleTimeString()}
                            </span>
                        )}
                    </div>
                    <p className="mt-2 text-[11px] text-muted-foreground/80">
                        SOMFIX Property Operations Platform
                    </p>
                </footer>
            </div>
        </>
    );
}
