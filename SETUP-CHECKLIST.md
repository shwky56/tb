# ✅ Setup Checklist

**VPS IP:** 91.108.121.145

Follow this checklist step by step. Check off each item as you complete it.

## 📋 Part 1: VPS Setup (30 minutes)

### Security First
- [ ] Connect to VPS: `ssh root@91.108.121.145`
- [ ] **IMPORTANT:** Change root password with `passwd`
- [ ] Save new password in password manager

### Install Software
- [ ] Upload setup script: `scp quick-vps-setup.sh root@91.108.121.145:/root/`
- [ ] SSH into VPS: `ssh root@91.108.121.145`
- [ ] Make script executable: `chmod +x /root/quick-vps-setup.sh`
- [ ] Run setup script: `./quick-vps-setup.sh`
- [ ] Wait for script to complete (5-10 minutes)

### Save Important Info
- [ ] Copy and save database credentials shown by script
- [ ] Copy and save the entire SSH private key (including headers)
- [ ] Test connection: `curl http://91.108.121.145`

---

## 📋 Part 2: GitHub Setup (10 minutes)

### Add GitHub Secrets
Go to: Repository → Settings → Secrets and variables → Actions

- [ ] **VPS_HOST**: `91.108.121.145`
- [ ] **VPS_USER**: `root`
- [ ] **VPS_PORT**: `22`
- [ ] **VPS_SSH_KEY**: Paste entire SSH key from Step 1
- [ ] **VPS_DEPLOY_PATH**: `/var/www/lms-backend`
- [ ] **APP_URL**: `http://91.108.121.145:3000`

### Verify Secrets
- [ ] Check all 6 secrets are added
- [ ] Verify VPS_SSH_KEY includes `-----BEGIN RSA PRIVATE KEY-----` header
- [ ] Verify VPS_SSH_KEY includes `-----END RSA PRIVATE KEY-----` footer

---

## 📋 Part 3: First Deployment (15 minutes)

### Commit and Push
On your local machine:
- [ ] `git add .`
- [ ] `git commit -m "Add CI/CD pipeline"`
- [ ] `git push origin main`

### Monitor Deployment
- [ ] Go to GitHub repository
- [ ] Click **Actions** tab
- [ ] Watch "Deploy to VPS" workflow
- [ ] Wait for all stages to complete (green checkmarks)
  - [ ] Test stage
  - [ ] Build stage
  - [ ] Deploy stage
  - [ ] Notify stage

### Verify Deployment
- [ ] Check health: `curl http://91.108.121.145:3000/health`
- [ ] Check API: `curl http://91.108.121.145:3000/`
- [ ] Open in browser: http://91.108.121.145:3000/api/docs
- [ ] SSH to VPS: `ssh root@91.108.121.145`
- [ ] Check PM2: `pm2 list` (should show "online")
- [ ] Check logs: `pm2 logs lms-backend` (no errors)

---

## 📋 Part 4: Testing (10 minutes)

### Test Endpoints

**Health Check:**
```bash
curl http://91.108.121.145:3000/health
```
Expected: `{"success":true,"status":"healthy",...}`

**Register User:**
```bash
curl -X POST http://91.108.121.145:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

**Check API Docs:**
- [ ] Open: http://91.108.121.145:3000/api/docs
- [ ] API documentation loads correctly

---

## 📋 Part 5: Security Hardening (Optional but Recommended)

### Additional Security
On your VPS:

- [ ] Disable password authentication:
  ```bash
  nano /etc/ssh/sshd_config
  # Set: PasswordAuthentication no
  systemctl restart sshd
  ```

- [ ] Install fail2ban (blocks brute force):
  ```bash
  apt install fail2ban -y
  systemctl enable fail2ban
  systemctl start fail2ban
  ```

- [ ] Setup automatic security updates:
  ```bash
  apt install unattended-upgrades -y
  dpkg-reconfigure -plow unattended-upgrades
  ```

- [ ] Create non-root user (optional):
  ```bash
  adduser deployer
  usermod -aG sudo deployer
  ```

---

## 📋 Part 6: Domain Setup (Optional)

Skip this if you don't have a domain.

### DNS Configuration
- [ ] Add A record: `@ → 91.108.121.145`
- [ ] Wait for DNS propagation (5-60 minutes)
- [ ] Test: `ping yourdomain.com`

### Update Nginx
- [ ] Edit config: `nano /etc/nginx/sites-available/lms-backend`
- [ ] Change `server_name 91.108.121.145;` to `server_name yourdomain.com;`
- [ ] Test: `nginx -t`
- [ ] Reload: `systemctl reload nginx`

### SSL Certificate
- [ ] Install certbot: `apt install certbot python3-certbot-nginx -y`
- [ ] Get certificate: `certbot --nginx -d yourdomain.com`
- [ ] Test auto-renewal: `certbot renew --dry-run`
- [ ] Update GitHub secret **APP_URL** to `https://yourdomain.com`

