import { useEffect, useRef, useState, type ReactNode } from 'react';
import BrandLogo from '@/components/brand-logo';
import {
    ArrowDownLeft,
    ArrowRight,
    ArrowUpRight,
    Building2,
    Check,
    CircleCheck,
    ClipboardList,
    LayoutDashboard,
    Package,
    Users,
    Wallet,
    Wrench,
    type LucideIcon,
} from 'lucide-react';

export function Brand({ inverse = false }: { inverse?: boolean }) {
    return (
        <span
            className={`sf-brand sf-brand-artwork ${inverse ? 'sf-brand-inverse' : ''}`}
        >
            <BrandLogo
                variant={inverse ? 'dark' : 'auto'}
                className="sf-brand-image"
            />
        </span>
    );
}

export function Reveal({
    children,
    className = '',
}: {
    children: ReactNode;
    className?: string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const node = ref.current;
        if (
            !node ||
            window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
            !('IntersectionObserver' in window)
        )
            return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    node.classList.add('sf-in-view');
                    observer.disconnect();
                }
            },
            { threshold: 0.08 },
        );
        node.classList.add('sf-reveal-ready');
        observer.observe(node);
        return () => observer.disconnect();
    }, []);
    return (
        <div ref={ref} className={`sf-reveal ${className}`}>
            {children}
        </div>
    );
}

export function Photo({
    name,
    alt,
    className = '',
    eager = false,
}: {
    name: string;
    alt: string;
    className?: string;
    eager?: boolean;
}) {
    const [loaded, setLoaded] = useState(false);
    return (
        <div className={`sf-photo ${className}`}>
            <img
                src={`/images/landing/${name}.jpg`}
                alt={alt}
                loading={eager ? 'eager' : 'lazy'}
                fetchPriority={eager ? 'high' : 'auto'}
                decoding="async"
                onLoad={() => setLoaded(true)}
                className={loaded ? 'sf-photo-loaded' : ''}
            />
            <span className="sf-photo-shade" aria-hidden="true" />
        </div>
    );
}

export function Eyebrow({
    children,
    light = false,
}: {
    children: ReactNode;
    light?: boolean;
}) {
    return (
        <p className={`sf-eyebrow ${light ? 'sf-eyebrow-light' : ''}`}>
            <span />
            {children}
        </p>
    );
}

export function HeroVisual() {
    return (
        <div
            className="sf-hero-visual"
            aria-label="Illustrative property operations workspace with sample data"
        >
            <div className="sf-visual-outline" aria-hidden="true" />
            <Photo
                name="property"
                alt="Warm sunlight across the balconies of a modern apartment building"
                className="sf-hero-property"
                eager
            />
            <div className="sf-image-caption">
                <span className="sf-status-dot" />
                Connected properties. Better everyday operations.
            </div>
            <div className="sf-float-card sf-request-card">
                <span className="sf-icon-box">
                    <Wrench size={19} />
                </span>
                <div>
                    <small>Open maintenance requests</small>
                    <strong>
                        12 <span>across 4 properties</span>
                    </strong>
                </div>
                <span className="sf-mini-bars" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                </span>
            </div>
            <div className="sf-float-card sf-rent-card">
                <span className="sf-card-label">
                    Rent collected <ArrowUpRight size={16} />
                </span>
                <strong>
                    $18,450<span> / $20,000</span>
                </strong>
                <div className="sf-progress">
                    <span style={{ width: '92%' }} />
                </div>
                <small>September · sample portfolio</small>
            </div>
            <div className="sf-tech-inset">
                <Photo
                    name="technician"
                    alt="Maintenance technician installing an electrical outlet inside a bright apartment"
                />
                <div>
                    <span className="sf-pill sf-pill-orange">
                        <span />
                        In progress
                    </span>
                    <p>Every job. Moving forward.</p>
                </div>
            </div>
            <div className="sf-float-card sf-technicians-card">
                <span className="sf-avatar-stack">
                    <b>AH</b>
                    <b>FA</b>
                    <b>MK</b>
                </span>
                <div>
                    <strong>8 active technicians</strong>
                    <small>The right people, connected.</small>
                </div>
                <CircleCheck size={19} />
            </div>
            <span className="sf-example-label">
                Illustrative workspace · sample data
            </span>
        </div>
    );
}

