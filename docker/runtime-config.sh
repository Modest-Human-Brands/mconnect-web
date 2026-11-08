#!/bin/sh
set -eu

TARGET="${MCONNECT_CONFIG_PATH:-/usr/share/nginx/html/config.js}"

js_string() {
  printf '%s' "$1" | tr -d '\r\n' | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g' -e 's/</\\u003c/g'
}

cat > "$TARGET" <<EOF
window.__MCONNECT_CONFIG__ = {
  apiBaseUrl: "$(js_string "${VITE_MCONNECT_WEB_API_URL:-}")",
  siteUrl: "$(js_string "${VITE_MCONNECT_WEB_SITE_URL:-}")",
  organizationId: "$(js_string "${ORGANIZATION_ID:-}")",
  userId: "$(js_string "${VITE_MCONNECT_WEB_USER_ID:-}")",
  apiKey: "$(js_string "${VITE_MCONNECT_WEB_API_KEY:-}")",
}
EOF

echo "runtime-config: wrote $TARGET"
