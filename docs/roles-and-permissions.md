# Roles and permissions

Every user has one role. A role contains explicit permissions such as `properties.view` or `properties.manage`.

## Built-in roles

| Role          | Access                                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------------------ |
| Standard User | Default for new accounts. Can sign in and use personal settings, but has no operational module access. |
| Viewer        | Read-only access to every operational module.                                                          |
| Operator      | View and manage every operational module. Cannot manage users, roles, or audit logs.                   |
| Administrator | Full operational and system access.                                                                    |

Built-in roles are fixed so their meaning cannot change accidentally. Create a custom role when a person needs a narrower combination of permissions.

## Permission rules

- `module.view` allows list, detail, and print pages for that module.
- `module.manage` allows create, edit, delete, import, and other changes. A saved custom role automatically receives the matching `module.view` permission when `module.manage` is selected.
- `users.manage`, `roles.manage`, and `audit-log.view` control system administration separately.
- An inactive account has no access, regardless of its role.
- The Administrator role is the only role with an automatic all-access override.

## Creating a normal user

In **Settings → User Management → Add user**, leave **Standard User** selected for a safe account with no operational access. Select Viewer, Operator, or a custom role only when that access is required. The server checks permissions on every protected request; hiding a menu item is only a user-interface convenience.
