# 🚀 Quick Start Guide - CI/CD Deployment

This is a condensed version of the deployment guide for experienced developers.

## 1. VPS Setup (One-time)

```bash
# SSH into your VPS
ssh root@your-vps-ip

# Download and run setup script
wget https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/vps-setup.sh
chmod +x vps-setup.sh
./vps-setup.sh

# Edit environment variables
nano /var/www/lms-backend/.env
```

## 2. GitHub Secrets (One-time)

Add these secrets in GitHub Settings → Secrets and variables → Actions:

| Secret Name | Value |
|------------|-------|
| `VPS_HOST` | Your VPS IP address |
| `VPS_USER` | `root` or your SSH username |
| `VPS_PORT` | `22` (or custom port) |
| `VPS_SSH_KEY` | Private key from `~/.ssh/github_actions_key` |
| `VPS_DEPLOY_PATH` | `/var/www/lms-backend` |
| `APP_URL` | `http://your-vps-ip:3000` |

## 3. Deploy

```bash
git push origin main
```

That's it! Monitor deployment in GitHub Actions tab.

## Common Commands

```bash
# On VPS - Check status
pm2 list
pm2 logs lms-backend

# Manual deployment from Actions tab
Click "Run workflow" → Select branch → Run

# Rollback
cd /var/www/lms-backend
ls backups/
# Copy backup to dist/ and restart PM2
```

## Health Check

```bash
curl http://your-vps-ip:3000/health
```

## SSL (Optional)

```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d your-domain.com
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| SSH fails | Check VPS_SSH_KEY is complete with headers |
| Deploy fails | Check PM2 logs: `pm2 logs lms-backend` |
| App not responding | Check Nginx: `nginx -t && systemctl status nginx` |
| Database error | Verify .env credentials and PostgreSQL status |

For detailed guide, see [DEPLOYMENT.md](./DEPLOYMENT.md)
