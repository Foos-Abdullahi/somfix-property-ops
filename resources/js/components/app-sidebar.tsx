import { Link, usePage } from '@inertiajs/react';
import {
    Banknote,
    Briefcase,
    BarChart3,
    Coins,
    CreditCard,
    FileBarChart,
    HandCoins,
    Landmark,
    Scale,
    ShoppingBag,
    Building2,
    ClipboardList,
    DoorOpen,
    FileText,
    HardHat,
    LayoutDashboard,
    ListChecks,
    Package,
    Receipt,
    BriefcaseBusiness,
    Settings,
    ShieldCheck,
    Users,
    Wallet,
    Wrench,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as financeIndex } from '@/routes/finance';
import { index as inventoryIndex } from '@/routes/inventory';
import { index as leasesIndex } from '@/routes/leases';
import { index as maintenanceIndex } from '@/routes/maintenance';
import { index as propertiesIndex } from '@/routes/properties';
import { index as reportsIndex } from '@/routes/reports';
import { index as serviceListIndex } from '@/routes/service-list';
import { index as serviceTeamIndex } from '@/routes/service-team';
import { index as tenantsIndex } from '@/routes/tenants';
import { index as unitsIndex } from '@/routes/units';
import { index as workOrdersIndex } from '@/routes/work-orders';
import type { NavItem } from '@/types';

const overviewNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutDashboard,
    },
];

const propertyNavItems: NavItem[] = [
    {
        title: 'Properties',
        href: propertiesIndex(),
        icon: Building2,
    },
    {
        title: 'Units',
        href: unitsIndex(),
        icon: DoorOpen,
    },
    {
        title: 'Tenants',
        href: tenantsIndex(),
        icon: Users,
    },
    {
        title: 'Leases',
        href: leasesIndex(),
        icon: FileText,
    },
];

const operationsNavItems: NavItem[] = [
    {
        title: 'Website Requests',
        href: '/repair-requests',
        icon: ClipboardList,
    },
    {
        title: 'Maintenance',
        href: maintenanceIndex(),
        icon: Wrench,
    },
    {
        title: 'Work Orders',
        href: workOrdersIndex(),
        icon: ClipboardList,
    },
    {
        title: 'Vendors & Technicians',
        href: serviceTeamIndex(),
        icon: HardHat,
    },
    {
        title: 'Service List',
        href: serviceListIndex(),
        icon: ListChecks,
    },
];

const financeNavItems: NavItem[] = [
    { title: 'Overview', href: financeIndex(), icon: Wallet },
    { title: 'Job Profitability', href: '/finance/jobs', icon: Briefcase },
    { title: 'Invoices', href: '/finance/invoices', icon: Receipt },
    { title: 'Quotations', href: '/finance/quotations', icon: FileText },
    { title: 'Customer Payments', href: '/finance/payments', icon: HandCoins },
    { title: 'Expenses', href: '/finance/expenses', icon: CreditCard },
];

const payoutNavItems: NavItem[] = [
    { title: 'Technician Pay', href: '/finance/technicians', icon: HardHat },
    { title: 'Commissions', href: '/finance/commissions', icon: Coins },
    { title: 'Payroll', href: '/finance/payroll', icon: Banknote },
    { title: 'Rent Collections', href: '/finance/rent', icon: Building2 },
    { title: 'Property Owners', href: '/finance/owners', icon: Landmark },
    { title: 'Owner Expenses', href: '/finance/property-expenses', icon: ShoppingBag },
    { title: 'Owner Payouts', href: '/finance/owner-payouts', icon: Landmark },
];

const accountingNavItems: NavItem[] = [
    { title: 'Cash Ledger', href: '/finance/ledger', icon: Scale },
    { title: 'Profit & Loss', href: '/finance/reports', icon: FileBarChart },
    { title: 'Finance Settings', href: '/finance/settings', icon: Settings },
];

const salesNavItems: NavItem[] = [
    { title: 'Sales & Jobs', href: '/sales', icon: BriefcaseBusiness },
    { title: 'Leads', href: '/sales/leads', icon: ClipboardList },
    { title: 'Customers', href: '/sales/customers', icon: Users },
    { title: 'Jobs', href: '/sales/jobs', icon: HardHat },
];

const businessNavItems: NavItem[] = [
    { title: 'Demo Requests', href: '/demo-requests', icon: ClipboardList },
    {
        title: 'Inventory',
        href: inventoryIndex(),
        icon: Package,
    },
    {
        title: 'Reports',
        href: reportsIndex(),
        icon: BarChart3,
    },
];

const systemNavItems: NavItem[] = [
    {
        title: 'General Settings',
        href: '/settings-general',
        icon: Settings,
    },
    {
        title: 'User Management',
        href: '/settings/users',
        icon: Users,
    },
    {
        title: 'Roles & Permissions',
        href: '/settings/roles',
        icon: ShieldCheck,
    },
    {
        title: 'Audit Log',
        href: '/settings/audit-log',
        icon: ClipboardList,
    },
];

export function AppSidebar() {
    const { auth } = usePage<{ auth: { permissions: string[] } }>().props;
    const visible = (items: NavItem[]) =>
        items.filter((item) => {
            const href =
                typeof item.href === 'string' ? item.href : item.href.url;
            const path = href.split('?')[0];
            const settings: Record<string, string> = {
                '/repair-requests': 'maintenance.view',
                '/settings/users': 'users.manage',
                '/settings/roles': 'roles.manage',
                '/settings/audit-log': 'audit-log.view',
            };
            const topLevel = path.split('/')[1] || '';
            const permission =
                settings[path] ??
                (path.startsWith('/settings') || path === '/dashboard'
                    ? null
                    : topLevel + '.view');
            return !permission || auth.permissions.includes(permission);
        });
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain label="Overview" items={overviewNavItems} />
                <NavMain
                    label="Property Management"
                    items={visible(propertyNavItems)}
                />
                <NavMain
                    label="Operations"
                    items={visible(operationsNavItems)}
                />
                <NavMain label="Sales & Jobs" items={visible(salesNavItems)} />
                <NavMain label="Finance" items={visible(financeNavItems)} />
                <NavMain label="Payouts & Owners" items={visible(payoutNavItems)} />
                <NavMain label="Accounting" items={visible(accountingNavItems)} />
                <NavMain label="Business" items={visible(businessNavItems)} />
                <NavMain
                    label="System Settings"
                    items={visible(systemNavItems)}
                />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
