#!/bin/bash
# Shopping App - One-Command Server Setup

set -e

REPO="https://github.com/PascalGuenzler/shopping-app.git"
APP_DIR="/opt/shopping-app"

echo ""
echo "========================================="
echo "  Shopping App - Server Installation"
echo "========================================="
echo ""

# 1. System packages
echo "[1/6] Pakete installieren..."
apt-get update -qq
apt-get install -y git curl

# 2. Node.js 20
echo "[2/6] Node.js 20 installieren..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
echo "  Node: $(node --version) | npm: $(npm --version)"

# 3. PM2 - install and verify
echo "[3/6] PM2 installieren..."
npm install -g pm2
PM2_BIN=$(which pm2 || echo "/usr/local/bin/pm2")
echo "  PM2: $($PM2_BIN --version)"

# 4. Clone / update repo
echo "[4/6] Code herunterladen..."
if [ -d "$APP_DIR/.git" ]; then
    cd "$APP_DIR" && git pull
else
    rm -rf "$APP_DIR"
    git clone "$REPO" "$APP_DIR"
fi

# 5. Backend setup
echo "[5/6] Backend einrichten..."
cd "$APP_DIR/backend"
npm install --production

if [ ! -f "$APP_DIR/backend/.env" ]; then
    cp "$APP_DIR/backend/.env.production" "$APP_DIR/backend/.env"
    echo "  .env erstellt"
fi

# 6. Frontend build
echo "[6/6] Frontend bauen..."
cd "$APP_DIR/frontend"
npm install --legacy-peer-deps
npm run build

# 7. Start with PM2
echo "App starten..."
$PM2_BIN stop shopping-app 2>/dev/null || true
$PM2_BIN delete shopping-app 2>/dev/null || true
cd "$APP_DIR/backend"
$PM2_BIN start server.js --name shopping-app
$PM2_BIN save

# Auto-start on reboot
$PM2_BIN startup systemd -u root --hp /root 2>/dev/null | grep "sudo\|systemctl" | bash || true

echo ""
echo "========================================="
echo "  Installation abgeschlossen!"
echo "========================================="
echo ""
echo "  App erreichbar unter: http://85.215.215.250:8080"
echo ""
$PM2_BIN status