type Feature = {
    number: string;
    category: string;
    title: string;
    description: string;
    points: string[];
    image: string;
    alt: string;
    icon: LucideIcon;
    caption: string;
    detail: string;
};
const features: Feature[] = [
    {
        number: '01',
        category: 'PROPERTY & TENANT MANAGEMENT',
        title: 'A place for every property. And every detail.',
        description:
            'From the first lease to the next inspection, keep the full story of your portfolio in one organized workspace.',
        points: [
            'Properties, units and occupancy at a glance',
            'Connected tenant, lease and rent records',
            'Inspections, documents and property history',
        ],
        image: 'team',
        alt: 'Two building professionals reviewing a property together',
        icon: Building2,
        caption: 'One property. One complete record.',
        detail: 'Units · Tenants · Leases · Documents',
    },
    {
        number: '02',
        category: 'MAINTENANCE & FIELD SERVICE',
        title: 'Keep work moving. Keep everyone informed.',
        description:
            'Turn a tenant’s request into a clear plan of action. Give your team the context to do the job and keep a record of what happened.',
        points: [
            'Requests and quotations in one workflow',
            'Clear technician assignments and job status',
            'A maintenance history for every property',
        ],
        image: 'technician',
        alt: 'Technician using a drill to install an outlet inside an apartment',
        icon: Wrench,
        caption: 'From reported to resolved.',
        detail: 'Request · Quote · Assign · Complete',
    },
    {
        number: '03',
        category: 'FINANCE, INVENTORY & PAYMENTS',
        title: 'Know what goes in. And what comes back.',
        description:
            'Connect the materials on your shelves to the work in the field and the numbers in your books. Make every cost easier to follow.',
        points: [
            'Materials, suppliers and stock levels',
            'Quotations, expenses, invoices and payments',
            'Warranty records and operational costs',
        ],
        image: 'inventory',
        alt: 'Organized material shelves with a team member carrying supplies',
        icon: Package,
        caption: 'Every material has a story.',
        detail: 'Stock · Jobs · Costs · Payments',
    },
];

export function FeatureSections({ onDemo }: { onDemo: () => void }) {
    return (
        <div className="sf-features sf-container" id="solutions">
            {features.map((feature, index) => (
                <Reveal
                    key={feature.number}
                    className={`sf-feature ${index % 2 ? 'sf-feature-reverse' : ''}`}
                >
                    <div className="sf-feature-image">
                        <Photo name={feature.image} alt={feature.alt} />
                        <span className="sf-photo-number">
                            {feature.number} / SOMFIX PLATFORM
                        </span>
                        <div className="sf-feature-caption">
                            <span className="sf-icon-box">
                                <feature.icon size={21} />
                            </span>
                            <div>
                                <strong>{feature.caption}</strong>
                                <small>{feature.detail}</small>
                            </div>
                            <ArrowUpRight size={20} />
                        </div>
                    </div>
                    <div className="sf-feature-copy">
                        <Eyebrow>{feature.category}</Eyebrow>
                        <h2>{feature.title}</h2>
                        <p>{feature.description}</p>
                        <ul>
                            {feature.points.map((point) => (
                                <li key={point}>
                                    <Check size={17} />
                                    {point}
                                </li>
                            ))}
                        </ul>
                        <button className="sf-text-link" onClick={onDemo}>
                            Explore this in a demo <ArrowRight size={17} />
                        </button>
                    </div>
                </Reveal>
            ))}
        </div>
    );
}

const dashboardViews = {
    portfolio: {
        title: 'Portfolio overview',
        sub: 'Everything that needs your attention, in one view.',
        stats: [
            ['Property occupancy', '92%', '46 of 50 units'],
            ['Rent collected', '$18,450', 'This month'],
            ['Open work orders', '12', '4 scheduled today'],
        ],
        jobs: [
            ['AC inspection', 'Palm Court · Unit 204', 'In progress'],
            ['Water pump repair', 'Garden Residences', 'Scheduled'],
            ['Door lock replacement', 'Palm Court · Unit 106', 'Completed'],
        ],
    },
    maintenance: {
        title: 'Maintenance overview',
        sub: 'A clear plan for every request and every technician.',
        stats: [
            ['Active technicians', '8', 'Across 4 properties'],
            ['Open work orders', '12', '3 awaiting assignment'],
            ['Completed jobs', '26', 'This month'],
        ],
        jobs: [
            ['Water pump repair', 'Garden Residences', 'Scheduled'],
            ['AC inspection', 'Palm Court · Unit 204', 'In progress'],
            ['Electrical inspection', 'Harbour House', 'Completed'],
        ],
    },
} as const;

