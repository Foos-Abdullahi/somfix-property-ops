import { Link } from '@inertiajs/react';
import {
    BarChart3,
    Building2,
    ClipboardList,
    DoorOpen,
    FileText,
    HardHat,
    LayoutDashboard,
    Package,
    Settings,
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
import { index as serviceTeamIndex } from '@/routes/service-team';
import { index as settingsIndex } from '@/routes/settings';
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
];

const businessNavItems: NavItem[] = [
    {
        title: 'Inventory',
        href: inventoryIndex(),
        icon: Package,
    },
    {
        title: 'Finance',
        href: financeIndex(),
        icon: Wallet,
    },
    {
        title: 'Reports',
        href: reportsIndex(),
        icon: BarChart3,
    },
];

const systemNavItems: NavItem[] = [
    {
        title: 'Settings',
        href: settingsIndex(),
        icon: Settings,
    },
];

export function AppSidebar() {
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
                <NavMain label="Property Management" items={propertyNavItems} />
                <NavMain label="Operations" items={operationsNavItems} />
                <NavMain label="Business" items={businessNavItems} />
                <NavMain label="System" items={systemNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
