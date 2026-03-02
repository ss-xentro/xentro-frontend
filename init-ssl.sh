#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# init-ssl.sh — Obtain a free Let's Encrypt SSL certificate for the first time
#
# Usage:
#   ./init-ssl.sh                          # uses DOMAIN and EMAIL from .env
#   DOMAIN=example.com EMAIL=you@mail.com ./init-ssl.sh
#   ./init-ssl.sh --staging                # use Let's Encrypt staging (for testing)
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ── Load .env if present ──────────────────────────────────────────────────────
if [ -f .env ]; then
  set -a
  # shellcheck source=/dev/null
  source .env
  set +a
fi

DOMAIN="${DOMAIN:?'DOMAIN is required. Set it in .env or pass as env var.'}"
EMAIL="${EMAIL:-}"
STAGING="${1:-}"

echo "============================================"
echo "  Let's Encrypt SSL Certificate Setup"
echo "============================================"
echo "  Domain : $DOMAIN"
echo "  Email  : ${EMAIL:-<none — will skip renewal notices>}"
echo "  Staging: ${STAGING:-no}"
echo "============================================"
echo ""

# ── 1. Start Nginx with HTTP-only config for ACME challenge ──────────────────
echo "▶ Starting Nginx with initial HTTP-only config..."

# Swap in the initial (no-SSL) nginx config
docker compose -f docker-compose.yml run --rm -d \
  --name xentro-nginx-init \
  -v "$(pwd)/nginx/nginx-initial.conf:/etc/nginx/templates/default.conf.template:ro" \
  -p 80:80 \
  nginx

# Give Nginx a moment to start
sleep 3

# ── 2. Request the certificate ────────────────────────────────────────────────
echo "▶ Requesting certificate from Let's Encrypt..."

CERTBOT_ARGS=(
  certonly
  --webroot
  -w /var/www/certbot
  -d "$DOMAIN"
  --agree-tos
  --no-eff-email
  --force-renewal
)

if [ -n "$EMAIL" ]; then
  CERTBOT_ARGS+=(--email "$EMAIL")
else
  CERTBOT_ARGS+=(--register-unsafely-without-email)
fi

if [ "$STAGING" = "--staging" ]; then
  CERTBOT_ARGS+=(--staging)
  echo "  ⚠ Using Let's Encrypt STAGING environment (certs won't be trusted)"
fi

docker compose run --rm certbot "${CERTBOT_ARGS[@]}"

# ── 3. Stop the temporary Nginx ──────────────────────────────────────────────
echo "▶ Stopping temporary Nginx..."
docker stop xentro-nginx-init 2>/dev/null || true
docker rm xentro-nginx-init 2>/dev/null || true

# ── 4. Start the full stack ──────────────────────────────────────────────────
echo "▶ Starting full stack (Next.js + Nginx with SSL + Certbot auto-renew)..."
docker compose up -d

echo ""
echo "============================================"
echo "  ✅ SSL certificate obtained successfully!"
echo ""
echo "  Your site is live at:"
echo "    https://$DOMAIN"
echo ""
echo "  Certbot will auto-renew every 12 hours."
echo "  To force a renewal:"
echo "    docker compose run --rm certbot renew --force-renewal"
echo "============================================"
