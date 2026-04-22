#!/bin/bash
# Shopping App - One-Command Server Setup
# Usage: curl -fsSL https://raw.githubusercontent.com/PascalGuenzler/shopping-app/main/deploy/install.sh | bash

set -e

REPO="https://github.com/PascalGuenzler/shopping-app.git"
APP_DIR="/opt/shopping-app"
WEB_DIR="/var/www/shopping-app"

echo ""
echo "========================================="
echo "  Shopping App - Server Installation"
echo "========================================="
echo ""

# 1. System packages
echo "[1/7] Pakete installieren..."
apt-get update -qq
apt-get install -y nginx git curl unzip

# 2. Node.js 20
echo "[2/7] Node.js 20 installieren..."
if ! command -v node &>/dev/null || [[ $(node -e "process.exit(process.version.split('.')[0].replace('v','') < 18 ? 1 : 0)" 2>/dev/null; echo $?) == "1" ]]; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi
echo "  Node: $(node --version) | npm: $(npm --version)"

# 3. PM2
echo "[3/7] PM2 installieren..."
npm install -g pm2 --quiet

# 4. Clone / update repo
echo "[4/7] Code herunterladen..."
if [ -d "$APP_DIR/.git" ]; then
    cd "$APP_DIR" && git pull
else
    rm -rf "$APP_DIR"
    git clone "$REPO" "$APP_DIR"
fi

# 5. Backend dependencies + env
echo "[5/7] Backend einrichten..."
cd "$APP_DIR/backend"
npm install --production --quiet

# Create .env if it doesn't exist
if [ ! -f "$APP_DIR/backend/.env" ]; then
    cp "$APP_DIR/backend/.env.production" "$APP_DIR/backend/.env"
    echo "  .env aus .env.production erstellt"
fi

# 6. Frontend build
echo "[6/7] Frontend bauen..."
cd "$APP_DIR/frontend"
npm install --quiet
npm run build --quiet

# Copy dist to webroot
mkdir -p "$WEB_DIR"
cp -r "$APP_DIR/frontend/dist/." "$WEB_DIR/"

# 7. Nginx
echo "[7/7] Nginx konfigurieren..."
cp "$APP_DIR/nginx.conf" /etc/nginx/sites-available/shopping-app
ln -sf /etc/nginx/sites-available/shopping-app /etc/nginx/sites-enabled/shopping-app
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable nginx
systemctl restart nginx

# 8. PM2 Backend
echo "[8/8] Backend starten..."
pm2 stop shopping-backend 2>/dev/null || true
pm2 delete shopping-backend 2>/dev/null || true
cd "$APP_DIR/backend"
pm2 start server.js --name shopping-backend
pm2 save
# Auto-start on reboot
env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root | tail -1 | bash || true

echo ""
echo "========================================="
echo "  Installation abgeschlossen!"
echo "========================================="
echo ""
echo "  App erreichbar unter: http://85.215.215.250"
echo ""
pm2 status
