import { Head, Link, useForm } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import {
    ArrowRight,
    Check,
    Menu,
    MessageCircle,
    Phone,
    Wrench,
    X,
} from 'lucide-react';
import BrandLogo from '@/components/brand-logo';
import '../../css/repair-site.css';

const whatsapp =
    'https://wa.me/252617963640?text=Hello%20SOMFIX%2C%20I%20need%20help%20with%3A%20';
const phone = 'tel:+252617963640';
const services = [
    [
        'Door repair',
        'Dayactirka albaabada',
        'From $25',
        'Doors that stick, drag, won’t close or won’t lock. We fix hinges, handles, locks and frames, for wooden and metal doors.',
    ],
    [
        'Window repair',
        'Dayactirka daaqadaha',
        'From $45',
        'Broken handles and locks, sliding windows that jam, damaged frames and rubber seals.',
    ],
    [
        'Plumbing',
        'Biyaha guriga',
        'From $30',
        'Leaking taps and pipes, blocked sinks and drains, toilets, water tanks and pumps.',
    ],
    [
        'Mosquito screens',
        'Shabaga kaneecada',
        'From $34',
        'New screens for windows and doors, and repair of torn or loose screens. Keep mosquitoes out and air flowing.',
    ],
    [
        'Broken glass',
        'Muraayadaha jaba',
        'From $30',
        'Replace broken or cracked glass in windows, doors, cabinets and tables, cut to size.',
    ],
    [
        'Wardrobes & cabinets',
        'Sagatuurka',
        'From $60',
        'Fix doors, hinges, drawers and shelves, or fit new wardrobes and cabinets.',
    ],
    [
        'Kitchen repair',
        'Jikooyinka',
        'From $70',
        'Kitchen cabinets, worktops, sinks and fittings, repaired or replaced.',
    ],
    [
        'Cleaning',
        '',
        'From $20',
        'Deep cleaning after repairs, before you move in, or when a tenant moves out.',
    ],
    [
        'Renovation',
        'Dib-u-habayn',
        'Quote on visit',
        'Bigger jobs: refresh a room, apartment or office. We plan it, price it and manage it from start to finish.',
    ],
    [
        'Any other household repair',
        '',
        'From $30',
        'Small jobs around the home or office. If you are not sure we do it, just ask.',
    ],
] as const;
const navigation = [
    ['Home', '/'],
    ['Services', '/services'],
    ['Property management', '/property-management'],
    ['Maintenance', '/maintenance-plans'],
    ['How it works', '/how-it-works'],
    ['About', '/about'],
    ['FAQ', '/faq'],
    ['Contact', '/contact'],
] as const;
const trust = [
    [
        'One call, every trade',
        'No more searching for a different fundi for each job.',
    ],
    [
        'Skilled technicians',
        'A trained SOMFIX team, checked by our lead technician.',
    ],
    ['Clear prices', 'You agree the price before work starts. No surprises.'],
    ['Across Mogadishu', 'Based at KM4, working 6 days a week.'],
];
const steps = [
    [
        'Contact us',
        'Call or WhatsApp 0617963640. Tell us the problem and where you are.',
    ],
    [
        'Send a photo',
        'A photo helps us understand the job and give you a price faster, often without a visit.',
    ],
    [
        'Agree the price',
        'We send a clear price. For jobs with materials, we ask for 50% in advance so we can buy what’s needed.',
    ],
    [
        'We fix it',
        'A SOMFIX technician comes at the agreed time and does the job properly.',
    ],
    [
        'Pay and check',
        'Pay the rest when the job is done, by mobile money or cash. Our lead technician checks the work.',
    ],
    [
        'We follow up',
        'We call you the next day to make sure everything is working.',
    ],
];
const faqs = [
    [
        'How do I book a repair?',
        'Call or WhatsApp 0617963640. Send a photo of the problem and we’ll give you a price and a time.',
    ],
    [
        'How much will it cost?',
        'It depends on the job and materials. You get a clear price before any work starts. See our Services page for starting prices.',
    ],
    [
        'Do I have to pay in advance?',
        'For jobs that need materials over $10, we ask for 50% in advance. You pay the rest when the job is finished.',
    ],
    ['How can I pay?', 'By mobile money or cash.'],
    [
        'Which areas do you cover?',
        'We are based at Via Taleex, KM4 and work across Mogadishu.',
    ],
    [
        'How fast can you come?',
        'We answer every message the same day and send a price within about an hour during working hours. Visit times depend on the job and the day.',
    ],
    [
        'What days do you work?',
        'Six days a week. Contact us for current working days and hours.',
    ],
    [
        'Do you work for offices and NGOs?',
        'Yes. We offer maintenance plans with scheduled visits and monthly invoices.',
    ],
    [
        'I live abroad. Can you look after my property?',
        'Yes. Our property management service checks your property, handles repairs and keeps you updated with photos.',
    ],
    [
        'What if the problem comes back?',
        'Contact us. We call every customer the day after a job, and we will come back to check our work.',
    ],
];
const metadata: Record<string, [string, string, string]> = {
    home: [
        'One call. We fix it.',
        'SOMFIX | Home Repair & Maintenance in Mogadishu',
        'One call fixes it. Doors, windows, plumbing, mosquito screens, glass, kitchens and more across Mogadishu. Call or WhatsApp 0617963640.',
    ],
    services: [
        'Our services',
        'Repair Services in Mogadishu | SOMFIX',
        'Door, window, plumbing, mosquito screen, glass, wardrobe, kitchen, cleaning and renovation services in Mogadishu. Get a price on WhatsApp: 0617963640.',
    ],
    'property-management': [
        'Your property, looked after.',
        'Property Management in Mogadishu | SOMFIX',
        'SOMFIX looks after your property for one monthly fee: inspections, repairs, cleaning between tenants and fast response. Call 0617963640.',
    ],
    'maintenance-plans': [
        'Fix problems before they start.',
        'Home & Office Maintenance Plans | SOMFIX Mogadishu',
        'Regular maintenance for homes, offices and NGOs in Mogadishu. Fixed monthly fee, scheduled checks and priority repairs. Call 0617963640.',
    ],
    'how-it-works': [
        'Simple from start to finish',
        'How SOMFIX Works | Photo Quote to Finished Job',
        'Send a photo on WhatsApp, get a clear price, and our technician fixes it. Simple repair service in Mogadishu.',
    ],
    about: [
        'About SOMFIX',
        'About SOMFIX | Home Repair Team in Mogadishu',
        'SOMFIX is a Mogadishu home repair and maintenance company. One call, one trusted team for every repair.',
    ],
    faq: [
        'Questions and answers',
        'Frequently Asked Questions | SOMFIX',
        'Answers about SOMFIX prices, payments, areas we cover, response time and property management.',
    ],
    contact: [
        'Get in touch',
        'Contact SOMFIX | Call or WhatsApp 0617963640',
        'Call or WhatsApp SOMFIX on 0617963640. Via Taleex, KM4, Mogadishu. Send a photo of the problem and get a price fast.',
    ],
};
function Actions({ label = 'WhatsApp us: 0617963640' }: { label?: string }) {
    return (
        <div className="repair-actions">
            <a className="repair-button" href={whatsapp}>
                <MessageCircle size={18} />
                {label}
            </a>
            <a className="repair-button repair-outline" href={phone}>
                <Phone size={17} />
                Call now
            </a>
        </div>
    );
}
function Cards({ items }: { items: string[][] }) {
    return (
        <div className="repair-grid">
            {items.map(([title, description]) => (
                <article className="repair-card" key={title}>
                    <Check size={20} />
                    <h3>{title}</h3>
                    <p>{description}</p>
                </article>
            ))}
        </div>
    );
}
function ServiceCards({ home = false }: { home?: boolean }) {
    const items = home ? services.filter((_, i) => i < 7 || i === 9) : services;
    return (
        <div className="repair-grid">
            {items.map(([title, somali, price, description], i) => (
                <article className="repair-card" key={title}>
                    <div className="repair-card-top">
                        <span className="repair-number">
                            {String(i + 1).padStart(2, '0')}
                        </span>
                        {!home && <span className="repair-price">{price}</span>}
                    </div>
                    <h3>{title}</h3>
                    {!home && somali && <small>{somali}</small>}
                    <p>{description}</p>
                    <a
                        href={`${whatsapp}${encodeURIComponent(title)}`}
                        className="repair-text-link"
                    >
                        Ask for a quote <ArrowRight size={16} />
                    </a>
                </article>
            ))}
        </div>
    );
}
function ContactForm() {
    const form = useForm<{
        name: string;
        phone: string;
        area: string;
        service: string;
        message: string;
        photo: File | null;
        website: string;
    }>({
        name: '',
        phone: '',
        area: '',
        service: 'Not sure',
        message: '',
        photo: null,
        website: '',
    });
    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post('/repair-requests', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };
    return (
        <form className="repair-form" onSubmit={submit}>
            <h2>Tell us what needs fixing</h2>
            {form.wasSuccessful && (
                <p className="repair-success" role="status">
                    Thank you! We received your request and will contact you
                    today.
                </p>
            )}
            {(['name', 'phone', 'area'] as const).map((field) => (
                <label key={field} htmlFor={`request-${field}`}>
                    {field === 'name'
                        ? 'Your name'
                        : field === 'phone'
                          ? 'Phone or WhatsApp'
                          : 'Area in Mogadishu'}
                    <input
                        id={`request-${field}`}
                        required={field !== 'area'}
                        type={field === 'phone' ? 'tel' : 'text'}
                        maxLength={field === 'phone' ? 40 : 120}
                        value={form.data[field]}
                        onChange={(e) => form.setData(field, e.target.value)}
                        aria-invalid={!!form.errors[field]}
                    />
                    {form.errors[field] && (
                        <span role="alert">{form.errors[field]}</span>
                    )}
                </label>
            ))}
            <label htmlFor="request-service">
                Service needed
                <select
                    id="request-service"
                    value={form.data.service}
                    onChange={(e) => form.setData('service', e.target.value)}
                >
                    {[
                        ...services.map((s) => s[0]),
                        'Property management',
                        'Not sure',
                    ].map((s) => (
                        <option key={s}>{s}</option>
                    ))}
                </select>
                {form.errors.service && (
                    <span role="alert">{form.errors.service}</span>
                )}
            </label>
            <label htmlFor="request-message">
                Describe the problem
                <textarea
                    id="request-message"
                    rows={4}
                    maxLength={3000}
                    value={form.data.message}
                    onChange={(e) => form.setData('message', e.target.value)}
                />
                {form.errors.message && (
                    <span role="alert">{form.errors.message}</span>
                )}
            </label>
            <label htmlFor="request-photo">
                Photo (optional, JPG, PNG or WebP, up to 5 MB)
                <input
                    id="request-photo"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    key={form.wasSuccessful ? 'sent' : 'new'}
                    onChange={(e) =>
                        form.setData('photo', e.target.files?.[0] ?? null)
                    }
                />
                {form.errors.photo && (
                    <span role="alert">{form.errors.photo}</span>
                )}
            </label>
            <div hidden>
                <label htmlFor="request-website">
                    Website
                    <input
                        id="request-website"
                        tabIndex={-1}
                        autoComplete="off"
                        value={form.data.website}
                        onChange={(e) =>
                            form.setData('website', e.target.value)
                        }
                    />
                </label>
            </div>
            <button
                className="repair-button"
                disabled={form.processing}
                type="submit"
            >
                {form.processing ? 'Sending…' : 'Send request'}
                <ArrowRight size={18} />
            </button>
            {form.progress && <p>Uploading: {form.progress.percentage}%</p>}
        </form>
    );
}
export default function Welcome({
    publicPage = 'home',
}: {
    publicPage?: string;
}) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [heading, title, description] = metadata[publicPage] ?? metadata.home;
    const home = publicPage === 'home';
    return (
        <>
            <Head title={title}>
                <meta name="description" content={description} />
            </Head>
            <div className="repair-site">
                <a className="repair-skip" href="#main">
                    Skip to content
                </a>
                <header className="repair-header">
                    <div className="repair-container repair-nav">
                        <Link href="/" aria-label="SOMFIX home">
                            <BrandLogo
                                variant="light"
                                aria-label="SOMFIX home repair and maintenance"
                                className="repair-logo"
                            />
                        </Link>
                        <button
                            className="repair-menu"
                            aria-label={
                                menuOpen
                                    ? 'Close navigation'
                                    : 'Open navigation'
                            }
                            aria-expanded={menuOpen}
                            aria-controls="repair-navigation"
                            onClick={() => setMenuOpen(!menuOpen)}
                        >
                            {menuOpen ? <X /> : <Menu />}
                        </button>
                        <nav
                            id="repair-navigation"
                            className={menuOpen ? 'is-open' : ''}
                            aria-label="Main navigation"
                        >
                            {navigation.map(([label, href]) => (
                                <Link
                                    key={href}
                                    href={href}
                                    aria-current={
                                        (home ? '/' : `/${publicPage}`) === href
                                            ? 'page'
                                            : undefined
                                    }
                                    onClick={() => setMenuOpen(false)}
                                >
                                    {label}
                                </Link>
                            ))}
                        </nav>
                        <Link className="repair-header-cta" href="/login">
                            Get Started
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                </header>
                <main id="main">
                    <section
                        className={`repair-container repair-hero ${home ? '' : 'repair-page-hero'}`}
                    >
                        <div>
                            <span className="repair-eyebrow">
                                <Wrench size={16} /> HOME REPAIR & MAINTENANCE ·
                                MOGADISHU
                            </span>
                            <h1>{heading}</h1>
                            {home && (
                                <h2 className="repair-somali">
                                    Hal wicitaan ciladada ku xali
                                </h2>
                            )}
                            {publicPage === 'property-management' && (
                                <h2 className="repair-somali">
                                    Maamulka guryaha
                                </h2>
                            )}
                            <p>
                                {home
                                    ? 'Doors, windows, plumbing, mosquito screens, broken glass, kitchens and more. One trusted SOMFIX team for every repair in your home, office or property in Mogadishu.'
                                    : publicPage === 'services'
                                      ? 'One team for every repair. Tell us the problem, send a photo, and we’ll give you a clear price before we start.'
                                      : publicPage === 'property-management'
                                        ? 'For one monthly fee, SOMFIX takes care of repairs and upkeep at your apartment, house or building. You get one number to call and a team that keeps everything working.'
                                        : publicPage === 'maintenance-plans'
                                          ? 'A SOMFIX maintenance plan gives your home or office regular checks and priority repairs for a fixed monthly fee.'
                                          : publicPage === 'how-it-works'
                                            ? 'No guessing, no surprises. Here’s what happens when you contact SOMFIX.'
                                            : publicPage === 'about'
                                              ? 'We started SOMFIX because getting something fixed in Mogadishu meant calling many different people, waiting, and hoping the job was done right. We wanted one call to be enough.'
                                              : publicPage === 'contact'
                                                ? 'The fastest way: send a photo of the problem on WhatsApp.'
                                                : 'Everything you need to know before you book.'}
                            </p>
                            {publicPage !== 'faq' && <Actions />}
                            {home && (
                                <small>
                                    Send a photo of the problem on WhatsApp and
                                    get a price fast.
                                </small>
                            )}
                        </div>
                        {home && (
                            <div className="repair-hero-image">
                                <img
                                    src="/images/landing/technician.jpg"
                                    alt="Technician working on a repair"
                                    fetchPriority="high"
                                />
                                <div className="repair-image-caption">
                                    <span>
                                        <Check />
                                        Clear price. Skilled team.
                                    </span>
                                    <strong>
                                        Good repairs start with one call.
                                    </strong>
                                    <span>
                                        Via Taleex, KM4 · Across Mogadishu
                                    </span>
                                </div>
                            </div>
                        )}
                    </section>
                    {home && (
                        <>
                            <section className="repair-trust">
                                <div className="repair-container">
                                    <Cards items={trust} />
                                </div>
                            </section>
                            <section className="repair-container repair-section">
                                <span className="repair-eyebrow">
                                    OUR SERVICES
                                </span>
                                <h2>What we fix</h2>
                                <p className="repair-intro">
                                    From a door that won’t close to a full
                                    renovation. Pick a service or just tell us
                                    the problem.
                                </p>
                                <ServiceCards home />
                                <Link
                                    className="repair-text-link repair-section-link"
                                    href="/services"
                                >
                                    See all services <ArrowRight size={18} />
                                </Link>
                            </section>
                            <section className="repair-container repair-highlight">
                                <img
                                    src="/images/landing/property.jpg"
                                    alt="Residential property"
                                    loading="lazy"
                                />
                                <div>
                                    <span className="repair-eyebrow">
                                        PROPERTY MANAGEMENT
                                    </span>
                                    <h2>
                                        Own a property? Let us look after it.
                                    </h2>
                                    <p>
                                        SOMFIX manages repairs and upkeep for
                                        property owners for one monthly fee. We
                                        check the property, fix problems fast
                                        and keep tenants happy, so you don’t
                                        have to.
                                    </p>
                                    <Link
                                        className="repair-text-link"
                                        href="/property-management"
                                    >
                                        Learn about property management{' '}
                                        <ArrowRight size={18} />
                                    </Link>
                                </div>
                            </section>
                            <section className="repair-container repair-section">
                                <span className="repair-eyebrow">
                                    HOW IT WORKS
                                </span>
                                <h2>Fixed in 4 simple steps</h2>
                                <Cards
                                    items={[
                                        [
                                            '1. Send a photo',
                                            'WhatsApp us a photo of the problem.',
                                        ],
                                        [
                                            '2. Get a price',
                                            'We send a clear price quickly.',
                                        ],
                                        [
                                            '3. We fix it',
                                            'Our technician comes and does the job.',
                                        ],
                                        [
                                            '4. We check',
                                            'We call the next day to make sure all is well.',
                                        ],
                                    ]}
                                />
                                <Link
                                    className="repair-text-link repair-section-link"
                                    href="/how-it-works"
                                >
                                    See how it works <ArrowRight size={18} />
                                </Link>
                            </section>
                        </>
                    )}
                    {publicPage === 'services' && (
                        <section className="repair-container repair-section repair-content">
                            <ServiceCards />
                            <p className="repair-note">
                                Prices are a starting guide. The final price
                                depends on materials and the size of the job,
                                and you agree it before work starts. For jobs
                                with materials, we ask for 50% in advance.
                            </p>
                        </section>
                    )}
                    {publicPage === 'property-management' && (
                        <section className="repair-container repair-section repair-content">
                            <h2>What’s included</h2>
                            <Cards
                                items={[
                                    [
                                        'Regular checks',
                                        'We visit and check doors, windows, screens, plumbing and kitchens, and report back to you.',
                                    ],
                                    [
                                        'Fast repairs',
                                        'Tenants call us directly. We fix problems quickly so small issues don’t become big costs.',
                                    ],
                                    [
                                        'Between tenants',
                                        'Cleaning, repairs and a full check before the next tenant moves in.',
                                    ],
                                    [
                                        'Clear reports',
                                        'You know what was done, when, and what it cost. Photos of every job.',
                                    ],
                                    [
                                        'One point of contact',
                                        'No more chasing different technicians. One call to SOMFIX.',
                                    ],
                                    [
                                        'Bigger upgrades',
                                        'When you want to renovate, we plan and manage it for you.',
                                    ],
                                ]}
                            />
                            <h2 className="repair-subheading">Who it’s for</h2>
                            <ul className="repair-list">
                                <li>
                                    Owners living abroad who need someone they
                                    trust in Mogadishu
                                </li>
                                <li>
                                    Owners of apartments and buildings with
                                    several tenants
                                </li>
                                <li>
                                    Agents who manage properties for clients
                                </li>
                            </ul>
                            <p className="repair-note">
                                Tell us where your property is and how many
                                units it has. We’ll visit and give you a clear
                                offer. Repairs that need materials are agreed
                                with you first.
                            </p>
                        </section>
                    )}
                    {publicPage === 'maintenance-plans' && (
                        <section className="repair-container repair-section repair-content">
                            <Cards
                                items={[
                                    [
                                        'Home plan',
                                        'Regular check of doors, windows, mosquito screens and plumbing. Priority booking when something breaks. Contact us for a monthly price and visit schedule.',
                                    ],
                                    [
                                        'Office & NGO plan',
                                        'Scheduled maintenance visits, fast response, and monthly invoices for your records. Contact us for a monthly price and visit schedule.',
                                    ],
                                ]}
                            />
                            <h2 className="repair-subheading">
                                A little upkeep goes a long way
                            </h2>
                            <ul className="repair-list">
                                <li>Problems found early cost less to fix</li>
                                <li>
                                    Priority booking: plan customers are served
                                    first
                                </li>
                                <li>One fixed monthly cost, easy to budget</li>
                                <li>
                                    Invoices and job records for offices and
                                    NGOs
                                </li>
                            </ul>
                        </section>
                    )}
                    {publicPage === 'how-it-works' && (
                        <section className="repair-container repair-section repair-content">
                            <Cards
                                items={steps.map(([label, text], i) => [
                                    `${i + 1}. ${label}`,
                                    text,
                                ])}
                            />
                        </section>
                    )}
                    {publicPage === 'about' && (
                        <section className="repair-container repair-section repair-content">
                            <div className="repair-about">
                                <div>
                                    <h2>Our mission</h2>
                                    <p>
                                        Give homes, offices and property owners
                                        in Mogadishu one reliable team for every
                                        repair, with clear prices and work done
                                        right the first time.
                                    </p>
                                </div>
                                <div>
                                    <h2>Our team</h2>
                                    <p>
                                        SOMFIX is led by Jama Habane, with a
                                        team of skilled technicians and a
                                        customer service team that answers your
                                        calls and messages. Every job is checked
                                        by our lead technician.
                                    </p>
                                </div>
                            </div>
                            <h2 className="repair-subheading">Why SOMFIX</h2>
                            <Cards
                                items={[
                                    [
                                        'One call',
                                        'Every trade in one team: doors, windows, plumbing, glass, kitchens and more.',
                                    ],
                                    [
                                        'Clear prices',
                                        'Agreed before work starts. No hidden costs.',
                                    ],
                                    [
                                        'Done right',
                                        'Quality checked by our lead technician, and a follow-up call the next day.',
                                    ],
                                    [
                                        'Local',
                                        'Based at Via Taleex, KM4. We know Mogadishu.',
                                    ],
                                ]}
                            />
                        </section>
                    )}
                    {publicPage === 'faq' && (
                        <section className="repair-container repair-section repair-content repair-faq">
                            {faqs.map(([q, a]) => (
                                <details key={q}>
                                    <summary>{q}</summary>
                                    <p>{a}</p>
                                </details>
                            ))}
                        </section>
                    )}
                    {publicPage === 'contact' && (
                        <section className="repair-container repair-section repair-content repair-contact">
                            <div>
                                <h2>One number. Every repair.</h2>
                                <dl>
                                    <dt>Phone & WhatsApp</dt>
                                    <dd>
                                        <a href={phone}>0617963640</a>
                                    </dd>
                                    <dt>Address</dt>
                                    <dd>Via Taleex, KM4, Mogadishu</dd>
                                    <dt>Working days</dt>
                                    <dd>
                                        Six days a week. Call for current hours.
                                    </dd>
                                </dl>
                                <Actions />
                                <a
                                    className="repair-text-link repair-section-link"
                                    href="https://www.google.com/maps/search/?api=1&query=Via%20Taleex%20KM4%20Mogadishu"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Find our area on Google Maps{' '}
                                    <ArrowRight size={18} />
                                </a>
                                <p className="repair-note">
                                    For the fastest response, contact us
                                    directly on WhatsApp.
                                </p>
                            </div>
                            <ContactForm />
                        </section>
                    )}
                    <section className="repair-cta">
                        <div className="repair-container">
                            <span className="repair-eyebrow">
                                LET’S FIX IT TOGETHER
                            </span>
                            <h2>
                                {publicPage === 'property-management'
                                    ? 'Talk to us about your property'
                                    : publicPage === 'maintenance-plans'
                                      ? 'Ask for a maintenance plan'
                                      : publicPage === 'services'
                                        ? 'Not sure what you need?'
                                        : 'Something broken at home?'}
                            </h2>
                            <p>
                                Send us a photo now. We’ll tell you the price
                                and when we can come.
                            </p>
                            <Actions label="WhatsApp 0617963640" />
                        </div>
                    </section>
                </main>
                <footer className="repair-footer">
                    <div className="repair-container">
                        <div className="repair-footer-top">
                            <div>
                                <BrandLogo
                                    variant="light"
                                    aria-label="SOMFIX"
                                    className="repair-logo"
                                />
                                <p>
                                    Home repair & maintenance in Mogadishu.
                                    <br />
                                    Hal wicitaan ciladada ku xali.
                                </p>
                                <p>
                                    Via Taleex, KM4, Mogadishu ·{' '}
                                    <a href={phone}>0617963640</a>
                                </p>
                            </div>
                            <nav aria-label="Footer navigation">
                                {navigation.slice(1).map(([label, href]) => (
                                    <Link key={href} href={href}>
                                        {label}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                        <div className="repair-footer-bottom">
                            <span>© 2026 SOMFIX. All rights reserved.</span>
                            <Link href="/login">Staff sign in</Link>
                        </div>
                    </div>
                </footer>
                <a className="repair-floating" href={whatsapp}>
                    <MessageCircle size={22} />
                    <span>Chat with us</span>
                </a>
            </div>
        </>
    );
}
