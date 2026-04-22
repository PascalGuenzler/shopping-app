#!/bin/bash
# Shopping App - One-Command Server Setup
# Usage: curl -fsSL https://raw.githubusercontent.com/PascalGuenzler/shopping-app/main/deploy/install.sh | bash

set -e

REPO="https://github.com/PascalGuenzler/shopping-app.git"
APP_DIR="/opt/shopping-app"

echo ""
echo "========================================="
echo "  Shopping App - Server Installation"
echo "========================================="
echo ""

# 1. System packages
echo "[1/5] Pakete installieren..."
apt-get update -qq
apt-get install -y git curl

# 2. Node.js 20
echo "[2/5] Node.js 20 installieren..."
if ! command -v node &>/dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi
echo "  Node: $(node --version) | npm: $(npm --version)"

# 3. PM2
echo "[3/5] PM2 installieren..."
npm install -g pm2 --quiet

# 4. Clone / update repo
echo "[4/5] Code herunterladen..."
if [ -d "$APP_DIR/.git" ]; then
    cd "$APP_DIR" && git pull
else
    rm -rf "$APP_DIR"
    git clone "$REPO" "$APP_DIR"
fi

# 5. Backend dependencies + env
echo "[5/5] Backend einrichten..."
cd "$APP_DIR/backend"
npm install --production --quiet

if [ ! -f "$APP_DIR/backend/.env" ]; then
    cp "$APP_DIR/backend/.env.production" "$APP_DIR/backend/.env"
    echo "  .env erstellt"
fi

# 6. Frontend build
echo "[6/6] Frontend bauen..."
cd "$APP_DIR/frontend"
npm install --legacy-peer-deps --quiet
npm run build --quiet

# 7. PM2 starten
echo "[7/7] App starten..."
pm2 stop shopping-app 2>/dev/null || true
pm2 delete shopping-app 2>/dev/null || true
cd "$APP_DIR/backend"
pm2 start server.js --name shopping-app
pm2 save
env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root | tail -1 | bash || true

echo ""
echo "========================================="
echo "  Installation abgeschlossen!"
echo "========================================="
echo ""
echo "  App erreichbar unter: http://85.215.215.250:8080"
echo ""
pm2 status

