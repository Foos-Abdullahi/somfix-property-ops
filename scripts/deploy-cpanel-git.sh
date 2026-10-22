#!/bin/bash

set -Eeuo pipefail

STATUS_FILE=/home/somfix/somfix-deploy-status.txt
trap 'code=$?; printf "failed at line %s (exit %s)\n" "$LINENO" "$code" > "$STATUS_FILE"; exit "$code"' ERR

printf 'started\n' > "$STATUS_FILE"

PUBLIC_PATH=/home/somfix/public_html
/usr/bin/test -d "$PUBLIC_PATH"
/usr/bin/test -f "$PUBLIC_PATH/index.php"

# This server keeps Laravel outside the public document root. Locate the active
# release from the absolute release path referenced by public_html/index.php.
APP_PATH=''
APP_CANDIDATES=''
APP_COUNT=0
ONLY_CANDIDATE=''
for candidate in /home/somfix/deploy-* /home/somfix/somfix-app; do
    if /usr/bin/test -f "$candidate/artisan" && /usr/bin/test -f "$candidate/.env"; then
        APP_CANDIDATES="${APP_CANDIDATES}${candidate}\n"
        APP_COUNT=$((APP_COUNT + 1))
        ONLY_CANDIDATE="$candidate"
        if /bin/grep -Fq "$candidate/" "$PUBLIC_PATH/index.php" || \
            /bin/grep -Fq "$(/usr/bin/basename "$candidate")/" "$PUBLIC_PATH/index.php"; then
            APP_PATH="$candidate"
            break
        fi
    fi
done

if /usr/bin/test -z "$APP_PATH" && /usr/bin/test "$APP_COUNT" -eq 1; then
    APP_PATH="$ONLY_CANDIDATE"
fi

if /usr/bin/test -z "$APP_PATH"; then
    printf 'could not identify active app from public_html/index.php\ncandidates:\n%b' "$APP_CANDIDATES" > "$STATUS_FILE"
    exit 1
fi

/usr/bin/test -f "$APP_PATH/artisan"
/usr/bin/test -f "$APP_PATH/.env"

PHP_BIN=''
for candidate in \
    /opt/alt/php84/usr/bin/php \
    /opt/cpanel/ea-php84/root/usr/bin/php \
    /usr/local/bin/php \
    /usr/bin/php
do
    if /usr/bin/test -x "$candidate"; then
        PHP_BIN="$candidate"
        break
    fi
done
/usr/bin/test -n "$PHP_BIN"

# Run database changes before the new application code is copied.
/bin/cp -a database/. "$APP_PATH/database/"
"$PHP_BIN" "$APP_PATH/artisan" migrate --force

# Preserve production-only .env, storage, uploads, and vendor dependencies.
/bin/cp -a app/. "$APP_PATH/app/"
/bin/cp -a bootstrap/. "$APP_PATH/bootstrap/"
/bin/cp -a config/. "$APP_PATH/config/"
/bin/cp -a public/. "$APP_PATH/public/"
/bin/cp -a resources/. "$APP_PATH/resources/"
/bin/cp -a routes/. "$APP_PATH/routes/"
/bin/cp artisan composer.json composer.lock "$APP_PATH/"

# Publish browser assets without replacing the production bootstrap index.php,
# which intentionally points at the private application directory above.
/bin/mkdir -p "$PUBLIC_PATH/build" "$PUBLIC_PATH/images"
/bin/cp -a public/build/. "$PUBLIC_PATH/build/"
/bin/cp -a public/images/. "$PUBLIC_PATH/images/"
for asset in apple-touch-icon.png favicon-32x32.png favicon.ico favicon.svg icon-192.png icon-512.png robots.txt site.webmanifest; do
    if /usr/bin/test -f "public/$asset"; then
        /bin/cp -a "public/$asset" "$PUBLIC_PATH/$asset"
    fi
done

"$PHP_BIN" "$APP_PATH/artisan" optimize:clear
"$PHP_BIN" "$APP_PATH/artisan" config:cache
"$PHP_BIN" "$APP_PATH/artisan" route:cache
"$PHP_BIN" "$APP_PATH/artisan" view:cache

printf 'success: %s\napp: %s\npublic: %s\n' "$(/usr/bin/date -u +%Y-%m-%dT%H:%M:%SZ)" "$APP_PATH" "$PUBLIC_PATH" > "$STATUS_FILE"
