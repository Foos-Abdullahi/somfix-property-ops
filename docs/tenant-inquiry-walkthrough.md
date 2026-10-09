# Landing request to property tenant

1. Sign in at https://somfix.so/login with your administrator account.
2. Open Business → Demo Requests (https://somfix.so/demo-requests). Both landing-page buttons submit to this inbox. Search by name, company, or email and filter by stage.
3. Open the request. Use Email to open your mail application, contact the person, and save the stage Contacted. Record your conversation and the next follow-up date in the request. Saving does not send an email.
4. Agree a walkthrough time. Enter Walkthrough time, select Walkthrough scheduled, and save. After the walkthrough, save Walkthrough completed and your outcome notes. These dates record the appointment; they do not create a calendar invitation.
5. If the person wants to rent, ensure the property exists in Properties (https://somfix.so/properties) and its unit exists in Units (https://somfix.so/units).
6. From the request choose Create a tenant first, or open Tenants (https://somfix.so/tenants). Enter the person's first and last name, phone, email, status, move-in date, and unit. The inquiry form does not collect phone details, so contact them before completing their tenant profile.
7. Return to the request, choose the created tenant in Link an existing tenant, select Linked to tenant, and Save follow-up. The request remains as a record of the original inquiry. Open linked tenant takes you to their profile. A tenant profile does not automatically create a system login.
8. Open Leases (https://somfix.so/leases) and create the lease for the tenant and unit. Enter start/end dates, rent, deposit, currency, payment due day, and status.
9. Use Finance (https://somfix.so/finance) to record rent/deposit invoices and payments against the tenant, unit, and property.
10. Continue property service through Maintenance and Work Orders. Vendors & Technicians identify the service team; Inventory tracks supplies; Reports provides operational summaries.
11. If the person does not proceed, select Closed and save the reason in notes. Closed inquiries remain available in the inbox.

Administrator accounts have inbox access. For other staff, Roles & Permissions controls View demo requests and Manage demo requests and follow-up. Linking tenants also requires Manage tenants. Only authorized staff can view or change requests.

Administrator CRUD: Add request creates an inquiry received outside the landing page. The eye action opens View; the pencil action opens Edit. Delete is available in View and moves a request to Deleted requests. Open Filter → Deleted requests to restore it. The inbox uses the shared AppLayout, stats cards, table, breadcrumbs, and page entrance animations.

Deployment verification: 10 inquiry feature tests passed (99 assertions), TypeScript check passed, and production assets built. The live migrations and administrator Create, View, Edit, Delete and Restore workflow were verified using a clearly labeled test record.

