#!/usr/bin/env bash
set -Eeuo pipefail
umask 027

root=${1:?Deployment root required}
release_id=${2:?Release ID required}
php_bin=${3:?PHP binary required}
web_root=${4:?Domain document root required}
[[ "$root" =~ ^/home/[a-zA-Z0-9_-]+/[a-zA-Z0-9_/-]+$ ]]
[[ "$web_root" =~ ^/home/[a-zA-Z0-9_-]+/[a-zA-Z0-9_/-]+$ ]]
[[ "$release_id" =~ ^[a-f0-9]{40}-[0-9]+-[0-9]+$ ]]
[[ "$php_bin" =~ ^/[a-zA-Z0-9_./-]+$ ]]
"$php_bin" -r 'exit(PHP_VERSION_ID >= 80401 ? 0 : 1);'
command -v curl >/dev/null
command -v flock >/dev/null
exec 9>"$root/deploy.lock"
flock -n 9 || { echo 'Another deployment is active.' >&2; exit 1; }
test -f "$root/shared/.env" || { echo 'Configure shared/.env on the server first.' >&2; exit 1; }
grep -Eq '^APP_ENV=production\r?$' "$root/shared/.env"
grep -Eq '^APP_DEBUG=false\r?$' "$root/shared/.env"
grep -Eq '^APP_KEY=base64:.+' "$root/shared/.env"
test ! -e "$root/current" || test -L "$root/current"
[[ $(readlink -m "$web_root") == "$(readlink -m "$root/current/public")" ]] || {
  echo 'Domain document root must point to current/public before deployment.' >&2
  exit 1
}

release="$root/releases/$release_id"
test ! -e "$release"
mkdir -p "$release" "$root/shared/storage/app/public" "$root/shared/storage/app/private" \
  "$root/shared/storage/framework/cache/data" "$root/shared/storage/framework/sessions" \
  "$root/shared/storage/framework/views" "$root/shared/storage/logs"
tar -xzf "$root/incoming/$release_id.tar.gz" -C "$release"
ln -s "$root/shared/.env" "$release/.env"
ln -s "$root/shared/storage" "$release/storage"
ln -s "$root/shared/storage/app/public" "$release/public/storage"
chmod -R u+rwX,g+rX "$release/bootstrap/cache" "$root/shared/storage"
cd "$release"
"$php_bin" vendor/composer/platform_check.php
"$php_bin" artisan migrate --force
"$php_bin" artisan config:cache
"$php_bin" artisan route:cache
"$php_bin" artisan view:cache

previous=$(readlink "$root/current" || true)
ln -s "$release" "$root/current.next"
mv -Tf "$root/current.next" "$root/current"
if ! curl --fail --silent --show-error --retry 3 --retry-delay 3 --max-time 20 https://somfix.so/up >/dev/null; then
  if [[ -n "$previous" ]]; then
    ln -s "$previous" "$root/current.rollback"
    mv -Tf "$root/current.rollback" "$root/current"
    echo 'Health check failed; previous application release restored. Database migrations were not reversed.' >&2
  else
    rm "$root/current"
    echo 'First deployment health check failed; release deactivated.' >&2
  fi
  exit 1
fi
"$php_bin" artisan queue:restart
rm "$root/incoming/$release_id.tar.gz"
echo "Deployed $release_id"
