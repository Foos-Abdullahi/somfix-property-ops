import type { SVGProps } from 'react';
import lightLogo from '../../assets/LOGO-01.jpg.jpeg';
import orangeLogo from '../../assets/LOGO-02.jpg.jpeg';
import darkLogo from '../../assets/LOGO-03.jpg.jpeg';
import { cn } from '@/lib/utils';

type LogoProps = SVGProps<SVGSVGElement> & {
    compact?: boolean;
    variant?: 'auto' | 'light' | 'dark' | 'orange';
};

// Viewports display the original symbol and wordmark without the source artwork's
// large presentation margins. The supplied JPEG files remain unchanged.
export default function BrandLogo({
    compact = false,
    variant = 'auto',
    className,
    ...props
}: LogoProps) {
    const versions =
        variant === 'auto' ? (['light', 'dark'] as const) : [variant];
    return (
        <svg
            viewBox={compact ? '0 0 48 48' : '0 0 184 48'}
            role="img"
            aria-label="SOMFIX Property Operations"
            className={cn('shrink-0', className)}
            {...props}
        >
            {versions.map((version) => {
                const source =
                    version === 'dark'
                        ? darkLogo
                        : version === 'orange'
                          ? orangeLogo
                          : lightLogo;
                const background =
                    version === 'dark'
                        ? '#004317'
                        : version === 'orange'
                          ? '#ff8500'
                          : '#ffffff';
                return (
                    <g
                        key={version}
                        className={
                            variant === 'auto'
                                ? version === 'dark'
                                    ? 'hidden dark:block'
                                    : 'dark:hidden'
                                : undefined
                        }
                    >
                        <rect
                            width={compact ? 48 : 184}
                            height="48"
                            rx="7"
                            fill={background}
                        />
                        <svg
                            x="4"
                            y="5"
                            width="40"
                            height="37"
                            viewBox="432 410 735 630"
                            preserveAspectRatio="xMidYMid meet"
                        >
                            <image href={source} width="1600" height="1600" />
                        </svg>
                        {!compact && (
                            <>
                                <svg
                                    x="54"
                                    y="7"
                                    width="119"
                                    height="25"
                                    viewBox="441 1090 716 149"
                                    preserveAspectRatio="xMidYMid meet"
                                >
                                    <image
                                        href={source}
                                        width="1600"
                                        height="1600"
                                    />
                                </svg>
                                <text
                                    x="55"
                                    y="41"
                                    fill={
                                        version === 'dark'
                                            ? '#ffffff'
                                            : '#004317'
                                    }
                                    fontFamily="Arial, sans-serif"
                                    fontSize="7.4"
                                    letterSpacing="1.05"
                                >
                                    PROPERTY OPERATIONS
                                </text>
                            </>
                        )}
                    </g>
                );
            })}
        </svg>
    );
}
