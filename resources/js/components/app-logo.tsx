import AppLogoIcon from '@/components/app-logo-icon';
import BrandLogo from '@/components/brand-logo';

export default function AppLogo() {
    return (
        <>
            <span className="hidden size-8 shrink-0 group-data-[collapsible=icon]:block">
                <AppLogoIcon className="size-8" />
            </span>
            <span className="block min-w-0 group-data-[collapsible=icon]:hidden">
                <BrandLogo className="h-10 w-auto max-w-full" />
            </span>
        </>
    );
}
