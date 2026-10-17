#!/bin/sh
set -eu

TARGET="${MCONNECT_CONFIG_PATH:-/usr/share/nginx/html/config.js}"

js_string() {
  printf '%s' "$1" | tr -d '\r\n' | sed -e 's/\/\\/g' -e 's/"/\\"/g' -e 's/</\u003c/g'
}

cat > "$TARGET" <<EOT
window.__MCONNECT_CONFIG__ = {
  apiBaseUrl: "$(js_string "${VITE_MCONNECT_API_URL:-}")",
  siteUrl: "$(js_string "${VITE_PUBLIC_SITE_URL:-}")",
  organizationId: "$(js_string "${VITE_DEFAULT_ORGANIZATION_ID:-}")",
  userId: "$(js_string "${VITE_MCONNECT_USER_ID:-}")",
}
EOT

echo "runtime-config: wrote $TARGET"
