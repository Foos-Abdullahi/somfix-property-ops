# SOMFIX Property & Maintenance Operations

Initial system foundation for SOMFIX: a Somali property-management and home-repair operations platform.

## Product direction

The platform combines property records with the SOMFIX repair workflow. A tenant or staff member reports a problem, the request is triaged, quoted, scheduled, assigned to a technician, completed, invoiced, paid, and retained in the property's maintenance history.

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

