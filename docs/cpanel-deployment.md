# Deploy SOMFIX from GitHub to cPanel

The manual `Deploy to cPanel` GitHub Actions workflow deploys `main` to
https://somfix.so. Merge these files into `main` first, then use Actions → Deploy
to cPanel → Run workflow. The current local branch is `development`.

## Hosting setup (once)

1. Confirm the hosting plan supports SSH shell access, `bash`, `tar`, `flock`,
   `curl`, symbolic links, and PHP 8.4.1 or newer. The cPanel team login
   `developer@somfix.so` is not necessarily an SSH username. Ask the host for the
   SSH username, hostname, port, and verified host-key fingerprint.
2. Set the website PHP version to 8.4. Enable Laravel's required extensions,
   including mbstring, fileinfo, DOM/XML, curl, PDO and your database driver.
   Verify `/opt/alt/php84/usr/bin/php` is the correct CLI path.
3. Create `/home/somfix/somfix-property-ops/shared/.env` privately on the server.
   Start from `.env.example`, set `APP_ENV=production`, `APP_DEBUG=false`,
   `APP_URL=https://somfix.so`, `LOG_LEVEL=warning`, `SESSION_SECURE_COOKIE=true`,
   and a new `APP_KEY`. Do not upload your local `.env` or local database.
   Use the production database credentials. For SQLite, create a new empty file
   at `/home/somfix/somfix-property-ops/shared/database.sqlite` and set
   `DB_DATABASE` to that absolute path. Keep `.env` and this database mode 600.
4. Configure production email delivery. Until a queue worker or cPanel cron is
   configured, use `QUEUE_CONNECTION=sync`. Never seed local/demo records into
   the production database.
5. Point the domain document root to
   `/home/somfix/somfix-property-ops/current/public`. If the primary domain root
   cannot be edited in cPanel, have the host configure it or replace the empty
   `public_html` directory with a symlink to that path **after backing up and
   inspecting its contents**. Do not expose the application root on the web.
6. Authorize a dedicated deployment public key in cPanel SSH Access. Keep its
   private key in GitHub's `production` environment secrets. Do not reuse the
   cPanel login password or commit keys to Git.

## GitHub production environment

Create Settings → Environments → `production`, and restrict deployment to `main`.

| Environment secret | Value |
| --- | --- |
| `CPANEL_SSH_HOST` | Verified SSH hostname (confirm whether `somfix.so` is valid) |
| `CPANEL_SSH_USER` | Hosting account SSH username |
| `CPANEL_SSH_PRIVATE_KEY` | Dedicated SSH private key |
| `CPANEL_SSH_KNOWN_HOSTS` | Verified server known_hosts line; nonstandard ports use `[host]:port` |

| Optional environment variable | Default |
| --- | --- |
| `CPANEL_SSH_PORT` | `22` |
| `CPANEL_DEPLOY_ROOT` | `/home/somfix/somfix-property-ops` |
| `CPANEL_PHP_BIN` | `/opt/alt/php84/usr/bin/php` |
| `CPANEL_WEB_ROOT` | `/home/somfix/public_html` (must resolve to `current/public`) |

The workflow verifies SSH host keys; obtain and verify the fingerprint through
the hosting provider before saving the known_hosts entry.
If the host changes the domain document root directly rather than linking
`public_html`, set `CPANEL_WEB_ROOT` to the new `current/public` path.

## First deployment and ongoing operation

The workflow runs PHP tests, TypeScript checks, the frontend build, then packages
production dependencies. Each release has its own code and compiled caches;
`.env`, uploaded documents, and database data persist in `shared`. It applies
migrations, switches the `current` symlink, and checks `/up`. A failed health
check restores the previous code release; it does not reverse migrations.
Use backward-compatible migrations and take a database backup before deploying
schema changes. Failed first deployments deactivate the release.

After the first successful deployment, set a unique `ADMIN_EMAIL` and
`ADMIN_PASSWORD` of at least 12 characters in the server environment, then run
the production admin seeder through SSH from `current`, or set these before the
first deployment and select **seed_admin** when running the GitHub workflow:

```bash
/opt/alt/php84/usr/bin/php artisan config:clear
/opt/alt/php84/usr/bin/php artisan db:seed --class=ProductionAdminSeeder --force
/opt/alt/php84/usr/bin/php artisan config:cache
```

The production seeder preserves an existing active administrator and its
password. It refuses to promote an existing non-administrator or reactivate an
inactive account. The original `AdminUserSeeder` can still explicitly reset an
administrator's password, so use it only intentionally. No password is stored
in the repository or workflow. Verify login, dashboard, and document uploads
after launch. `/up` only confirms application boot; it is not a complete product
test. Retain older releases for rollback and remove them deliberately as the
account's 1 GB storage quota fills.
