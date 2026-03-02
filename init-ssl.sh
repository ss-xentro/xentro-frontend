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

# ── 1. Tear down any previous run ─────────────────────────────────────────────
echo "▶ Cleaning up any previous containers..."
docker compose down 2>/dev/null || true
docker stop xentro-nginx-init 2>/dev/null || true
docker rm xentro-nginx-init 2>/dev/null || true

# ── 2. Ensure shared volumes exist ───────────────────────────────────────────
echo "▶ Creating shared volumes..."
docker volume create xentro_certbot_www  >/dev/null 2>&1 || true
docker volume create xentro_certbot_certs >/dev/null 2>&1 || true

# ── 3. Start a standalone Nginx for the ACME challenge (port 80) ─────────────
echo "▶ Starting temporary Nginx (HTTP-only) for ACME challenge..."

# Remove the default nginx config so ours is the only one
docker run -d --rm \
  --name xentro-nginx-init \
  -p 80:80 \
  -v "$(pwd)/nginx/nginx-initial.conf:/etc/nginx/conf.d/default.conf:ro" \
  -v xentro_certbot_www:/var/www/certbot \
  nginx:1.27-alpine

# Give Nginx a moment to start
sleep 3

# Verify it's running
if ! docker ps --format '{{.Names}}' | grep -q xentro-nginx-init; then
  echo "❌ Temporary Nginx failed to start. Check 'docker logs xentro-nginx-init'."
  exit 1
fi
echo "  ✓ Nginx is listening on port 80"

# ── 4. Request the certificate via standalone Certbot container ───────────────
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

docker run --rm \
  -v xentro_certbot_www:/var/www/certbot \
  -v xentro_certbot_certs:/etc/letsencrypt \
  certbot/certbot:latest "${CERTBOT_ARGS[@]}"

# ── 5. Stop the temporary Nginx ──────────────────────────────────────────────
echo "▶ Stopping temporary Nginx..."
docker stop xentro-nginx-init 2>/dev/null || true

# ── 6. Start the full stack ──────────────────────────────────────────────────
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
