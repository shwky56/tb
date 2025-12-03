# 🔄 CI/CD Pipeline Overview

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     GitHub Repository                         │
│  (Source Code + GitHub Actions Workflows)                    │
└─────────────────────┬────────────────────────────────────────┘
                      │
                      │ Push to main/master
                      │
                      ▼
┌──────────────────────────────────────────────────────────────┐
│                   GitHub Actions Runner                       │
│                     (Ubuntu Latest)                           │
├──────────────────────────────────────────────────────────────┤
│  Stage 1: TEST                                               │
│  ├── Lint code (ESLint)                                      │
│  ├── Run unit tests (Jest)                                   │
│  └── PostgreSQL test database                                │
├──────────────────────────────────────────────────────────────┤
│  Stage 2: BUILD                                              │
│  ├── Install dependencies (npm ci)                           │
│  ├── Compile TypeScript → JavaScript                         │
│  └── Create dist/ folder                                     │
├──────────────────────────────────────────────────────────────┤
│  Stage 3: DEPLOY                                             │
│  ├── Package application files                               │
│  ├── Transfer via SSH/SCP                                    │
│  └── Execute deployment script                               │
└─────────────────────┬────────────────────────────────────────┘
                      │
                      │ SSH/SCP Transfer
                      │
                      ▼
┌──────────────────────────────────────────────────────────────┐
│                    Hostinger VPS                              │
│                 (Ubuntu/Debian Server)                        │
├──────────────────────────────────────────────────────────────┤
│  Components:                                                  │
│  ├── Nginx (Reverse Proxy) :80/:443                         │
│  ├── PM2 (Process Manager)                                   │
│  ├── Node.js Application :3000                               │
│  ├── PostgreSQL Database :5432                               │
│  └── File System (/var/www/lms-backend)                     │
├──────────────────────────────────────────────────────────────┤
│  Deployment Steps:                                            │
│  1. Backup current version                                   │
│  2. Install/Update dependencies                              │
│  3. Run database migrations                                  │
│  4. Stop old PM2 process                                     │
│  5. Start new PM2 process                                    │
│  6. Verify application health                                │
└──────────────────────────────────────────────────────────────┘
```

## Files Structure

```
project-root/
├── .github/
│   └── workflows/
│       ├── deploy.yml              # Main CI/CD workflow
│       └── manual-deploy.yml       # Manual deployment workflow
│
├── src/
│   ├── ...                         # Application source code
│   └── database/
│       └── migrations/             # Database migrations
│
├── deploy.sh                       # VPS deployment script
├── vps-setup.sh                    # VPS initial setup script
├── ecosystem.config.js             # PM2 configuration
├── DEPLOYMENT.md                   # Complete deployment guide
├── QUICK-START.md                  # Quick reference guide
└── CI-CD-OVERVIEW.md              # This file
```

## Workflow Triggers

### Automatic Deployment
- **Trigger:** Push to `main` or `master` branch
- **When:** Every commit to production branches
- **Process:** Test → Build → Deploy → Verify

### Manual Deployment
- **Trigger:** Manual workflow dispatch
- **When:** On-demand from GitHub Actions tab
- **Options:**
  - Choose environment (production/staging)
  - Skip tests option
  - Select specific branch

## Deployment Process Details

### 1. Test Stage (2-3 minutes)

```yaml
Services:
  - PostgreSQL test database

Steps:
  1. Checkout code
  2. Setup Node.js 20.x
  3. Install dependencies (npm ci)
  4. Run ESLint
  5. Run Jest tests with coverage
```

**Success Criteria:**
- ✅ All linting rules pass
- ✅ All tests pass
- ✅ Code coverage meets threshold

### 2. Build Stage (1-2 minutes)

```yaml
Steps:
  1. Checkout code
  2. Setup Node.js 20.x
  3. Install dependencies (npm ci)
  4. Build TypeScript (npm run build)
  5. Upload dist/ artifacts
```

**Output:**
- `dist/` folder with compiled JavaScript
- Uploaded as GitHub Actions artifact

### 3. Deploy Stage (2-3 minutes)

```yaml
Steps:
  1. Download build artifacts
  2. Setup SSH connection
  3. Create deployment package (.tar.gz)
  4. Transfer to VPS via SCP
  5. Execute deploy.sh on VPS
  6. Run health check
  7. Cleanup temporary files
```

**VPS Deployment Script Actions:**
```bash
1. Backup current version → /backups/
2. Install production dependencies
3. Run database migrations
4. Stop old PM2 process
5. Start new PM2 process
6. Verify PM2 status
7. Display logs
8. Cleanup old backups (keep last 5)
```

### 4. Verification Stage (10 seconds)

```yaml
Health Check:
  - URL: http://your-vps-ip:3000/health
  - Expected: 200 OK status
  - Response: { "success": true, "status": "healthy" }
```

## Environment Variables

### GitHub Secrets (Required)

| Secret | Description | Example |
|--------|-------------|---------|
| `VPS_HOST` | VPS IP address | `123.456.789.0` |
| `VPS_USER` | SSH username | `root` |
| `VPS_PORT` | SSH port | `22` |
| `VPS_SSH_KEY` | Private SSH key | `-----BEGIN RSA...` |
| `VPS_DEPLOY_PATH` | Application path | `/var/www/lms-backend` |
| `APP_URL` | Application URL | `http://123.456.789.0:3000` |

### VPS Environment (.env)

