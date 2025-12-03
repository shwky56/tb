# 📝 Command Reference Card

**VPS IP:** 91.108.121.145

## 🔐 Connect to VPS

```bash
ssh root@91.108.121.145
```

## 📦 PM2 Commands

```bash
# List all apps
pm2 list

# View logs (live)
pm2 logs lms-backend

# View last 100 lines
pm2 logs lms-backend --lines 100

# Restart app
pm2 restart lms-backend

# Stop app
pm2 stop lms-backend

# Start app
pm2 start lms-backend

# Delete from PM2
pm2 delete lms-backend

# Monitor (real-time)
pm2 monit

# App info
pm2 show lms-backend

# Save PM2 config
pm2 save
```

## 🗄️ Database Commands

```bash
# Connect to database
sudo -u postgres psql -d lms_db

# In psql:
\l              # List databases
\dt             # List tables
\d users        # Describe users table
\q              # Quit

# Backup database
pg_dump -U lms_user lms_db > backup_$(date +%Y%m%d).sql

# Restore database
psql -U lms_user lms_db < backup_20240101.sql

# Check PostgreSQL status
systemctl status postgresql
```

## 🌐 Nginx Commands

```bash
# Test config
nginx -t

# Reload (no downtime)
systemctl reload nginx

# Restart
systemctl restart nginx

# Status
systemctl status nginx

# View error log
tail -f /var/log/nginx/error.log

# View access log
tail -f /var/log/nginx/access.log

# Edit config
nano /etc/nginx/sites-available/lms-backend
```

## 📋 Application Files

```bash
# App directory
cd /var/www/lms-backend

# View .env file
cat /var/www/lms-backend/.env

# Edit .env file
nano /var/www/lms-backend/.env

# View logs
tail -f logs/pm2-combined.log
tail -f logs/pm2-error.log

# List backups
ls -lh backups/

# Check app size
du -sh /var/www/lms-backend
```

## 🔄 Deployment Commands

```bash
# Manual deploy (on VPS)
cd /var/www/lms-backend
chmod +x deploy.sh
./deploy.sh

# Run migrations
cd /var/www/lms-backend
npm run migration:run

# Rollback to previous version
cd /var/www/lms-backend
BACKUP=$(ls -t backups/ | head -1)
rm -rf dist
cp -r backups/$BACKUP/dist ./
pm2 restart lms-backend
```

## 🔥 Firewall Commands

```bash
# Check firewall status
ufw status

# Enable firewall
ufw enable

# Allow port
ufw allow 22
ufw allow 80
ufw allow 443

# Deny port
ufw deny 8080

# Delete rule
ufw delete allow 8080

# Disable firewall
ufw disable
```

## 📊 System Monitoring

```bash
# Disk usage
df -h

# Memory usage
free -h

# CPU info
top
htop  # (if installed)

# Check running processes
ps aux | grep node

# Network connections
netstat -tulpn | grep LISTEN

# System logs
journalctl -xe
journalctl -u nginx
journalctl -u postgresql
```

## 🧹 Cleanup Commands

```bash
# Clean old backups (keep last 5)
cd /var/www/lms-backend/backups
ls -t | tail -n +6 | xargs rm -rf

# Clean npm cache
npm cache clean --force

# Clean old logs (older than 7 days)
find /var/www/lms-backend/logs -name "*.log" -mtime +7 -delete

# Clean apt cache
apt clean
apt autoremove
```

## 🔍 Health Checks

```bash
# Check API health
curl http://91.108.121.145:3000/health

# Check API root
curl http://91.108.121.145:3000/

# Check with headers
curl -I http://91.108.121.145:3000/health

# Test endpoint with JSON
curl -X POST http://91.108.121.145:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

## 🔑 SSH Key Management

```bash
# View GitHub Actions SSH key
cat ~/.ssh/github_actions_key

# View public key
cat ~/.ssh/github_actions_key.pub

# Generate new key
ssh-keygen -t rsa -b 4096 -C "comment" -f ~/.ssh/new_key -N ""

# Test SSH connection
ssh -T git@github.com
```

## 🛠️ Quick Fixes

### App Not Responding
```bash
pm2 restart lms-backend
systemctl reload nginx
```

### High Memory Usage
```bash
pm2 restart lms-backend
pm2 delete lms-backend
cd /var/www/lms-backend
pm2 start ecosystem.config.js
```

### Database Issues
```bash
systemctl restart postgresql
sudo -u postgres psql -d lms_db
# Then check connections: SELECT * FROM pg_stat_activity;
```

### Disk Full
```bash
# Find large files
du -ah /var/www/lms-backend | sort -rh | head -20

# Clean logs
truncate -s 0 /var/www/lms-backend/logs/*.log

# Clean old backups
cd /var/www/lms-backend/backups
rm -rf backup_2024*  # Remove old backups
```

## 📱 Quick URLs

- **API Root:** http://91.108.121.145:3000
- **Health:** http://91.108.121.145:3000/health
- **Docs:** http://91.108.121.145:3000/api/docs
- **GitHub Actions:** [Your Repo]/actions

## 🆘 Emergency Rollback

```bash
# Quick rollback to last backup
cd /var/www/lms-backend
LAST_BACKUP=$(ls -t backups/ | head -1)
rm -rf dist
cp -r backups/$LAST_BACKUP/dist ./
cp backups/$LAST_BACKUP/.env ./ 2>/dev/null || true
pm2 restart lms-backend
pm2 logs lms-backend
```

## 💾 Daily Backup Script

Create this script: `/root/backup-db.sh`

```bash
#!/bin/bash
BACKUP_DIR="/var/www/lms-backend/backups"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U lms_user lms_db > $BACKUP_DIR/db_backup_$DATE.sql
# Keep only last 7 backups
cd $BACKUP_DIR
ls -t db_backup_*.sql | tail -n +8 | xargs rm -f
```

Make it executable and add to cron:
```bash
chmod +x /root/backup-db.sh
crontab -e
# Add: 0 2 * * * /root/backup-db.sh
```

## 🔔 Monitor Application

```bash
# Watch logs in real-time
pm2 logs lms-backend

# Monitor system resources
pm2 monit

# Watch Nginx access log
tail -f /var/log/nginx/access.log

# Watch all logs
tail -f /var/www/lms-backend/logs/*.log
```

---

**💡 Tip:** Bookmark this file for quick reference!
