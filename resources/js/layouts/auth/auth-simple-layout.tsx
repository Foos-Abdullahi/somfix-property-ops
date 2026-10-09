import { Link } from '@inertiajs/react';
import { Moon, Sun } from 'lucide-react';
import BrandLogo from '@/components/brand-logo';
import { Button } from '@/components/ui/button';
import { useAppearance } from '@/hooks/use-appearance';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { resolvedAppearance, updateAppearance } = useAppearance();

    return (
        <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[#f8faf9] px-4 py-16 dark:bg-[#20201e] sm:px-6">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_75%,rgba(0,67,23,0.12),transparent_35%),radial-gradient(circle_at_90%_15%,rgba(245,154,35,0.14),transparent_34%)] dark:bg-[radial-gradient(circle_at_10%_75%,rgba(0,67,23,0.35),transparent_36%),radial-gradient(circle_at_90%_15%,rgba(245,154,35,0.12),transparent_34%)]" />

            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() =>
                    updateAppearance(
                        resolvedAppearance === 'dark' ? 'light' : 'dark',
                    )
                }
                className="absolute top-5 right-5 z-10 rounded-full"
                aria-label={`Switch to ${resolvedAppearance === 'dark' ? 'light' : 'dark'} theme`}
            >
                {resolvedAppearance === 'dark' ? (
                    <Sun className="size-5" />
                ) : (
                    <Moon className="size-5" />
                )}
            </Button>

            <section className="relative z-10 w-full max-w-[560px] border border-black/5 bg-white/95 px-5 py-8 shadow-[0_24px_70px_-28px_rgba(0,0,0,0.38)] backdrop-blur-sm dark:border-white/10 dark:bg-card/95 sm:px-12 sm:py-11">
                <div className="flex flex-col gap-8">
                    <header className="flex flex-col items-center gap-4">
                        <Link
                            href={home()}
                            className="flex items-center justify-center"
                        >
                            <BrandLogo className="h-14 w-auto" />
                            <span className="sr-only">{title}</span>
                        </Link>

                        <div className="space-y-1.5 text-center">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                {title}
                            </h1>
                            <p className="text-center text-sm text-muted-foreground">
                                {description}
                            </p>
                        </div>
                    </header>
                    {children}
                </div>
            </section>
        </main>
    );
}
