import { Head } from '@inertiajs/react';
import {
    Check,
    CheckCircle2,
    CircleDashed,
    Plus,
    type LucideIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

type ModulePageProps = {
    title: string;
    description: string;
    phase: string;
    icon: LucideIcon;
    emptyTitle: string;
    emptyDescription: string;
    actionLabel: string;
    capabilities: string[];
};

export function ModulePage({
    title,
    description,
    phase,
    icon: Icon,
    emptyTitle,
    emptyDescription,
    actionLabel,
    capabilities,
}: ModulePageProps) {
    return (
        <>
            <Head title={title} />

            <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-4">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Icon className="size-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                                {title}
                            </h1>
                            <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
                                {description}
                            </p>
                        </div>
                    </div>

                    <Badge variant="outline" className="w-fit gap-1.5 bg-card">
                        <CircleDashed className="size-3.5 text-accent" />
                        {phase}
                    </Badge>
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(20rem,0.8fr)]">
                    <Card className="min-h-[30rem] justify-between gap-8">
                        <CardHeader>
                            <div className="mb-2 flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                                <Icon className="size-6" />
                            </div>
                            <CardTitle className="text-xl">
                                {emptyTitle}
                            </CardTitle>
                            <CardDescription className="max-w-xl text-base leading-6">
                                {emptyDescription}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="flex flex-col items-start gap-4">
                            <Button disabled>
                                <Plus />
                                {actionLabel}
                            </Button>
                            <p className="text-xs text-muted-foreground">
                                Record creation will be enabled when this module
                                is connected to its domain data.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <CheckCircle2 className="size-5" />
                            </div>
                            <CardTitle>Workspace scope</CardTitle>
                            <CardDescription>
                                The route and navigation shell are ready for
                                this module.
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <ul className="flex flex-col gap-4">
                                {capabilities.map((capability) => (
                                    <li
                                        key={capability}
                                        className="flex gap-3 text-sm leading-6"
                                    >
                                        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            <Check className="size-3" />
                                        </span>
                                        <span className="text-foreground">
                                            {capability}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
