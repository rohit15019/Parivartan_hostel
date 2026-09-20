# 🚀 Hostinger VPS Production Deployment Guide
### Parivartan Hostel Management System

This guide walks you step-by-step through deploying this project on a **Hostinger VPS** (Ubuntu 22.04 or 24.04 LTS) with **high security**, **PM2 process manager**, **Nginx reverse proxy**, and **free SSL (HTTPS)**.

---

## 📋 Prerequisites
1. A **Hostinger VPS** with **Ubuntu 22.04 / 24.04 64-bit**.
2. Your VPS **IP Address**, **Root Username**, and **Password** (or SSH Key) from your Hostinger Dashboard (`hPanel > VPS Management > SSH Access`).
3. (Optional) A Domain Name (e.g. `parivartanhostel.com`) with an **A Record** pointing to your VPS IP address.

---

## 🛠️ Step 1: Connect to your Hostinger VPS via SSH

On your computer (Terminal / PowerShell / Git Bash / PuTTY):

```bash
ssh root@YOUR_VPS_IP
```
*(Enter your VPS root password when prompted)*

---

## ⚡ Step 2: Run the Automated VPS Setup Script

Copy and run this command on your VPS to automatically install **Node.js 20 LTS, NPM, PM2, MongoDB 7.0, Nginx, UFW Firewall**, and security tools:

```bash
# Download and run the setup script
curl -fsSL https://raw.githubusercontent.com/rohit15019/Parivartan_hostel/main/setup-vps.sh -o setup-vps.sh || true
# Alternatively, create the folder and upload files
```

Or run manually step-by-step:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw nginx build-essential certbot python3-certbot-nginx

# Install Node.js 20 & PM2
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

# Install MongoDB
sudo apt install -y gnupg
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor --yes
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update && sudo apt install -y mongodb-org
sudo systemctl start mongod && sudo systemctl enable mongod

# Configure High Security Firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw deny 5000/tcp
sudo ufw deny 27017/tcp
sudo ufw --force enable
```

---

## 📂 Step 3: Upload Project Files to `/var/www/hostel`

### Option A: Using Git (Recommended)
```bash
cd /var/www
sudo git clone https://github.com/rohit15019/Parivartan_hostel.git hostel
sudo chown -R $USER:$USER /var/www/hostel
cd /var/www/hostel
```

### Option B: Using SCP / FileZilla / WinSCP (From your computer)
Upload the project folder to `/var/www/hostel` (exclude `node_modules` and `dist`).

---

## 🔐 Step 4: Configure Production Environment Variables

Create and edit the `server/.env` file on your VPS:

```bash
cd /var/www/hostel/server
nano .env
```

Paste and save your production configuration:
```env
NODE_ENV=production
PORT=5000

# Your Domain or VPS IP (Comma separated)
CLIENT_URL=http://YOUR_VPS_IP,https://yourdomain.com

# Database Connection URI
MONGO_URI=mongodb://127.0.0.1:27017/hostel_db

# JWT Secret Key
JWT_SECRET=parivartan_hostel_jwt_secret_key_2026_production

# Gmail SMTP Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_digit_app_password
EMAIL_FROM="Parivartan Hostel" <your_email@gmail.com>

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REFRESH_TOKEN=your_google_refresh_token_here
```
*(Press `Ctrl + O` then `Enter` to save, `Ctrl + X` to exit nano)*

---

## 🌐 Step 5: Configure Nginx Web Server

```bash
sudo cp /var/www/hostel/nginx.conf /etc/nginx/sites-available/hostel
sudo nano /etc/nginx/sites-available/hostel
```
*Replace `yourdomain.com www.yourdomain.com` on line 9 with your actual domain or VPS IP address.*

Enable the Nginx site configuration:
```bash
sudo ln -sf /etc/nginx/sites-available/hostel /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🚀 Step 6: Build Frontend & Start PM2 Service

Run the automated deployment script:
```bash
cd /var/www/hostel
chmod +x deploy.sh setup-vps.sh
./deploy.sh
```

Ensure PM2 starts automatically on server reboot:
```bash
pm2 startup
pm2 save
```

---

## 🔒 Step 7: Enable Free SSL / HTTPS (Let's Encrypt)

If you have connected a domain name (e.g. `yourdomain.com`):

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```
*Follow the on-screen prompt to enter your email and accept terms. Certbot will automatically configure HTTPS with auto-renewal.*

---

## 📊 Useful Management Commands

| Task | Command |
| :--- | :--- |
| **Check PM2 Status** | `pm2 status` |
| **View Live Backend Logs** | `pm2 logs parivartan-hostel` |
| **Restart Backend** | `pm2 restart parivartan-hostel` |
| **Check MongoDB Status** | `sudo systemctl status mongod` |
| **Check Nginx Status** | `sudo systemctl status nginx` |
| **Deploy / Update Code** | `cd /var/www/hostel && ./deploy.sh` |

---

## 🛡️ Built-in Security Features Active
- ✅ **Helmet Security HTTP Headers** (Protection against XSS, clickjacking, MIME-sniffing)
- ✅ **DDoS & Brute-Force Rate Limiting** (Max 20 auth attempts / 15m)
- ✅ **UFW Firewall** (Direct Node port 5000 and MongoDB port 27017 are blocked from external access)
- ✅ **Production Safe Error Handling** (Database stacks hidden)
- ✅ **Zero-Downtime Reloads via PM2**
- ✅ **Gzip Payload Compression Enabled**
