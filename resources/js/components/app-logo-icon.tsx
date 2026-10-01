import type { SVGProps } from 'react';
import BrandLogo from '@/components/brand-logo';

export default function AppLogoIcon(props: SVGProps<SVGSVGElement>) {
    return <BrandLogo compact {...props} />;
}
