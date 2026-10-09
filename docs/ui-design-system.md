# SOMFIX Brand and UI Design System

## Brand direction

The supplied SOMFIX poster already establishes a recognizable direction: dark green, warm orange, white backgrounds, repair/service imagery and a practical Somali service identity. The application should refine that into a calmer professional operations product.

Brand attributes: trusted, practical, local, responsive and organized.

## Color palette

| Token      | Hex       | Use                                      |
| ---------- | --------- | ---------------------------------------- |
| Forest 900 | `#075B3E` | Main brand, sidebar, headings            |
| Forest 700 | `#087A50` | Primary buttons and links                |
| Forest 100 | `#E6F4EE` | Soft backgrounds and success states      |
| Orange 600 | `#F59A23` | Calls to action, accents, active markers |
| Orange 100 | `#FFF1D6` | Warning/attention surfaces               |
| Ink 900    | `#17211D` | Main text                                |
| Slate 600  | `#66736D` | Secondary text                           |
| Mist 100   | `#F6F8F7` | App background                           |
| White      | `#FFFFFF` | Cards and content surfaces               |
| Danger     | `#C94A45` | Errors, urgent overdue items             |
| Info       | `#2D6CDF` | Informational notices                    |

Use Forest as the primary UI color and Orange as a measured accent. Avoid turning every table row orange or green; status colors should remain semantic.

## Typography

- Primary: Inter or Plus Jakarta Sans.
- Somali/Arabic support: Noto Sans and Noto Sans Arabic fallback.
- Page title: 28–32px, 700 weight.
- Section title: 18–20px, 650 weight.
- Body: 14–16px.
- Table labels: 12–13px, medium weight.

## Layout direction

- Desktop: fixed 248px sidebar, 64px top bar, max content width 1440px.
- Mobile: bottom navigation or collapsible drawer for Tenant and Technician views.
- Use large dashboard cards, compact tables and right-side detail drawers.
- Prefer a property/unit detail page with tabs: Overview, Lease, Maintenance, Payments, Documents, Activity.

## Navigation

1. Dashboard
2. Properties
3. Units
4. Tenants
5. Leases
6. Maintenance
7. Work Orders
8. Vendors & Technicians
9. Inventory
10. Finance
11. Reports
12. Settings

## Core screens

### Dashboard

Top row: occupancy, open requests, scheduled jobs, unpaid invoices. Middle: maintenance pipeline and monthly cash movement. Bottom: urgent requests, expiring leases and low-stock items.

### Property detail

Hero summary with property photo, location, owner and occupancy. Unit grid below. Tabs hold maintenance history, lease records, documents, expenses and inspections.

### Maintenance board

Columns: New, Triaged, Awaiting Approval, Scheduled, In Progress, Completed, Closed. Filters: property, unit, priority, assignee, category and date.

### Job order detail

Show customer/property context, scope of work, schedule, assigned technician, checklist, materials, photos, cost/profit and invoice status. On mobile, make status update and photo upload the primary actions.

## Component rules

- Use cards with 12px radius and light borders, not heavy shadows.
- Use primary buttons only for the main action on a screen.
- Use status badges with text, not color alone.
- Tables need search, filters, column visibility and export.
- All destructive actions require confirmation and a reason.
- Empty states should explain the next action: “Add your first property” or “Create a maintenance request.”
