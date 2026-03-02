# Xentro Frontend — Deployment Guide

## Prerequisites

- An **AWS EC2** instance (Debian/Ubuntu) with Docker & Docker Compose installed
- A domain purchased on **GoDaddy** (e.g. `xentro.in`)
- Ports **80** and **443** open in your EC2 Security Group

---

## Step 1 — Get Your EC2 Public IP

```bash
curl -s http://checkip.amazonaws.com
```

Note this IP (e.g. `3.110.45.67`).

---

## Step 2 — Point Your GoDaddy Domain to EC2

1. Log in to [GoDaddy](https://dcc.godaddy.com/) and open your domain (`xentro.in`).
2. Go to **DNS** → **DNS Records**.
3. Set up the following records:

### For `app.xentro.in` (subdomain)

| Type | Name  | Value            | TTL    |
|------|-------|------------------|--------|
| A    | app   | `<EC2_PUBLIC_IP>` | 600    |

### For bare domain `xentro.in` (if needed)

| Type | Name  | Value            | TTL    |
|------|-------|------------------|--------|
| A    | @     | `<EC2_PUBLIC_IP>` | 600    |

> Replace `<EC2_PUBLIC_IP>` with your actual EC2 IP address.

1. **Save** the records.
2. Wait for DNS propagation (usually 5–15 minutes, can take up to 48 hours).

### Verify DNS

```bash
# From your local machine or the EC2 instance
dig app.xentro.in +short
# Should return your EC2 IP
```

Or use <https://dnschecker.org> to check globally.

---

## Step 3 — Open Ports in AWS Security Group

In the **AWS Console** → **EC2** → **Security Groups** for your instance, ensure these **Inbound Rules** exist:

| Type   | Protocol | Port Range | Source    |
|--------|----------|-----------|-----------|
| HTTP   | TCP      | 80        | 0.0.0.0/0 |
| HTTPS  | TCP      | 443       | 0.0.0.0/0 |
| SSH    | TCP      | 22        | Your IP   |

---

## Step 4 — Clone & Configure on EC2

```bash
ssh admin@<EC2_PUBLIC_IP>

# Clone the repo (or pull latest)
git clone <your-repo-url> ~/xentro-frontend
cd ~/xentro-frontend
```

### Set up `.env`

```bash
cp .env.example .env   # if you have one, or create manually
nano .env
```

Make sure these are set:

```dotenv
DOMAIN="app.xentro.in"
EMAIL="your-email@example.com"        # optional, for Let's Encrypt renewal notices
NEXT_PUBLIC_API_URL="https://your-backend-api-url.com"
```

> **Important:** `DOMAIN` must exactly match the DNS record you created in GoDaddy.

---

## Step 5 — Run the SSL Setup Script

```bash
chmod +x init-ssl.sh

# (Optional) Test with staging certs first to avoid rate limits
./init-ssl.sh --staging

# If staging works, run for real
./init-ssl.sh
```

### What the script does

1. Tears down any previous containers
2. Starts a temporary Nginx on port 80 for the ACME challenge
3. Runs Certbot to obtain a free Let's Encrypt SSL certificate
4. Stops the temporary Nginx
5. Starts the full stack: **Next.js** + **Nginx (SSL + HSTS)** + **Certbot auto-renew**

### Expected output

```
============================================
  ✅ SSL certificate obtained successfully!

  Your site is live at:
    https://app.xentro.in

  Certbot will auto-renew every 12 hours.
============================================
```

---

## Step 6 — Verify

```bash
# Check all containers are running
docker compose ps

# Should show:
#   nextjs-app   running   3000/tcp
#   nginx        running   0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
#   certbot      running
```

Visit your site:

- **<https://app.xentro.in>** — should load with a valid SSL certificate
- **<http://app.xentro.in>** — should redirect to HTTPS automatically

### Verify HSTS header

```bash
curl -sI https://app.xentro.in | grep -i strict
# Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

---

## Maintenance

### View logs

```bash
docker compose logs -f              # all services
docker compose logs -f nginx        # nginx only
docker compose logs -f nextjs-app   # next.js only
```

### Rebuild after code changes

```bash
git pull
docker compose up -d --build
```

### Force certificate renewal

```bash
docker compose run --rm certbot renew --force-renewal
docker compose exec nginx nginx -s reload
```

### Full restart

```bash
docker compose down
docker compose up -d
```

---

## Troubleshooting

### Certbot 404 error during challenge

- Verify DNS is pointing to your EC2 IP: `dig app.xentro.in +short`
- Verify port 80 is open: `curl http://app.xentro.in`
- Check temp Nginx logs: `docker logs xentro-nginx-init`

### Nginx won't start (port already in use)

```bash
# Find what's using port 80
sudo lsof -i :80
# or
sudo ss -tlnp | grep :80

# Kill it or stop the service
sudo systemctl stop apache2   # if Apache is running
```

### Certificate rate limits

Let's Encrypt has a limit of **5 duplicate certificates per week**. Use `--staging` for testing:

```bash
./init-ssl.sh --staging
```

### Check certificate expiry

```bash
docker compose run --rm certbot certificates
```

---

## Architecture

```
Internet
   │
   ▼
┌──────────┐  port 80 (redirect)   ┌───────────┐
│  GoDaddy │ ────────────────────▶  │   Nginx   │
│   DNS    │  port 443 (HTTPS)      │  (Alpine)  │
└──────────┘                        └─────┬─────┘
                                          │ proxy_pass :3000
                                          ▼
                                    ┌───────────┐
                                    │  Next.js   │
                                    │ (standalone)│
                                    └───────────┘

┌───────────┐
│  Certbot  │  ← auto-renews SSL every 12h
└───────────┘
```
