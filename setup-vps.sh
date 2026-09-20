#!/bin/bash
# ==============================================================================
# Hostinger VPS Initial Server Setup Script - Parivartan Hostel
# OS: Ubuntu 22.04 / 24.04 LTS or Debian 11/12
# ==============================================================================

set -e

echo "🚀 [1/6] Updating system packages..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw nginx build-essential certbot python3-certbot-nginx

echo "📦 [2/6] Installing Node.js 20 LTS & PM2..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

sudo npm install -g pm2

echo "🍃 [3/6] Installing MongoDB Community Server..."
if ! command -v mongod &> /dev/null; then
    sudo apt install -y gnupg curl
    curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
       sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
       --dearmor --yes
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | \
       sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    sudo apt update
    sudo apt install -y mongodb-org
fi

sudo systemctl start mongod
sudo systemctl enable mongod
echo "MongoDB status: $(sudo systemctl is-active mongod)"

echo "🛡️ [4/6] Configuring UFW Firewall for high security..."
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'
# Block direct outside access to port 5000 and 27017
sudo ufw deny 5000/tcp comment 'Block Direct Node Port'
sudo ufw deny 27017/tcp comment 'Block Direct MongoDB Port'
sudo ufw --force enable
sudo ufw status

echo "📁 [5/6] Creating deployment directories..."
sudo mkdir -p /var/www/hostel
sudo mkdir -p /var/www/hostel/logs
sudo chown -R $USER:$USER /var/www/hostel

echo "⚙️ [6/6] Setting PM2 to start automatically on system boot..."
pm2 startup | tail -n 1 | sudo bash || true

echo "=============================================================================="
echo "✅ Hostinger VPS Setup Complete!"
echo "Next step: Upload project files to /var/www/hostel, configure .env, and run ./deploy.sh"
echo "=============================================================================="
