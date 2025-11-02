#!/bin/bash
# Jmichi - Complete Deployment Script
# Usage: ./deploy.sh <server_ip> <domain>
# Example: ./deploy.sh 159.89.204.134 jmichi.com

set -euo pipefail

# FORCE non-interactive mode for ALL operations
export DEBIAN_FRONTEND=noninteractive
export UCF_FORCE_CONFFNEW=1
export UCF_FORCE_CONFFMISS=1
export APT_LISTCHANGES_FRONTEND=none
export APT_LISTBUGS_FRONTEND=none

if [ $# -lt 2 ]; then
  echo "Usage: $0 <server_ip> <domain>"
  echo "Example: $0 159.89.204.134 jmichi.com"
  exit 1
fi

SERVER="$1"
PRIMARY_DOMAIN="$2"
APP_DIR="/var/www/jmichi"
REPO_URL="https://github.com/seamuswc/jmichi.git"
NGINX_CONFIG="/etc/nginx/sites-available/jmichi"

echo "🚀 Jmichi - Complete Server Deployment"
echo "======================================"
echo "Server: $SERVER"
echo "Domain: $PRIMARY_DOMAIN"
echo ""

ssh root@"$SERVER" "SERVER='$SERVER' PRIMARY_DOMAIN='$PRIMARY_DOMAIN' APP_DIR='$APP_DIR' REPO_URL='$REPO_URL' NGINX_CONFIG='$NGINX_CONFIG' bash -s" << 'REMOTE_EOF'
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive
export UCF_FORCE_CONFFNEW=1
export UCF_FORCE_CONFFMISS=1
export APT_LISTCHANGES_FRONTEND=none
export APT_LISTBUGS_FRONTEND=none

echo "📦 Updating system packages..."
apt update -y >/dev/null 2>&1
apt upgrade -y >/dev/null 2>&1

echo "📦 Installing Node.js 20.x and PM2..."
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt install -y nodejs
fi
npm uninstall -g pm2 >/dev/null 2>&1 || true
npm install -g pm2@latest
pm2 --version

echo "🌐 Installing nginx and certbot..."
apt install -y nginx certbot python3-certbot-nginx

echo "🧱 Configuring firewall..."
ufw allow OpenSSH >/dev/null 2>&1 || true
ufw allow 'Nginx Full' >/dev/null 2>&1 || true
yes | ufw enable >/dev/null 2>&1 || true

echo "📁 Preparing app directory..."
mkdir -p "$APP_DIR"
git config --global --add safe.directory "$APP_DIR" || true

FRESH_INSTALL=0
if [ -d "$APP_DIR/.git" ]; then
  echo "📥 Pulling latest code..."
  git -C "$APP_DIR" fetch --all
  git -C "$APP_DIR" reset --hard origin/main
else
  echo "📥 Cloning repository..."
  git clone "$REPO_URL" "$APP_DIR"
  FRESH_INSTALL=1
fi

cd "$APP_DIR"

echo "🔐 Ensuring environment file..."
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    # Update domain-specific variable
    sed -i "s|VITE_API_URL=.*|VITE_API_URL=\"https://$PRIMARY_DOMAIN/api\"|g" .env
    echo "✅ Environment file created from .env.example"
    echo "⚠️  IMPORTANT: Edit .env and configure ADMIN_PASSWORD, ADMIN_TOKEN, SOLANA_MERCHANT_ADDRESS, TENCENT_SECRET_ID, and TENCENT_SECRET_KEY before continuing!"
  else
    echo "⚠️  .env.example not found, creating default .env..."
    cat > .env <<ENVEOF
# Database
DATABASE_URL="file:./server/database/database.sqlite"

# Server
PORT=3001
NODE_ENV=production

# Admin (MUST be configured - empty strings will cause errors)
ADMIN_USERNAME="admin"
ADMIN_PASSWORD=""
ADMIN_TOKEN=""

# Solana (MUST be configured - empty strings will cause errors)
SOLANA_RPC_URL="https://api.mainnet-beta.solana.com"
SOLANA_MERCHANT_ADDRESS=""

# Email (Tencent SES) - MUST be configured
TENCENT_SECRET_ID=""
TENCENT_SECRET_KEY=""
TENCENT_SES_REGION="ap-singapore"
TENCENT_SES_TEMPLATE_ID_DATA="67035"
TENCENT_SES_TEMPLATE_ID_PROMO="67034"
TENCENT_SES_SENDER="data@jmichi.com"

# Google Maps API (public client-side key)
VITE_GOOGLE_MAPS_API_KEY="AIzaSyBVdAS-3mrNYARIDmqn2dP1tG1Khqv5GoM"

# Vite Environment Variables
VITE_API_URL="https://$PRIMARY_DOMAIN/api"
VITE_APP_NAME="Jmichi"
ENVEOF
    echo "✅ Default environment file created"
    echo "⚠️  IMPORTANT: Edit .env and configure ADMIN_PASSWORD, ADMIN_TOKEN, SOLANA_MERCHANT_ADDRESS, TENCENT_SECRET_ID, and TENCENT_SECRET_KEY before continuing!"
  fi
fi

cp .env server/.env 2>/dev/null || true

echo "📦 Installing dependencies..."
npm install --silent
cd client && npm install --silent && cd ..
cd server && npm install --silent && cd ..

echo "🗄️ Setting up database..."
cd server
npx prisma generate
npx prisma db push
cd ..

echo "🔨 Building application..."
cd server
npm run build
cd ..
cd client
npm run build
cd ..

echo "⚙️ Configuring PM2..."
cat > ecosystem.config.js <<PM2EOF
module.exports = {
  apps: [{
    name: 'jmichi',
    script: 'server/dist/index.js',
    cwd: '$APP_DIR',
    env_file: '$APP_DIR/.env',
    instances: 1,
    exec_mode: 'fork'
  }]
};
PM2EOF

echo "🚀 Starting application with PM2..."
pm2 delete jmichi >/dev/null 2>&1 || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root >/dev/null 2>&1 || true

echo "🌐 Configuring nginx..."
cat > "$NGINX_CONFIG" <<NGINXEOF
server {
    listen 80;
    server_name $PRIMARY_DOMAIN www.$PRIMARY_DOMAIN;

    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # API routes
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
        root $APP_DIR/client/dist;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # HTML files
    location / {
        root $APP_DIR/client/dist;
        try_files \$uri \$uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
NGINXEOF

ln -sf "$NGINX_CONFIG" /etc/nginx/sites-enabled/jmichi
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

echo "🔒 Setting up SSL certificate..."
if ! certbot --nginx -d "$PRIMARY_DOMAIN" -d "www.$PRIMARY_DOMAIN" --non-interactive --agree-tos --redirect --email "admin@$PRIMARY_DOMAIN" 2>&1 | grep -q "Successfully"; then
  echo "⚠️  SSL certificate setup may have failed, but continuing..."
fi

echo ""
echo "✅ Deployment complete!"
echo "📊 Application Status:"
pm2 status
echo ""
echo "🌐 App should be available at: https://$PRIMARY_DOMAIN"
echo "⚠️  Don't forget to configure secrets in .env file!"
REMOTE_EOF

echo ""
echo "🎉 Deployment script completed!"
echo "🌐 Check your site at: https://$PRIMARY_DOMAIN"
