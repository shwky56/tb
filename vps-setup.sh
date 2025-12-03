#!/bin/bash

# VPS Setup Script for Hostinger
# Run this script on your VPS to prepare the environment for deployment

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  VPS Setup for LMS Backend${NC}"
echo -e "${GREEN}========================================${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Please run as root or with sudo${NC}"
  exit 1
fi

# Update system
echo -e "${YELLOW}[1/10] Updating system packages...${NC}"
apt update && apt upgrade -y
echo -e "${GREEN}✓ System updated${NC}"

# Install Node.js 20.x
echo -e "${YELLOW}[2/10] Installing Node.js 20.x...${NC}"
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt install -y nodejs
fi
echo -e "${GREEN}✓ Node.js $(node -v) installed${NC}"
echo -e "${GREEN}✓ npm $(npm -v) installed${NC}"

# Install PostgreSQL
echo -e "${YELLOW}[3/10] Installing PostgreSQL...${NC}"
if ! command -v psql &> /dev/null; then
  apt install -y postgresql postgresql-contrib
  systemctl start postgresql
  systemctl enable postgresql
fi
echo -e "${GREEN}✓ PostgreSQL installed${NC}"

# Install PM2
echo -e "${YELLOW}[4/10] Installing PM2...${NC}"
npm install -g pm2
pm2 startup systemd -u $SUDO_USER --hp /home/$SUDO_USER
echo -e "${GREEN}✓ PM2 installed${NC}"

# Install Nginx
echo -e "${YELLOW}[5/10] Installing Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
  apt install -y nginx
  systemctl start nginx
  systemctl enable nginx
fi
echo -e "${GREEN}✓ Nginx installed${NC}"

# Create application directory
echo -e "${YELLOW}[6/10] Creating application directory...${NC}"
APP_DIR="/var/www/lms-backend"
mkdir -p $APP_DIR
mkdir -p $APP_DIR/logs
mkdir -p $APP_DIR/backups
chown -R $SUDO_USER:$SUDO_USER $APP_DIR
echo -e "${GREEN}✓ Directory created at $APP_DIR${NC}"

# Setup PostgreSQL database
echo -e "${YELLOW}[7/10] Setting up PostgreSQL database...${NC}"
read -p "Enter database name [lms_db]: " DB_NAME
DB_NAME=${DB_NAME:-lms_db}
read -p "Enter database user [lms_user]: " DB_USER
DB_USER=${DB_USER:-lms_user}
read -sp "Enter database password: " DB_PASSWORD
echo

sudo -u postgres psql <<EOF
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
\q
EOF
echo -e "${GREEN}✓ Database created${NC}"

# Create .env file template
echo -e "${YELLOW}[8/10] Creating .env template...${NC}"
cat > $APP_DIR/.env.template <<EOF
# Server Configuration
NODE_ENV=production
PORT=3000
API_VERSION=v1

# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=$DB_USER
DATABASE_PASSWORD=$DB_PASSWORD
DATABASE_NAME=$DB_NAME

# JWT Configuration
JWT_SECRET=$(openssl rand -base64 32)
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Session Configuration
SESSION_TIMEOUT_MINUTES=30

# CORS Configuration
CORS_ORIGIN=https://your-domain.com

# Email Configuration (Optional)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASSWORD=your-password
# EMAIL_FROM=noreply@your-domain.com
EOF

cp $APP_DIR/.env.template $APP_DIR/.env
chown $SUDO_USER:$SUDO_USER $APP_DIR/.env
echo -e "${GREEN}✓ .env template created${NC}"
echo -e "${YELLOW}Please edit $APP_DIR/.env with your actual configuration${NC}"

# Configure Nginx
echo -e "${YELLOW}[9/10] Configuring Nginx...${NC}"
read -p "Enter your domain name [localhost]: " DOMAIN
DOMAIN=${DOMAIN:-localhost}

cat > /etc/nginx/sites-available/lms-backend <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;

        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # File upload size limit
    client_max_body_size 10M;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF

ln -sf /etc/nginx/sites-available/lms-backend /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
echo -e "${GREEN}✓ Nginx configured${NC}"

# Setup firewall
echo -e "${YELLOW}[10/10] Configuring firewall...${NC}"
if command -v ufw &> /dev/null; then
  ufw allow 22
  ufw allow 80
  ufw allow 443
  ufw --force enable
  echo -e "${GREEN}✓ Firewall configured${NC}"
else
  echo -e "${YELLOW}UFW not found, skipping firewall configuration${NC}"
fi

# Display summary
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Application directory: ${GREEN}$APP_DIR${NC}"
echo -e "Database name: ${GREEN}$DB_NAME${NC}"
echo -e "Database user: ${GREEN}$DB_USER${NC}"
echo -e "Domain: ${GREEN}$DOMAIN${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Edit the .env file: ${GREEN}nano $APP_DIR/.env${NC}"
echo -e "2. Set up GitHub Actions secrets (see DEPLOYMENT.md)"
echo -e "3. Push your code to GitHub to trigger deployment"
echo ""
echo -e "${YELLOW}Optional: Install SSL certificate with Let's Encrypt${NC}"
echo -e "Run: ${GREEN}apt install certbot python3-certbot-nginx${NC}"
echo -e "Then: ${GREEN}certbot --nginx -d $DOMAIN${NC}"
echo ""
echo -e "${GREEN}Setup completed successfully!${NC}"
