#!/bin/bash
# ==============================================================================
# Zero-Downtime Deployment Script - Parivartan Hostel
# ==============================================================================

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "🚀 [1/5] Checking environment..."
if [ ! -f "$PROJECT_DIR/server/.env" ]; then
    echo "⚠️ Warning: server/.env not found! Creating from server/.env.example..."
    cp "$PROJECT_DIR/server/.env.example" "$PROJECT_DIR/server/.env"
    echo "⚠️ Please edit $PROJECT_DIR/server/.env with your production credentials!"
fi

echo "📦 [2/5] Installing Backend dependencies..."
cd "$PROJECT_DIR/server"
npm install --omit=dev

echo "⚛️ [3/5] Installing Frontend dependencies & Building Production Assets..."
cd "$PROJECT_DIR/client"
npm install
npm run build

echo "🔄 [4/5] Reloading PM2 Backend Cluster..."
cd "$PROJECT_DIR"
mkdir -p logs
if pm2 list | grep -q "parivartan-hostel"; then
    pm2 reload ecosystem.config.js --env production
else
    pm2 start ecosystem.config.js --env production
fi
pm2 save

echo "🌐 [5/5] Checking Nginx & Health Check..."
if [ -f "/etc/nginx/sites-available/hostel" ]; then
    sudo nginx -t && sudo systemctl reload nginx
fi

sleep 2
echo "Health status check:"
curl -s http://127.0.0.1:5000/api/health || echo "Server starting..."

echo ""
echo "=============================================================================="
echo "🎉 Deployment successfully completed with zero downtime!"
echo "=============================================================================="
