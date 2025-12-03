#!/bin/bash

# Deployment script for VPS
# This script runs on the VPS server after files are transferred

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Starting Deployment Process${NC}"
echo -e "${GREEN}========================================${NC}"

# Configuration
APP_DIR="/var/www/lms-backend"  # Change this to your actual deployment path
APP_NAME="lms-backend"
PM2_APP_NAME="lms-backend"

# Navigate to app directory
cd $APP_DIR

echo -e "${YELLOW}[1/8] Backing up current version...${NC}"
if [ -d "dist" ]; then
  BACKUP_DIR="backups/backup_$(date +%Y%m%d_%H%M%S)"
  mkdir -p $BACKUP_DIR
  cp -r dist $BACKUP_DIR/
  cp .env $BACKUP_DIR/ 2>/dev/null || true
  echo -e "${GREEN}✓ Backup created at $BACKUP_DIR${NC}"
else
  echo -e "${YELLOW}No previous version to backup${NC}"
fi

echo -e "${YELLOW}[2/8] Installing dependencies...${NC}"
npm ci --production
echo -e "${GREEN}✓ Dependencies installed${NC}"

echo -e "${YELLOW}[3/8] Checking environment file...${NC}"
if [ ! -f ".env" ]; then
  echo -e "${RED}✗ .env file not found!${NC}"
  echo -e "${RED}Please create .env file with required variables${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Environment file exists${NC}"

echo -e "${YELLOW}[4/8] Running database migrations...${NC}"
npm run migration:run || {
  echo -e "${RED}✗ Migration failed!${NC}"
  echo -e "${YELLOW}Rolling back...${NC}"
  if [ -d "$BACKUP_DIR/dist" ]; then
    rm -rf dist
    cp -r $BACKUP_DIR/dist ./
  fi
  exit 1
}
echo -e "${GREEN}✓ Migrations completed${NC}"

echo -e "${YELLOW}[5/8] Checking PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
  echo -e "${YELLOW}PM2 not found, installing...${NC}"
  npm install -g pm2
fi
echo -e "${GREEN}✓ PM2 is ready${NC}"

echo -e "${YELLOW}[6/8] Stopping old application...${NC}"
pm2 stop $PM2_APP_NAME 2>/dev/null || echo "App was not running"
pm2 delete $PM2_APP_NAME 2>/dev/null || echo "App was not in PM2"

echo -e "${YELLOW}[7/8] Starting application with PM2...${NC}"
pm2 start ecosystem.config.js
pm2 save
echo -e "${GREEN}✓ Application started${NC}"

echo -e "${YELLOW}[8/8] Verifying deployment...${NC}"
sleep 5
if pm2 list | grep -q "$PM2_APP_NAME.*online"; then
  echo -e "${GREEN}✓ Application is running${NC}"
else
  echo -e "${RED}✗ Application failed to start${NC}"
  pm2 logs $PM2_APP_NAME --lines 50
  exit 1
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Completed Successfully!${NC}"
echo -e "${GREEN}========================================${NC}"

# Display app status
pm2 list
pm2 logs $PM2_APP_NAME --lines 20

# Cleanup old backups (keep last 5)
echo -e "${YELLOW}Cleaning up old backups...${NC}"
cd backups
ls -t | tail -n +6 | xargs -r rm -rf
cd ..
echo -e "${GREEN}✓ Cleanup completed${NC}"

exit 0
