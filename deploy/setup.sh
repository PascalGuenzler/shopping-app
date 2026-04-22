#!/bin/bash
# Shopping App - Server Setup Script
# Run as root on Ubuntu/Debian VPS

set -e

echo "=== Shopping App Deployment ==="
echo ""

# 1. Update system
echo "[1/7] System aktualisieren..."
apt-get update -qq
apt-get install -y nginx curl

# 2. Install Node.js 20
echo "[2/7] Node.js installieren..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi
echo "Node: $(node --version), npm: $(npm --version)"

# 3. Install PM2
echo "[3/7] PM2 installieren..."
npm install -g pm2 --quiet

# 4. Create app directory
echo "[4/7] App-Verzeichnis erstellen..."
mkdir -p /var/www/shopping-app/frontend
mkdir -p /opt/shopping-app/backend

# 5. Copy backend files
echo "[5/7] Backend einrichten..."
cp -r /tmp/shopping-upload/backend/* /opt/shopping-app/backend/
cp /tmp/shopping-upload/backend/.env.production /opt/shopping-app/backend/.env
cd /opt/shopping-app/backend
npm install --production --quiet

# 6. Copy frontend build
echo "[6/7] Frontend deployen..."
cp -r /tmp/shopping-upload/frontend/dist/* /var/www/shopping-app/frontend/

# 7. Configure Nginx
echo "[7/7] Nginx konfigurieren..."
cp /tmp/shopping-upload/nginx.conf /etc/nginx/sites-available/shopping-app
ln -sf /etc/nginx/sites-available/shopping-app /etc/nginx/sites-enabled/shopping-app
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

# 8. Start backend with PM2
echo "[8/8] Backend starten..."
pm2 stop shopping-backend 2>/dev/null || true
pm2 start /opt/shopping-app/backend/server.js --name shopping-backend
pm2 save
pm2 startup systemd -u root --hp /root | tail -1 | bash || true

echo ""
echo "=== Deployment abgeschlossen! ==="
echo "App erreichbar unter: http://85.215.215.250"
echo ""
pm2 status