---

## 📋 Troubleshooting Checklist

If deployment fails, check these:

### GitHub Actions Failed
- [ ] Check Actions tab for error message
- [ ] Verify all 6 GitHub secrets are correct
- [ ] Check SSH key is complete (with headers)
- [ ] Re-run workflow: Actions → Failed workflow → Re-run jobs

### SSH Connection Failed
- [ ] Test manually: `ssh root@91.108.121.145`
- [ ] Check VPS is online
- [ ] Verify IP address is correct
- [ ] Check firewall allows port 22

### Application Not Starting
- [ ] SSH to VPS: `ssh root@91.108.121.145`
- [ ] Check PM2: `pm2 logs lms-backend`
- [ ] Check .env exists: `cat /var/www/lms-backend/.env`
- [ ] Verify Node version: `node -v` (should be v20.x)
- [ ] Try manual start: `cd /var/www/lms-backend && pm2 restart lms-backend`

### Database Connection Failed
- [ ] Check PostgreSQL: `systemctl status postgresql`
- [ ] Verify .env has correct DB credentials
- [ ] Test connection: `sudo -u postgres psql -d lms_db`
- [ ] Check database exists: `sudo -u postgres psql -l`

### Cannot Access Application
- [ ] Check Nginx: `systemctl status nginx`
- [ ] Test config: `nginx -t`
- [ ] Check firewall: `ufw status`
- [ ] Check PM2: `pm2 list`
- [ ] View Nginx logs: `tail -f /var/log/nginx/error.log`

---

## 📞 Quick Help Commands

```bash
# Connect to VPS
ssh root@91.108.121.145

# Check app status
pm2 list

# View logs
pm2 logs lms-backend

# Restart app
pm2 restart lms-backend

# Check health
curl http://91.108.121.145:3000/health

# View all services status
pm2 list && systemctl status nginx && systemctl status postgresql
```

---

## ✅ Final Verification

Once everything is working:

- [ ] Health endpoint returns 200 OK
- [ ] API documentation accessible
- [ ] PM2 shows app as "online"
- [ ] No errors in PM2 logs
- [ ] Nginx is running
- [ ] PostgreSQL is running
- [ ] Can register a test user
- [ ] GitHub Actions shows green checkmarks
- [ ] Firewall is enabled
- [ ] Password has been changed

---

## 🎉 Success!

If all checkboxes are checked, your CI/CD pipeline is fully operational!

### What happens now?

Every time you push to the main branch:
1. ✅ Tests run automatically
2. ✅ Application builds
3. ✅ Deploys to your VPS
4. ✅ Migrations run
5. ✅ Application restarts
6. ✅ Health check verifies deployment

### Your URLs:
- 🌐 API: http://91.108.121.145:3000
- 📚 Docs: http://91.108.121.145:3000/api/docs
- 🔍 Health: http://91.108.121.145:3000/health
- 📊 Actions: https://github.com/YOUR_USERNAME/YOUR_REPO/actions

---

## 📚 Reference Documents

- `YOUR-VPS-SETUP.md` - Detailed setup guide for your VPS
- `DEPLOYMENT.md` - Complete deployment documentation
- `COMMAND-REFERENCE.md` - Quick command reference
- `QUICK-START.md` - Quick start guide
- `CI-CD-OVERVIEW.md` - Pipeline architecture

---

**Last Updated:** January 2025
**Your VPS:** 91.108.121.145
**Support:** Check the documentation files above
