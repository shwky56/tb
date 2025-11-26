# Quick Start Guide

## Prerequisites

- Node.js v18+ installed
- PostgreSQL v14+ installed and running
- Git (optional)
- Postman or similar API testing tool (optional)

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` file with your configuration:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=lms_db

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_REFRESH_SECRET=your_refresh_token_secret_change_this

# Server
NODE_ENV=development
PORT=5000
```

### 3. Create PostgreSQL Database

```bash
# Using psql
psql -U postgres
CREATE DATABASE lms_db;
\q
```

Or using createdb:
```bash
createdb -U postgres lms_db
```

### 4. Run Database Migrations

```bash
npm run migration:run
```

### 5. Start Development Server

```bash
npm run dev
```

Server will start at: `http://localhost:5000`

## First API Calls

### 1. Check Server Health

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "LMS API is running",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 2. Register First User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "SecurePass123!",
    "role": "Super-admin",
    "university": "MIT"
  }'
```

### 3. Update User Status (Using Database)

Since new users are "Pending" by default, activate the account:

```sql
psql -U postgres lms_db
UPDATE users SET status = 'Active' WHERE email = 'admin@example.com';
\q
```

### 4. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePass123!"
  }'
```

Save the `accessToken` from the response for subsequent requests.

### 5. Get Profile

```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Project Structure Overview

```
src/
├── config/          # App configuration
├── controllers/     # Request handlers
├── services/        # Business logic
├── repositories/    # Database operations
├── models/          # Database entities
├── middleware/      # Express middleware
├── routes/          # API routes
├── validators/      # Input validation
├── utils/           # Helper functions
└── app.ts           # Express app setup
```

## Key Features

### Single-Device Login Enforcement

Users can only be logged in from ONE device at a time. If a user tries to log in from a second device while already logged in, they will receive:

```json
{
  "success": false,
  "message": "You are already logged in from another device. Please log out of your other session first."
}
```

### User Roles

- **Super-admin**: Full system access
- **University-admin**: University-specific management
- **Instructor**: Course creation and management
- **Student**: Course enrollment and learning

### Authentication Flow

1. User logs in → receives JWT token
2. Token contains embedded session ID
3. Every request validates session ID against database
4. If session ID mismatch → request rejected
5. User must logout to login elsewhere

## Common Commands

### Development
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm start            # Start production server
```

### Database
```bash
npm run migration:generate    # Generate new migration
npm run migration:run         # Run pending migrations
npm run migration:revert      # Revert last migration
```

### Code Quality
```bash
npm run lint         # Check for linting errors
npm run lint:fix     # Fix linting errors
npm test             # Run tests
npm test:watch       # Run tests in watch mode
```

## API Endpoints Overview

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login (single-device enforcement)
- `POST /logout` - Logout and clear session

### Users (`/api/users`)
- `GET /profile` - Get current user profile
- `PUT /profile` - Update profile
- `PUT /change-password` - Change password
- `GET /list` - List users (admin)
- `GET /:userId` - Get user by ID
- `PUT /:userId/status` - Update user status (admin)
- `PUT /:userId/role` - Update user role (admin)
- `DELETE /:userId` - Delete user (admin)

### Courses (`/api/courses`)
- `POST /` - Create course (instructor/admin)
- `GET /` - List courses
- `GET /:courseId` - Get course details
- `PUT /:courseId` - Update course
- `DELETE /:courseId` - Delete course
- `POST /:courseId/publish` - Publish course
- `POST /:courseId/archive` - Archive course

### Enrollments (`/api/enrollments`)
- `POST /` - Enroll in course
- `GET /my` - Get my enrollments
- `GET /course/:courseId` - Get course enrollments (instructor)
- `PUT /:enrollmentId/status` - Update enrollment status
- `PUT /:enrollmentId/progress` - Update progress

## Testing Single-Device Login

### Test Scenario

1. **Login from Device 1**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"SecurePass123!"}'
   ```
   ✅ Success - Token returned

2. **Try to login from Device 2** (while still logged in)
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"SecurePass123!"}'
   ```
   ❌ Rejected - "Already logged in from another device"

3. **Logout from Device 1**
   ```bash
   curl -X POST http://localhost:5000/api/auth/logout \
     -H "Authorization: Bearer DEVICE_1_TOKEN"
   ```
   ✅ Success

4. **Login from Device 2** (after logout)
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"SecurePass123!"}'
   ```
   ✅ Success - New token returned

## Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | development |
| `PORT` | Server port | 5000 |
| `DB_HOST` | Database host | localhost |
| `DB_PORT` | Database port | 5432 |
| `DB_USERNAME` | Database username | postgres |
| `DB_PASSWORD` | Database password | - |
| `DB_DATABASE` | Database name | lms_db |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | JWT expiration time | 24h |
| `SESSION_TIMEOUT_MINUTES` | Session timeout | 30 |
| `BCRYPT_ROUNDS` | Password hash rounds | 12 |
| `RATE_LIMIT_MAX_REQUESTS` | API rate limit | 100 |

## Troubleshooting

### Server won't start
- Check if PostgreSQL is running
- Verify database exists
- Check `.env` configuration
- Ensure port 5000 is available

### Database connection error
- Verify PostgreSQL credentials in `.env`
- Check if database exists: `psql -U postgres -l`
- Ensure PostgreSQL is running: `pg_ctl status`

### Migration errors
- Ensure database is empty or synchronized
- Check TypeORM connection settings
- Verify entity files are correct

### Login rejected
- Check user status is 'Active'
- Verify password is correct
- Check if already logged in elsewhere

### Token invalid
- Verify JWT_SECRET matches between sessions
- Check token hasn't expired
- Ensure user hasn't been logged out

## Next Steps

1. **Read Documentation**
   - `README.md` - Full project documentation
   - `SINGLE_DEVICE_LOGIN_LOGIC.md` - Detailed login logic
   - `ARCHITECTURE.md` - System architecture
   - `API_TESTING_GUIDE.md` - Testing guide

2. **Explore the Code**
   - Start with `src/server.ts` - Entry point
   - Review `src/controllers/user.controller.ts` - Login logic
   - Check `src/services/user.service.ts` - Business logic
   - Study `src/config/passport.config.ts` - Auth strategies

3. **Customize**
   - Add new models for your domain
   - Create new controllers/services
   - Implement additional features
   - Add more validation rules

4. **Deploy**
   - Set up production database
   - Configure environment variables
   - Use PM2 or similar for process management
   - Set up reverse proxy (Nginx)
   - Enable SSL/TLS

## Security Checklist

Before deploying to production:

- [ ] Change default `JWT_SECRET` to strong random string
- [ ] Set `NODE_ENV=production`
- [ ] Use strong database password
- [ ] Enable SSL/TLS
- [ ] Set `DB_SYNCHRONIZE=false`
- [ ] Configure proper CORS origins
- [ ] Review rate limiting settings
- [ ] Set up monitoring and logging
- [ ] Enable firewall rules
- [ ] Regular database backups
- [ ] Update dependencies regularly

## Support

For issues or questions:
1. Check the documentation files
2. Review the code comments
3. Check TypeScript types for API signatures
4. Look at test files for examples

## License

MIT License - See LICENSE file for details