```env
# Server
NODE_ENV=production
PORT=3000

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=lms_user
DATABASE_PASSWORD=***
DATABASE_NAME=lms_db

# JWT
JWT_SECRET=***
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Session
SESSION_TIMEOUT_MINUTES=30

# CORS
CORS_ORIGIN=https://your-domain.com
```

## Server Stack

### Nginx Configuration
```nginx
Location: /etc/nginx/sites-available/lms-backend
Purpose: Reverse proxy from port 80/443 to 3000
Features:
  - Proxy headers
  - Timeout settings
  - File upload limits
  - Security headers
```

### PM2 Configuration
```javascript
Location: ecosystem.config.js
Mode: Cluster (all CPU cores)
Features:
  - Auto-restart on crash
  - Log management
  - Memory limit (1GB)
  - Zero-downtime reload
```

### PostgreSQL
```
Port: 5432
Features:
  - Automated migrations
  - Connection pooling
  - Backup on deployment
```

## Monitoring & Logging

### Application Logs
```bash
Location: /var/www/lms-backend/logs/
Files:
  - pm2-out.log      # Standard output
  - pm2-error.log    # Error logs
  - pm2-combined.log # Combined logs

View: pm2 logs lms-backend
```

### Nginx Logs
```bash
Access: /var/log/nginx/access.log
Errors: /var/log/nginx/error.log

View: tail -f /var/log/nginx/error.log
```

### System Logs
```bash
System: journalctl -u nginx
         journalctl -xe
```

## Rollback Strategy

### Automatic Backup
Every deployment creates a timestamped backup:
```
/var/www/lms-backend/backups/backup_YYYYMMDD_HHMMSS/
├── dist/
└── .env
```

### Manual Rollback
```bash
cd /var/www/lms-backend
ls backups/
# Choose backup
BACKUP=backups/backup_20240101_120000
rm -rf dist
cp -r $BACKUP/dist ./
pm2 restart lms-backend
```

### Automated Rollback
If migration fails, deployment script automatically:
1. Stops deployment
2. Restores from backup
3. Exits with error code

## Performance Optimization

### PM2 Cluster Mode
- Uses all available CPU cores
- Load balancing between instances
- Zero-downtime reload
- Automatic process restart

### Nginx Caching
- Static file caching
- Gzip compression
- Connection keep-alive

### Database
- Connection pooling
- Query optimization
- Index management

## Security Measures

### SSH Security
- Private key authentication only
- No password authentication
- Keys stored in GitHub Secrets
- Automatic cleanup after deployment

### Application Security
- Helmet.js headers
- Rate limiting
- Input sanitization
- CORS configuration
- JWT authentication

### Database Security
- Strong passwords
- Limited user permissions
- No remote access (localhost only)
- Regular backups

### Server Security
- UFW firewall enabled
- Only necessary ports open (22, 80, 443)
- SSL certificate (optional)
- Regular system updates

## Troubleshooting Quick Reference

| Error | Likely Cause | Solution |
|-------|--------------|----------|
| SSH Connection Failed | Wrong credentials | Verify GitHub secrets |
| Tests Failed | Code issues | Check test logs in Actions |
| Build Failed | TypeScript errors | Check compilation errors |
| Migration Failed | Database issue | Check database connection |
| PM2 Not Starting | Missing dependencies | Run `npm ci` on VPS |
| Health Check Failed | App crashed | Check PM2 logs |
| Nginx Error | Config issue | Run `nginx -t` |

## Maintenance Tasks

### Daily
- ✅ Monitor PM2 status: `pm2 list`
- ✅ Check application logs: `pm2 logs lms-backend --lines 50`

### Weekly
- ✅ Check disk space: `df -h`
- ✅ Review Nginx logs: `tail -100 /var/log/nginx/error.log`
- ✅ Database backup: `pg_dump -U lms_user lms_db > backup.sql`

### Monthly
- ✅ System updates: `apt update && apt upgrade`
- ✅ Clean old backups: Keep last 10 backups
- ✅ Review security logs
- ✅ Update dependencies: `npm update`

## Scaling Considerations

### Vertical Scaling
- Upgrade VPS resources (CPU, RAM)
- Increase PM2 instances
- Optimize database

### Horizontal Scaling
- Load balancer in front
- Multiple VPS instances
- Shared database server
- Redis session store

## Cost Breakdown

### Free Tier
- ✅ GitHub Actions (2000 minutes/month)
- ✅ GitHub repository (unlimited public repos)

### Paid Services
- 💵 Hostinger VPS (varies by plan)
- 💵 Domain name (optional, ~$10-15/year)
- 💵 SSL certificate (free with Let's Encrypt)

## Next Steps

After successful deployment:

1. **SSL Certificate** - Add HTTPS with Let's Encrypt
2. **Custom Domain** - Point domain to VPS
3. **Monitoring** - Set up uptime monitoring
4. **Backups** - Automate database backups
5. **Staging** - Create staging environment
6. **Notifications** - Add Slack/Discord notifications
7. **Performance** - Add APM monitoring

## Support Resources

- 📚 [Full Deployment Guide](./DEPLOYMENT.md)
- 🚀 [Quick Start Guide](./QUICK-START.md)
- 💻 [GitHub Actions Docs](https://docs.github.com/en/actions)
- 🔧 [PM2 Documentation](https://pm2.keymetrics.io/)
- 🌐 [Nginx Documentation](https://nginx.org/en/docs/)

---

**Last Updated:** January 2025
**Pipeline Version:** 1.0.0
