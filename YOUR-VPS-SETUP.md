# 🚀 Your Hostinger VPS Setup Guide

**VPS IP:** 91.108.121.145

## ⚠️ Security First

**IMPORTANT:** You shared your root password. Please change it immediately after setup!

## 📋 Step-by-Step Setup

### Step 1: Connect to Your VPS

Open your terminal (PowerShell, CMD, or Git Bash) and connect:

```bash
ssh root@91.108.121.145
```

Enter the password when prompted.

### Step 2: Change Your Password (IMPORTANT!)

```bash
passwd
# Enter new secure password twice
# Save it in a password manager!
```

### Step 3: Upload and Run Setup Script

**On your local machine** (in the project directory):

```bash
# Upload the setup script
scp quick-vps-setup.sh root@91.108.121.145:/root/
```

**On your VPS** (in SSH session):

```bash
# Make it executable
chmod +x /root/quick-vps-setup.sh

# Run the setup
./quick-vps-setup.sh
```

The script will:
- ✅ Install Node.js 20.x
- ✅ Install PostgreSQL
- ✅ Install PM2
- ✅ Install Nginx
- ✅ Create database with random password
- ✅ Create .env file
- ✅ Configure Nginx reverse proxy
- ✅ Setup firewall
- ✅ Generate SSH key for GitHub Actions

### Step 4: Save Important Information

The script will display:
- Database credentials (save these!)
- SSH private key (copy the entire key)

**Copy the SSH key output** - you'll need it for GitHub!

### Step 5: Configure GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

Add these 6 secrets:

#### Secret 1: VPS_HOST
```
91.108.121.145
```

#### Secret 2: VPS_USER
```
root
```

#### Secret 3: VPS_PORT
```
22
```

#### Secret 4: VPS_SSH_KEY
Paste the entire SSH key from Step 4, including:
```
-----BEGIN RSA PRIVATE KEY-----
... (all the key content) ...
-----END RSA PRIVATE KEY-----
```

#### Secret 5: VPS_DEPLOY_PATH
```
/var/www/lms-backend
```

#### Secret 6: APP_URL
```
http://91.108.121.145:3000
```

### Step 6: Commit and Push

On your local machine:

```bash
git add .
git commit -m "Add CI/CD pipeline"
git push origin main
```

### Step 7: Monitor Deployment

1. Go to your GitHub repository
2. Click **Actions** tab
3. Watch the deployment progress

### Step 8: Verify Deployment

After deployment completes (3-5 minutes):

**Check health endpoint:**
```bash
curl http://91.108.121.145:3000/health
```

Expected response:
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 12.34,
  "environment": "production"
}
```

**Check API:**
```bash
curl http://91.108.121.145:3000/
```

## 🎯 Your Application URLs

- **Health Check:** http://91.108.121.145:3000/health
- **API Root:** http://91.108.121.145:3000/
- **API Docs:** http://91.108.121.145:3000/api/docs
- **Nginx:** http://91.108.121.145/

## 🔧 Useful Commands

### On Your VPS (via SSH)

```bash
# Check application status
pm2 list
pm2 logs lms-backend

# Check Nginx status
systemctl status nginx

# Check database
sudo -u postgres psql -d lms_db

# View application logs
tail -f /var/www/lms-backend/logs/pm2-combined.log

# Restart application
pm2 restart lms-backend

# Check disk space
df -h

# Check memory
free -h
```

### On Your Local Machine

```bash
# Trigger manual deployment
# Go to GitHub Actions → Deploy to VPS → Run workflow

# SSH into VPS
ssh root@91.108.121.145

# Check health
curl http://91.108.121.145:3000/health
```

## 🛠️ Troubleshooting

### If deployment fails:

1. **Check GitHub Actions logs**
   - Go to Actions tab
   - Click on failed workflow
   - Review error messages

2. **Check PM2 logs on VPS**
   ```bash
   ssh root@91.108.121.145
   pm2 logs lms-backend
   ```

3. **Check Nginx logs**
   ```bash
   tail -f /var/log/nginx/error.log
   ```

4. **Verify .env file**
   ```bash
   cat /var/www/lms-backend/.env
   ```

### Common Issues:

**SSH Connection Failed:**
- Verify VPS_SSH_KEY includes complete key with headers
- Check you copied the entire key from `-----BEGIN` to `-----END`

**Database Connection Error:**
- Check .env file has correct database password
- Verify PostgreSQL is running: `systemctl status postgresql`

**Application Not Starting:**
- Check PM2 logs: `pm2 logs lms-backend --lines 50`
- Verify Node.js version: `node -v` (should be v20.x)
- Check for missing dependencies: `cd /var/www/lms-backend && npm ci`

**Cannot Access Application:**
- Check firewall: `ufw status`
- Check Nginx: `nginx -t && systemctl status nginx`
- Check if app is running: `pm2 list`

## 🔐 Security Recommendations

### Immediate Actions:

1. ✅ Change root password (done in Step 2)
2. ✅ Setup SSH key authentication (done by script)
3. ✅ Enable firewall (done by script)

### Additional Security (Recommended):

```bash
# 1. Disable password authentication for SSH
nano /etc/ssh/sshd_config
# Set: PasswordAuthentication no
systemctl restart sshd

# 2. Create non-root user for daily operations
adduser deployer
usermod -aG sudo deployer

# 3. Setup automatic security updates
apt install unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades

# 4. Install fail2ban (blocks brute force attacks)
apt install fail2ban
systemctl enable fail2ban
systemctl start fail2ban
```

## 📱 Optional: Add Custom Domain

If you have a domain name:

### Step 1: Point Domain to VPS
Add an A record in your domain's DNS settings:
```
Type: A
Name: @ (or subdomain like api)
Value: 91.108.121.145
TTL: 3600
```

### Step 2: Update Nginx Configuration
```bash
ssh root@91.108.121.145
nano /etc/nginx/sites-available/lms-backend
# Change server_name to your domain
```

### Step 3: Install SSL Certificate
```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com
```

### Step 4: Update GitHub Secret
Update `APP_URL` secret to:
```
https://yourdomain.com
```

## 🎉 You're All Set!

Your application will now automatically deploy when you push to the main branch!

### Deployment Flow:
```
Push to GitHub
    ↓
Run Tests & Build
    ↓
Deploy to 91.108.121.145
    ↓
Run Migrations
    ↓
Restart with PM2
    ↓
✅ Live!
```

### Quick Links:
- 🌐 Your API: http://91.108.121.145:3000
- 📚 API Docs: http://91.108.121.145:3000/api/docs
- 🔍 Health Check: http://91.108.121.145:3000/health
- 📊 GitHub Actions: https://github.com/YOUR_USERNAME/YOUR_REPO/actions

## 📞 Need Help?

Check these files:
- `DEPLOYMENT.md` - Complete deployment guide
- `QUICK-START.md` - Quick reference
- `CI-CD-OVERVIEW.md` - Pipeline architecture

---

**Your VPS:** 91.108.121.145
**App Port:** 3000
**Database:** PostgreSQL on localhost:5432
