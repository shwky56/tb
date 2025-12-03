#!/bin/bash

# Quick VPS Setup Script for Hostinger
# IP: 91.108.121.145

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Quick VPS Setup${NC}"
echo -e "${GREEN}========================================${NC}"

# Update system
echo -e "${YELLOW}[1/9] Updating system...${NC}"
apt update && apt upgrade -y

# Install Node.js 20.x
echo -e "${YELLOW}[2/9] Installing Node.js...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
echo -e "${GREEN}✓ Node.js $(node -v) installed${NC}"

# Install PostgreSQL
echo -e "${YELLOW}[3/9] Installing PostgreSQL...${NC}"
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql
echo -e "${GREEN}✓ PostgreSQL installed${NC}"

# Install PM2
echo -e "${YELLOW}[4/9] Installing PM2...${NC}"
npm install -g pm2
echo -e "${GREEN}✓ PM2 installed${NC}"

# Install Nginx
echo -e "${YELLOW}[5/9] Installing Nginx...${NC}"
apt install -y nginx
systemctl start nginx
systemctl enable nginx
echo -e "${GREEN}✓ Nginx installed${NC}"

# Create app directory
echo -e "${YELLOW}[6/9] Creating application directory...${NC}"
mkdir -p /var/www/lms-backend/{logs,backups}
echo -e "${GREEN}✓ Directory created${NC}"

# Setup database
echo -e "${YELLOW}[7/9] Setting up database...${NC}"
DB_NAME="lms_db"
DB_USER="lms_user"
DB_PASS=$(openssl rand -base64 12)

sudo -u postgres psql <<EOF
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASS';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER DATABASE $DB_NAME OWNER TO $DB_USER;
\c $DB_NAME
GRANT ALL ON SCHEMA public TO $DB_USER;
EOF
echo -e "${GREEN}✓ Database created${NC}"

# Create .env file
echo -e "${YELLOW}[8/9] Creating .env file...${NC}"
JWT_SECRET=$(openssl rand -base64 32)

cat > /var/www/lms-backend/.env <<EOF
# Server Configuration
NODE_ENV=production
PORT=3000
API_VERSION=v1

# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=$DB_USER
DATABASE_PASSWORD=$DB_PASS
DATABASE_NAME=$DB_NAME

# JWT Configuration
JWT_SECRET=$JWT_SECRET
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Session Configuration
SESSION_TIMEOUT_MINUTES=30

# CORS Configuration
CORS_ORIGIN=http://91.108.121.145

# Email Configuration (Configure later if needed)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=
# SMTP_PASSWORD=
# EMAIL_FROM=
EOF
echo -e "${GREEN}✓ .env file created${NC}"

# Configure Nginx
echo -e "${YELLOW}[9/9] Configuring Nginx...${NC}"
cat > /etc/nginx/sites-available/lms-backend <<'NGINX_EOF'
server {
    listen 80;
    server_name 91.108.121.145;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    client_max_body_size 10M;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
NGINX_EOF

ln -sf /etc/nginx/sites-available/lms-backend /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
echo -e "${GREEN}✓ Nginx configured${NC}"

# Setup firewall
echo -e "${YELLOW}Configuring firewall...${NC}"
ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable

# Generate SSH key for GitHub Actions
echo -e "${YELLOW}Generating SSH key for deployments...${NC}"
ssh-keygen -t rsa -b 4096 -C "github-actions" -f /root/.ssh/github_actions_key -N ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}IMPORTANT - Save these credentials:${NC}"
echo ""
echo -e "Database Name: ${GREEN}$DB_NAME${NC}"
echo -e "Database User: ${GREEN}$DB_USER${NC}"
echo -e "Database Password: ${GREEN}$DB_PASS${NC}"
echo ""
echo -e "${YELLOW}GitHub Actions SSH Key (copy this):${NC}"
echo -e "${GREEN}================================${NC}"
cat /root/.ssh/github_actions_key
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Copy the SSH key above"
echo "2. Add it to GitHub Secrets as VPS_SSH_KEY"
echo "3. Add other secrets to GitHub (see instructions below)"
echo "4. Push your code to trigger deployment"
