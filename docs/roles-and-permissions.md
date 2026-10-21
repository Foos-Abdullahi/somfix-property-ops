# Roles and permissions

Every user has one role. A role contains explicit permissions such as `properties.view` or `properties.manage`.

## Built-in roles

| Role          | Access                                                                                           |
| ------------- | ------------------------------------------------------------------------------------------------ |
| Standard User | Safe default for new accounts. Cannot sign in until an administrator assigns an authorized role. |
| Viewer        | Read-only access to every operational module.                                                    |
| Operator      | View and manage every operational module. Cannot manage users, roles, or audit logs.             |
| Administrator | Full operational and system access.                                                              |

Built-in roles are fixed so their meaning cannot change accidentally. Create a custom role when a person needs a narrower combination of permissions.

## Permission rules

- `module.view` allows list, detail, and print pages for that module.
- `module.manage` allows create, edit, delete, import, and other changes. A saved custom role automatically receives the matching `module.view` permission when `module.manage` is selected.
- `users.manage`, `roles.manage`, and `audit-log.view` control system administration separately.
- An inactive account has no access, regardless of its role.
- A Standard User account cannot sign in. Assign Viewer, Operator, or a suitable custom role before granting system access.
- The Administrator role is the only role with an automatic all-access override.

## Creating a normal user

Public self-registration is disabled. In **Settings → User Management → Add user**, leave **Standard User** selected to create a blocked account that cannot sign in. Assign Viewer for read-only access, Operator for operational CRUD access, or a custom role for a narrower permission set. The server checks permissions on every protected request; hidden menus and action buttons are an additional user-interface safeguard.

Viewer users can open permitted lists and detail pages, but create, edit, delete, import, conversion, and other mutation controls are hidden. If a Viewer manually requests a protected mutation URL, the server still returns the branded Access Denied page.
