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
echo "[1/5] Pakete installieren..."
apt-get update -qq
apt-get install -y git curl

# 2. Node.js 20
echo "[2/5] Node.js 20 installieren..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
echo "  Node: $(node --version) | npm: $(npm --version)"

# 3. Clone / update repo
echo "[3/5] Code herunterladen..."
if [ -d "$APP_DIR/.git" ]; then
    cd "$APP_DIR" && git pull
else
    rm -rf "$APP_DIR"
    git clone "$REPO" "$APP_DIR"
fi

# 4. Backend setup
echo "[4/5] Backend einrichten..."
cd "$APP_DIR/backend"
npm install --production

# Always sync .env from .env.production (ensures new keys like VAPID are picked up)
cp "$APP_DIR/backend/.env.production" "$APP_DIR/backend/.env"
echo "  .env aktualisiert"

# 5. Frontend build
echo "[5/5] Frontend bauen..."
cd "$APP_DIR/frontend"
npm install --legacy-peer-deps
npm run build

# 6. Create systemd service
echo "Systemd Service erstellen..."
cat > /etc/systemd/system/shopping-app.service << EOF
[Unit]
Description=Shopping App
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/shopping-app/backend
ExecStart=$(which node) /opt/shopping-app/backend/server.js
Restart=always
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable shopping-app
systemctl restart shopping-app
sleep 2
systemctl status shopping-app --no-pager

VERSION=$(git -C "$APP_DIR" rev-parse --short HEAD)
BUILD_DATE=$(date '+%d.%m.%Y %H:%M')

echo ""
echo "========================================="
echo "  Installation abgeschlossen!"
echo "  Version: $VERSION ($BUILD_DATE)"
echo "========================================="
echo ""
echo "  App erreichbar unter: http://85.215.215.250:8080"
echo ""

