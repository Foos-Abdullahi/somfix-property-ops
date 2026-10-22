#!/bin/bash

set -Eeuo pipefail

STATUS_FILE=/home/somfix/somfix-deploy-status.txt
trap 'code=$?; printf "failed at line %s (exit %s)\n" "$LINENO" "$code" > "$STATUS_FILE"; exit "$code"' ERR

printf 'started\n' > "$STATUS_FILE"

PUBLIC_PATH="$(/usr/bin/readlink -f /home/somfix/public_html)"
case "$PUBLIC_PATH" in
    /home/somfix/deploy-*/public) ;;
    *)
        printf 'unexpected public path: %s\n' "$PUBLIC_PATH" > "$STATUS_FILE"
        exit 1
        ;;
esac

APP_PATH="${PUBLIC_PATH%/public}"
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

"$PHP_BIN" "$APP_PATH/artisan" optimize:clear
"$PHP_BIN" "$APP_PATH/artisan" config:cache
"$PHP_BIN" "$APP_PATH/artisan" route:cache
"$PHP_BIN" "$APP_PATH/artisan" view:cache

printf 'success: %s\n' "$(/usr/bin/date -u +%Y-%m-%dT%H:%M:%SZ)" > "$STATUS_FILE"
