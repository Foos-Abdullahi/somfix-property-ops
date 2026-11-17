# SOMFIX Property & Maintenance Operations

Initial system foundation for SOMFIX: a Somali property-management and home-repair operations platform.

## Run locally

Requirements: PHP 8.4.1 or newer (the locked development dependencies require it), Composer, and a Node.js version compatible with Vite 8 (22.12+). Laravel Herd can provide PHP, Composer, and Node.js on Windows.

For a fresh clone, run these commands in PowerShell:

```powershell
composer install
Copy-Item .env.example .env
New-Item database/database.sqlite -ItemType File
php artisan key:generate
php artisan migrate
npm.cmd ci
npm.cmd run build
```

Set `ADMIN_EMAIL` and a unique `ADMIN_PASSWORD` of at least 12 characters in `.env`, then create the administrator:

```powershell
php artisan db:seed
```

Rerunning the admin seeder updates the existing account's name and password from `.env`. After changing those settings, run `php artisan config:clear` followed by `php artisan db:seed --class=AdminUserSeeder`.

Keep `.env` private. Do not overwrite an existing `.env` or SQLite database when restarting the application. SQLite handles local data, sessions, cache, and queued jobs; no MySQL or Redis installation is needed for the default local configuration. Local email is written to `storage/logs/laravel.log`.

Start the application and open <http://localhost:8000>:

```powershell
composer run dev
```

This starts Laravel, the queue listener, and the frontend development server. Alternatively, after `npm.cmd run build`, run `php artisan serve` to use the built frontend. Stop terminal servers with Ctrl+C.

Verify the installation with `php artisan test` and `npm.cmd run types:check`.

## Access management

The configured administrator can manage accounts at `/settings/users`, roles at `/settings/roles`, and audit history at `/settings/audit-log`. Run migrations before using these pages. The access-management migration assigns the configured `ADMIN_EMAIL` the protected Administrator role and preserves existing staff access with the Operator role. The admin seeder also assigns the Administrator role.

Public self-registration is disabled. Administrators can create verified accounts, set passwords, assign roles, deactivate accounts, and delete non-administrator accounts. New accounts default to Standard User, which cannot sign in until an administrator assigns Viewer, Operator, or an appropriate custom role. Deactivation blocks login and invalidates existing sessions. Password updates invalidate sessions too. An administrator cannot deactivate themselves or change their own role; at least one active administrator must remain.

Permissions are enforced on backend routes. Viewer users receive read-only module access and mutation controls are hidden; direct unauthorized requests receive the branded Access Denied page. Manage permissions include view access. The administrator role cannot be edited or deleted, system roles cannot be deleted, and assigned custom roles must be reassigned before deletion. Delegated managers cannot grant permissions they do not hold.

Audit history starts when the migration is installed and records Eloquent record creation, updates, deletion, login, and logout. The log is read-only in the application, supports filters and pagination, and excludes passwords, remember tokens, and two-factor secrets. Direct database changes outside the application are not captured.

## Product direction

The platform combines property records with the SOMFIX repair workflow. A tenant or staff member reports a problem, the request is triaged, quoted, scheduled, assigned to a technician, completed, invoiced, paid, and retained in the property's maintenance history.

## Service list and request flow

The **Service List** (`/service-list`) is the single list of services SOMFIX offers (name, category, starting price, unit, duration, active/inactive). It is not linked to any customer, tenant or property. Records can be added by hand or imported from Excel (.xlsx) or CSV with the downloadable template.

How it connects to the rest of the system:

1. **Service List** – only *active* services appear in the "Service needed" dropdown on the public website and in the customer account portal. "Not sure" is always available.
2. **Website / customer request** – the customer picks a service; the request is saved under Website Requests.
3. **Convert to lead** – staff convert the request. This creates (or reuses) the **Customer** by phone and a **Lead** whose service is the chosen service and whose estimated value starts at the service's price.
4. **Lead → Job → Work order → Invoice → Payment** – the normal sales and finance workflow continues from the lead.

On staff lead forms the service is chosen from the Service List, and choosing it fills the estimated value when it is empty. Each service's detail page shows how many requests, leads and jobs use it. Renaming a service updates existing requests and leads; deactivating it hides it from new forms while keeping history.

## Recommended implementation

- Backend: Laravel 12, REST/API resources, queues and policies
- Frontend: Inertia.js + React + TypeScript
- UI: Tailwind CSS + shadcn/ui
- Database: PostgreSQL or MySQL
- Storage: S3-compatible object storage for property photos, contracts, receipts and inspection reports
- Jobs/notifications: Redis queues, email, SMS/WhatsApp provider when available

## First documents

- `docs/system-architecture.md` — architecture, modules, workflows and roles
- `docs/ui-design-system.md` — brand, color tokens, typography and screen direction
- `docs/database-schema.md` — core entities and relationships
- `docs/project-plan.md` — phased implementation plan
- `database/schema.sql` — starter relational schema for the MVP

## MVP boundary

Start with Properties, Units, Tenants, Leases, Maintenance Requests, Vendors/Technicians, Job Orders, Invoices, Payments, Documents and dashboard reporting. Add advanced payroll, inventory purchasing and tenant portal automation after the core workflow is stable.