export function DashboardPreview() {
    const [view, setView] = useState<keyof typeof dashboardViews>('portfolio');
    const data = dashboardViews[view];
    return (
        <div className="sf-dashboard-shell">
            <div className="sf-dashboard-topbar">
                <span className="sf-window-dots">
                    <i />
                    <i />
                    <i />
                </span>
                <span>
                    <span className="sf-status-dot" />
                    SOMFIX / Your workspace
                </span>
                <span className="sf-dashboard-example">
                    Interactive preview · sample data
                </span>
            </div>
            <div className="sf-dashboard-body">
                <aside className="sf-dashboard-sidebar">
                    <Brand inverse />
                    <p>WORKSPACE</p>
                    {[
                        {
                            id: 'portfolio' as const,
                            label: 'Overview',
                            icon: LayoutDashboard,
                        },
                        {
                            id: 'maintenance' as const,
                            label: 'Work orders',
                            icon: Wrench,
                        },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setView(item.id)}
                            aria-pressed={view === item.id}
                            className={view === item.id ? 'sf-dash-active' : ''}
                        >
                            <item.icon size={16} />
                            {item.label}
                        </button>
                    ))}
                    {[
                        { label: 'Properties', icon: Building2 },
                        { label: 'Tenants & leases', icon: Users },
                        { label: 'Inventory', icon: Package },
                        { label: 'Finance', icon: Wallet },
                    ].map((item) => (
                        <span key={item.label}>
                            <item.icon size={16} />
                            {item.label}
                        </span>
                    ))}
                    <div className="sf-workspace-card">
                        <span>YOUR TEAM, CONNECTED</span>
                        <strong>
                            Good work starts
                            <br />
                            with a clear picture.
                        </strong>
                        <div className="sf-avatar-stack">
                            <b>AH</b>
                            <b>FA</b>
                            <b>MK</b>
                        </div>
                    </div>
                </aside>
                <div className="sf-dashboard-main">
                    <div className="sf-dashboard-heading">
                        <div>
                            <small>YOUR WORKSPACE, AT A GLANCE</small>
                            <h3>{data.title}</h3>
                            <p>{data.sub}</p>
                        </div>
                        <span className="sf-dashboard-date">
                            September · Example
                        </span>
                    </div>
                    <div
                        className="sf-mobile-dash-tabs"
                        role="group"
                        aria-label="Preview view"
                    >
                        <button
                            onClick={() => setView('portfolio')}
                            aria-pressed={view === 'portfolio'}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setView('maintenance')}
                            aria-pressed={view === 'maintenance'}
                        >
                            Work orders
                        </button>
                    </div>
                    <div className="sf-dashboard-stats">
                        {data.stats.map(([label, value, detail], i) => (
                            <div key={label}>
                                <span>
                                    {label}
                                    <ArrowUpRight size={15} />
                                </span>
                                <strong>
                                    {value}
                                    <span
                                        className={`sf-stat-symbol sf-stat-symbol-${i}`}
                                    />
                                </strong>
                                <small>{detail}</small>
                            </div>
                        ))}
                    </div>
                    <div className="sf-dashboard-panels">
                        <div className="sf-chart-card">
                            <div className="sf-panel-heading">
                                <h4>Rent collection</h4>
                                <span>
                                    <i />
                                    Collected
                                </span>
                            </div>
                            <div
                                className="sf-chart"
                                role="img"
                                aria-label="Sample rent collection rises from January to September"
                            >
                                <div className="sf-chart-grid">
                                    <span>$20k</span>
                                    <span>$10k</span>
                                    <span>$0</span>
                                </div>
                                <div className="sf-chart-bars">
                                    {[42, 57, 49, 65, 60, 72, 79, 83, 92].map(
                                        (height, i) => (
                                            <div key={i}>
                                                <span
                                                    style={{
                                                        height: `${height}%`,
                                                    }}
                                                />
                                                <small>
                                                    {
                                                        [
                                                            'J',
                                                            'F',
                                                            'M',
                                                            'A',
                                                            'M',
                                                            'J',
                                                            'J',
                                                            'A',
                                                            'S',
                                                        ][i]
                                                    }
                                                </small>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                            <div className="sf-chart-footer">
                                <span>
                                    Collected <b>$18,450</b>
                                </span>
                                <span>
                                    Outstanding <b>$1,550</b>
                                </span>
                            </div>
                        </div>
                        <div className="sf-schedule-card">
                            <div className="sf-panel-heading">
                                <h4>Technician schedule</h4>
                                <span>Today</span>
                            </div>
                            {[
                                [
                                    '09:00',
                                    'AH',
                                    'Ahmed H.',
                                    'AC inspection',
                                    'Palm Court',
                                ],
                                [
                                    '11:30',
                                    'FA',
                                    'Fatima A.',
                                    'Pump maintenance',
                                    'Garden Residences',
                                ],
                                [
                                    '14:00',
                                    'MK',
                                    'Mohamed K.',
                                    'Electrical inspection',
                                    'Harbour House',
                                ],
                            ].map(([time, initials, name, job, property]) => (
                                <div className="sf-schedule-row" key={time}>
                                    <time>{time}</time>
                                    <span className="sf-small-avatar">
                                        {initials}
                                    </span>
                                    <div>
                                        <strong>{name}</strong>
                                        <span>{job}</span>
                                        <small>{property}</small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="sf-dashboard-bottom">
                        <div className="sf-jobs-card">
                            <div className="sf-panel-heading">
                                <h4>Recent work orders</h4>
                                <ClipboardList size={16} />
                            </div>
                            {data.jobs.map(([job, location, status]) => (
                                <div className="sf-job-row" key={job}>
                                    <div>
                                        <strong>{job}</strong>
                                        <small>{location}</small>
                                    </div>
                                    <span
                                        className={`sf-pill ${status === 'In progress' ? 'sf-pill-orange' : ''}`}
                                    >
                                        {status}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="sf-payments-card">
                            <div className="sf-panel-heading">
                                <h4>Recent payments</h4>
                                <Wallet size={16} />
                            </div>
                            {[
                                ['Unit 204', '$450'],
                                ['Unit 108', '$600'],
                            ].map(([unit, amount]) => (
                                <div className="sf-payment-row" key={unit}>
                                    <span className="sf-icon-box">
                                        <ArrowDownLeft size={16} />
                                    </span>
                                    <div>
                                        <strong>{unit}</strong>
                                        <small>Rent payment</small>
                                    </div>
                                    <b>{amount}</b>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
