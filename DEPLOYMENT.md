# 🚀 CI/CD Deployment Guide for Hostinger VPS

Complete guide to set up automated deployment for your LMS Backend application using GitHub Actions and Hostinger VPS.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Part 1: VPS Setup](#part-1-vps-setup)
- [Part 2: GitHub Repository Setup](#part-2-github-repository-setup)
- [Part 3: GitHub Secrets Configuration](#part-3-github-secrets-configuration)
- [Part 4: First Deployment](#part-4-first-deployment)
- [Part 5: SSL Certificate (Optional)](#part-5-ssl-certificate-optional)
- [Troubleshooting](#troubleshooting)
- [Useful Commands](#useful-commands)

---

## Prerequisites

Before starting, ensure you have:

- ✅ Hostinger VPS with SSH access
- ✅ GitHub account with this repository
- ✅ Domain name (optional, but recommended)
- ✅ PostgreSQL database credentials

---

## Part 1: VPS Setup

### Step 1.1: Connect to Your VPS

```bash
ssh root@your-vps-ip
```

### Step 1.2: Run the Setup Script

Transfer the setup script to your VPS:

```bash
# On your local machine
scp vps-setup.sh root@your-vps-ip:/root/

# On your VPS
chmod +x /root/vps-setup.sh
./vps-setup.sh
```

The script will:
- Install Node.js 20.x
- Install PostgreSQL
- Install PM2 process manager
- Install Nginx
- Create application directory
- Set up database
- Configure Nginx reverse proxy
- Configure firewall

### Step 1.3: Configure Environment Variables

Edit the `.env` file created by the setup script:

```bash
nano /var/www/lms-backend/.env
```

Make sure all variables are set correctly:

```env
NODE_ENV=production
PORT=3000
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=your_db_user
DATABASE_PASSWORD=your_db_password
DATABASE_NAME=your_db_name
JWT_SECRET=your_secure_jwt_secret
CORS_ORIGIN=https://your-domain.com
```

### Step 1.4: Generate SSH Key for Deployment

On your VPS, generate an SSH key pair for GitHub Actions:

```bash
ssh-keygen -t rsa -b 4096 -C "github-actions" -f ~/.ssh/github_actions_key -N ""
```

**Important:** Copy the private key content:

```bash
cat ~/.ssh/github_actions_key
```

Copy the entire output (including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`)

---

## Part 2: GitHub Repository Setup

### Step 2.1: Add Files to Repository

Make sure these files are in your repository:
- `.github/workflows/deploy.yml`
- `deploy.sh`
- `ecosystem.config.js`
- `vps-setup.sh`

### Step 2.2: Commit and Push

```bash
git add .
git commit -m "Add CI/CD configuration"
git push origin main
```

---

## Part 3: GitHub Secrets Configuration

### Step 3.1: Navigate to Repository Settings

1. Go to your GitHub repository
2. Click **Settings** tab
3. Click **Secrets and variables** → **Actions**
4. Click **New repository secret**

### Step 3.2: Add Required Secrets

Add the following secrets one by one:

#### 1. VPS_HOST
```
Value: Your VPS IP address (e.g., 123.456.789.0)
```

#### 2. VPS_USER
```
Value: root (or your SSH username)
```

#### 3. VPS_PORT
```
Value: 22 (or your custom SSH port)
```

#### 4. VPS_SSH_KEY
```
Value: The private key you copied earlier from ~/.ssh/github_actions_key
```

Make sure to include the entire key including headers:
```
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
...
-----END RSA PRIVATE KEY-----
```

#### 5. VPS_DEPLOY_PATH
```
Value: /var/www/lms-backend
```

#### 6. APP_URL
```
Value: http://your-vps-ip:3000 (or https://your-domain.com if using domain)
```

### Step 3.3: Verify All Secrets

Make sure you have added all 6 secrets:
- ✅ VPS_HOST
- ✅ VPS_USER
- ✅ VPS_PORT
- ✅ VPS_SSH_KEY
- ✅ VPS_DEPLOY_PATH
- ✅ APP_URL

---

## Part 4: First Deployment

### Step 4.1: Trigger Deployment

Push code to the main branch to trigger the workflow:

```bash
git push origin main
```

Or manually trigger the workflow:
1. Go to **Actions** tab in GitHub
2. Select **Deploy to VPS** workflow
3. Click **Run workflow**
4. Select branch and click **Run workflow**

### Step 4.2: Monitor Deployment

1. Go to **Actions** tab in your repository
2. Click on the running workflow
3. Watch the progress through:
   - ✅ Test job
   - ✅ Build job
   - ✅ Deploy job
   - ✅ Notify job

### Step 4.3: Verify Deployment

Check if the application is running:

```bash
# On your VPS
pm2 list
pm2 logs lms-backend

# Check health endpoint
curl http://localhost:3000/health
```

Expected response:
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45,
  "environment": "production"
}
```

---

## Part 5: SSL Certificate (Optional)

### Step 5.1: Install Certbot

```bash
apt install certbot python3-certbot-nginx
```

### Step 5.2: Obtain Certificate

```bash
certbot --nginx -d your-domain.com
```

Follow the prompts to:
1. Enter your email
2. Agree to Terms of Service
3. Choose whether to redirect HTTP to HTTPS (recommended: Yes)

### Step 5.3: Test Auto-Renewal

```bash
certbot renew --dry-run
```

### Step 5.4: Update GitHub Secret

Update the `APP_URL` secret to use HTTPS:
```
https://your-domain.com
```

---

## Troubleshooting

### Deployment Fails at SSH Connection

**Problem:** SSH connection refused or authentication failed

**Solution:**
1. Verify VPS_HOST is correct
2. Check VPS_SSH_KEY is the complete private key
3. Ensure the key was generated without a passphrase
4. Test SSH connection manually:
   ```bash
   ssh -i ~/.ssh/github_actions_key root@your-vps-ip
   ```

### Database Connection Errors

**Problem:** Application can't connect to database

**Solution:**
1. Check `.env` file has correct database credentials
2. Verify PostgreSQL is running:
   ```bash
   systemctl status postgresql
   ```
3. Test database connection:
   ```bash
   psql -U your_db_user -d your_db_name
   ```

### PM2 Application Not Starting

**Problem:** PM2 shows app as "errored"

**Solution:**
1. Check PM2 logs:
   ```bash
   pm2 logs lms-backend
   ```
2. Check for missing dependencies:
   ```bash
   cd /var/www/lms-backend
   npm ci --production
   ```
3. Verify .env file exists and is readable
4. Check Node.js version:
   ```bash
   node -v  # Should be v20.x
   ```

### Health Check Fails

**Problem:** GitHub Actions health check fails

**Solution:**
1. Check if app is running:
   ```bash
   pm2 list
   curl http://localhost:3000/health
   ```
2. Check Nginx configuration:
   ```bash
   nginx -t
   systemctl status nginx
   ```
3. Check firewall settings:
   ```bash
   ufw status
   ```

### Migration Fails

**Problem:** Database migrations fail during deployment

**Solution:**
1. Check database connection
2. Run migrations manually:
   ```bash
   cd /var/www/lms-backend
   npm run migration:run
   ```
3. Check migration logs
4. Verify database user has proper permissions

---

## Useful Commands

### PM2 Commands

```bash
# List all applications
pm2 list

# View logs
pm2 logs lms-backend

# Restart application
pm2 restart lms-backend

# Stop application
pm2 stop lms-backend

# Delete application from PM2
pm2 delete lms-backend

# Monitor application
pm2 monit

# Save PM2 configuration
pm2 save

# View detailed info
pm2 show lms-backend
```

### Database Commands

```bash
# Connect to database
psql -U your_db_user -d your_db_name

# List databases
psql -U postgres -c "\l"

# Backup database
pg_dump -U your_db_user your_db_name > backup.sql

# Restore database
psql -U your_db_user your_db_name < backup.sql
```

### Nginx Commands

```bash
# Test configuration
nginx -t

# Reload Nginx
systemctl reload nginx

# Restart Nginx
systemctl restart nginx

# View error logs
tail -f /var/log/nginx/error.log

# View access logs
tail -f /var/log/nginx/access.log
```

### Application Commands

```bash
# View application logs
tail -f /var/www/lms-backend/logs/pm2-combined.log

# View recent deployments
ls -lh /var/www/lms-backend/backups/

# Check disk space
df -h

# Check memory usage
free -h

# Check CPU usage
top
```

### Rollback to Previous Version

If a deployment fails, you can rollback:

```bash
cd /var/www/lms-backend
# List backups
ls -lh backups/

# Restore from backup
BACKUP_DIR="backups/backup_YYYYMMDD_HHMMSS"  # Replace with actual backup
rm -rf dist
cp -r $BACKUP_DIR/dist ./
cp $BACKUP_DIR/.env ./ 2>/dev/null || true
pm2 restart lms-backend
```

---

## Deployment Flow Diagram

```
┌─────────────────────┐
│   Push to GitHub    │
│    (main branch)    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Run Tests         │
│   - Linting         │
│   - Unit Tests      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Build App         │
│   - TypeScript      │
│   - Dependencies    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Deploy to VPS     │
│   - Transfer Files  │
│   - Run Migrations  │
│   - Restart PM2     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Health Check      │
│   - Verify Running  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   ✅ Success!       │
└─────────────────────┘
```

---

## Security Best Practices

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use strong passwords** - For database and JWT secrets
3. **Keep SSH key secure** - Only store in GitHub Secrets
4. **Enable firewall** - Only open necessary ports
5. **Use SSL certificate** - For production environments
6. **Regular updates** - Keep system and packages updated
7. **Monitor logs** - Check PM2 and Nginx logs regularly
8. **Backup database** - Regular automated backups

---

## Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review GitHub Actions logs
3. Check PM2 logs: `pm2 logs lms-backend`
4. Check Nginx logs: `tail -f /var/log/nginx/error.log`

---

## 🎉 Congratulations!

Your CI/CD pipeline is now set up! Every push to the main branch will automatically:
- Run tests
- Build the application
- Deploy to your VPS
- Run database migrations
- Restart the application
- Verify deployment

Happy deploying! 🚀
