import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    ArrowDown,
    ArrowRight,
    ArrowUpRight,
    Building2,
    Check,
    Globe2,
    Instagram,
    Linkedin,
    Menu,
    Moon,
    Sun,
    Wrench,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useAppearance } from '@/hooks/use-appearance';
import {
    Brand,
    Eyebrow,
    FeatureSections,
    HeroVisual,
    Photo,
    Reveal,
} from '@/components/landing/sections';
import { DemoDialog } from '@/components/landing/demo-dialog';
import { dashboard, login } from '@/routes';
import '../../css/landing.css';

const navigation = [
    { label: 'Solutions', href: '#solutions' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
];
export default function Welcome() {
    const { auth } = usePage().props;
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const [demoOpen, setDemoOpen] = useState(false);
    const [legal, setLegal] = useState<'privacy' | 'terms' | null>(null);
    const requestDemo = () => setDemoOpen(true);
    return (
        <>
            <Head title="SOMFIX — One workspace for every property operation">
                <meta
                    name="description"
                    content="Connect properties, tenants, maintenance teams, inventory and finances. SOMFIX is one property operations workspace for growing teams in Somalia and East Africa."
                />
            </Head>
            <div className="somfix-landing">
                <a href="#main" className="sf-skip">
                    Skip to content
                </a>
                <header className="sf-header">
                    <div className="sf-container sf-nav">
                        <a href="#" aria-label="SOMFIX home">
                            <Brand />
                        </a>
                        <div className="sf-nav-right">
                            <nav
                                className="sf-desktop-nav"
                                aria-label="Main navigation"
                            >
                                {navigation.map((item) => (
                                    <a key={item.href} href={item.href}>
                                        {item.label}
                                    </a>
                                ))}
                            </nav>
                            <span
                                className="sf-nav-divider"
                                aria-hidden="true"
                            />
                            <div className="sf-nav-actions">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="sf-theme-button"
                                onClick={() =>
                                    updateAppearance(
                                        resolvedAppearance === 'dark'
                                            ? 'light'
                                            : 'dark',
                                    )
                                }
                                aria-label={`Switch to ${resolvedAppearance === 'dark' ? 'light' : 'dark'} theme`}
                            >
                                {resolvedAppearance === 'dark' ? (
                                    <Sun />
                                ) : (
                                    <Moon />
                                )}
                            </Button>
                            <Link
                                href={auth.user ? dashboard() : login()}
                                className="sf-signin"
                            >
                                {auth.user ? 'Dashboard' : 'Sign In'}
                                <ArrowUpRight size={14} />
                            </Link>
                            <Button
                                onClick={requestDemo}
                                className="sf-button sf-nav-demo"
                            >
                                Request a Demo
                                <ArrowUpRight size={16} />
                            </Button>
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="sf-mobile-menu"
                                        aria-label="Open navigation"
                                    >
                                        <Menu />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent className="sf-mobile-sheet">
                                    <SheetHeader>
                                        <SheetTitle>
                                            <Brand />
                                        </SheetTitle>
                                        <SheetDescription>
                                            Your property operations, connected.
                                        </SheetDescription>
                                    </SheetHeader>
                                    <nav
                                        aria-label="Mobile navigation"
                                        className="sf-mobile-links"
                                    >
                                        {navigation.map((item) => (
                                            <SheetClose asChild key={item.href}>
                                                <a href={item.href}>
                                                    {item.label}
                                                    <ArrowUpRight size={18} />
                                                </a>
                                            </SheetClose>
                                        ))}
                                        <SheetClose asChild>
                                            <Link
                                                href={
                                                    auth.user
                                                        ? dashboard()
                                                        : login()
                                                }
                                            >
                                                {auth.user
                                                    ? 'Dashboard'
                                                    : 'Sign In'}
                                                <ArrowUpRight size={18} />
                                            </Link>
                                        </SheetClose>
                                        <SheetClose asChild>
                                            <Button
                                                onClick={requestDemo}
                                                className="sf-button"
                                            >
                                                Request a Demo
                                                <ArrowRight />
                                            </Button>
                                        </SheetClose>
                                    </nav>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </div>
            </header>
                <main id="main">
                    <section className="sf-hero">
                        <div className="sf-hero-grid" aria-hidden="true" />
                        <div className="sf-container sf-hero-inner">
                            <div className="sf-hero-copy">
                                <span className="sf-hero-pill">
                                    <span className="sf-status-dot" />
                                    One platform for property operations
                                </span>
                                <h1>
                                    Run every property operation{' '}
                                    <span>from one place.</span>
                                </h1>
                                <p>
                                    SOMFIX connects properties, tenants,
                                    maintenance teams, quotations, inventory,
                                    invoices, and payments into one clear
                                    workflow.
                                </p>
                                <div className="sf-hero-buttons">
                                    <Button
                                        onClick={requestDemo}
                                        className="sf-button sf-button-large"
                                    >
                                        Request a Demo
                                        <ArrowUpRight />
                                    </Button>
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="sf-button-outline sf-button-large"
                                    >
                                        <a href="#solutions">
                                            Explore Solutions
                                            <ArrowDown size={17} />
                                        </a>
                                    </Button>
                                </div>
                                <div className="sf-hero-notes">
                                    <span>
                                        <Check size={15} />
                                        One connected workspace
                                    </span>
                                    <span>
                                        <Check size={15} />
                                        Built for your whole team
                                    </span>
                                </div>
                                <div className="sf-hero-footnote">
                                    <span>
                                        <Globe2 size={17} />
                                    </span>
                                    <p>
                                        Local understanding. A bigger picture.
                                        <small>
                                            For growing property companies in
                                            Somalia & East Africa.
                                        </small>
                                    </p>
                                </div>
                            </div>
                            <HeroVisual />
                        </div>
                        <div className="sf-container sf-hero-bottom">
                            <span>LESS CHASING. MORE CLARITY.</span>
                            <a href="#solutions">
                                Explore our solutions
                                <ArrowDown size={15} />
                            </a>
                        </div>
                    </section>

                    <FeatureSections onDemo={requestDemo} />

                    <section
                        className="sf-about-section sf-container"
                        id="about"
                    >
                        <Reveal className="sf-about-inner">
                            <div>
                                <Eyebrow>BUILT AROUND REAL OPERATIONS</Eyebrow>
                                <h2>
                                    For the people
                                    <br />
                                    behind every property.
                                </h2>
                            </div>
                            <div>
                                <p>
                                    Great property operations happen when people
                                    have what they need to do good work. The
                                    right record. A clear assignment. A payment
                                    that’s easy to trace.
                                </p>
                                <p>
                                    SOMFIX brings those everyday details
                                    together for property companies and
                                    maintenance teams in Somalia and East
                                    Africa—so growing your portfolio doesn’t
                                    mean growing the confusion.
                                </p>
                                <span className="sf-about-location">
                                    <Globe2 size={18} />
                                    Designed with Somalia & East Africa in mind
                                </span>
                            </div>
                        </Reveal>
                    </section>

                    <section
                        className="sf-cta-section sf-container"
                        id="contact"
                    >
                        <Reveal className="sf-cta">
                            <Photo
                                name="service"
                                alt="Field technician inspecting air-conditioning equipment"
                            />
                            <div className="sf-cta-copy">
                                <Eyebrow light>A CLEARER WAY TO WORK</Eyebrow>
                                <h2>
                                    Bring property and maintenance operations
                                    together.
                                </h2>
                                <p>
                                    Replace spreadsheets, disconnected calls,
                                    and manual follow-ups with one connected
                                    SOMFIX workspace.
                                </p>
                                <div className="sf-cta-buttons">
                                    <Button
                                        className="sf-button sf-button-orange sf-button-large"
                                        onClick={requestDemo}
                                    >
                                        Request a Demo
                                        <ArrowUpRight />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="sf-button-glass sf-button-large"
                                        onClick={requestDemo}
                                    >
                                        Contact Us
                                        <ArrowRight size={16} />
                                    </Button>
                                </div>
                            </div>
                            <div className="sf-cta-stamp">
                                <span>
                                    <Building2 />
                                    <Wrench />
                                </span>
                                ONE WORKSPACE.
                                <br />
                                EVERY OPERATION.
                            </div>
                        </Reveal>
                    </section>
                </main>
                <footer className="sf-footer">
                    <div className="sf-container">
                        <div className="sf-footer-top">
                            <div className="sf-footer-brand">
                                <a href="#" aria-label="SOMFIX home">
                                    <Brand />
                                </a>
                                <p>
                                    Connected property operations.
                                    <br />
                                    Better days for the people behind them.
                                </p>
                                <div
                                    className="sf-socials"
                                    aria-label="Social profiles coming soon"
                                >
                                    {[
                                        { icon: Linkedin, label: 'LinkedIn' },
                                        { icon: Instagram, label: 'Instagram' },
                                    ].map((social) => (
                                        <button
                                            key={social.label}
                                            disabled
                                            aria-label={`${social.label} — coming soon`}
                                            title={`${social.label} — coming soon`}
                                        >
                                            <social.icon size={17} />
                                        </button>
                                    ))}
                                    <small>Social profiles coming soon</small>
                                </div>
                            </div>
                            <div>
                                <h3>Solutions</h3>
                                <a href="#solutions">Property management</a>
                                <a href="#solutions">Maintenance & service</a>
                                <a href="#solutions">Finance & inventory</a>
                            </div>
                            <div>
                                <h3>Company</h3>
                                <a href="#about">About SOMFIX</a>
                                <a href="#about">Who it’s for</a>
                                <a href="#contact">Contact</a>
                                <button onClick={requestDemo}>
                                    Request a demo
                                </button>
                                <button onClick={requestDemo}>
                                    Contact us
                                </button>
                            </div>
                            <div>
                                <h3>Legal</h3>
                                <button onClick={() => setLegal('privacy')}>
                                    Privacy overview
                                </button>
                                <button onClick={() => setLegal('terms')}>
                                    Service information
                                </button>
                            </div>
                        </div>
                        <div className="sf-footer-bottom">
                            <span>
                                © {new Date().getFullYear()} SOMFIX Property
                                Operations.
                            </span>
                            <span>
                                <span className="sf-status-dot" />
                                Built to bring it all together.
                            </span>
                            <a href="#">
                                Back to top
                                <ArrowUpRight size={14} />
                            </a>
                        </div>
                    </div>
                </footer>
            </div>
            <DemoDialog open={demoOpen} onOpenChange={setDemoOpen} />
            <Dialog
                open={legal !== null}
                onOpenChange={(open) => {
                    if (!open) setLegal(null);
                }}
            >
                <DialogContent className="max-h-[85dvh] overflow-y-auto rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {legal === 'privacy'
                                ? 'Privacy overview'
                                : 'Service information'}
                        </DialogTitle>
                        <DialogDescription>
                            {legal === 'privacy'
                                ? 'Information about this website and its inquiry form.'
                                : 'About this product preview.'}
                        </DialogDescription>
                    </DialogHeader>
                    {legal === 'privacy' ? (
                        <div className="space-y-4 text-sm leading-7">
                            <p>
                                The inquiry form stores the name, email address,
                                company, team size and optional message you
                                submit. These details help SOMFIX understand and
                                respond to your request.
                            </p>
                            <p>
                                The site uses cookies for sessions and security.
                                Your theme preference is saved in your browser.
                                The dashboard examples are fictional and do not
                                show customer or tenant data.
                            </p>
                            <p>
                                For a question about information submitted
                                through this site, use Contact Us and describe
                                your request without including sensitive
                                records.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4 text-sm leading-7">
                            <p>
                                This website introduces SOMFIX Property
                                Operations. Dashboard figures, property names,
                                schedules and payments are illustrative
                                examples, not customer results or service
                                guarantees.
                            </p>
                            <p>
                                Submitting an inquiry does not create a
                                subscription or payment obligation. Discuss
                                availability, pricing, service terms and
                                data-handling requirements with SOMFIX before
                                onboarding.
                            </p>
                        </div>
                    )}
                    <Button
                        onClick={() => {
                            setLegal(null);
                            requestDemo();
                        }}
                    >
                        Contact Us
                        <ArrowRight />
                    </Button>
                </DialogContent>
            </Dialog>
        </>
    );
}
