# API Testing Guide - Single-Device Login Flow

## Testing Single-Device Login Enforcement

This guide provides step-by-step instructions to test the single-device login functionality.

## Setup

1. Start the server:
```bash
npm run dev
```

2. Ensure PostgreSQL is running and database is created
3. Run migrations if needed:
```bash
npm run migration:run
```

## Test Scenario 1: Normal Login Flow

### Step 1: Register a new user
```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "SecurePass123!",
  "role": "Student",
  "university": "MIT"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully. Your account is pending approval.",
  "data": {
    "user": {
      "id": "uuid-here",
      "name": "Test User",
      "email": "test@example.com",
      "role": "Student"
    }
  }
}
```

### Step 2: Update user status to Active (use database or admin endpoint)
```sql
UPDATE users SET status = 'Active' WHERE email = 'test@example.com';
```

### Step 3: Login from Device 1
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "SecurePass123!"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "name": "Test User",
      "email": "test@example.com",
      "role": "Student"
    }
  }
}
```

**Database Check:**
```sql
SELECT id, email, "currentSessionId", "sessionLastActivity"
FROM users
WHERE email = 'test@example.com';
```

Should show:
- `currentSessionId`: A valid UUID
- `sessionLastActivity`: Recent timestamp

### Step 4: Verify authenticated access works
```http
GET http://localhost:5000/api/users/profile
Authorization: Bearer YOUR_ACCESS_TOKEN_FROM_STEP_3
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": "uuid",
      "name": "Test User",
      "email": "test@example.com",
      "role": "Student"
    }
  }
}
```

## Test Scenario 2: Single-Device Enforcement (CRITICAL)

### Step 5: Attempt to login from Device 2 (while still logged in from Device 1)
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "SecurePass123!"
}
```

**Expected Response (409 Conflict):**
```json
{
  "success": false,
  "message": "You are already logged in from another device. Please log out of your other session first."
}
```

**Database Check:**
```sql
SELECT id, email, "currentSessionId"
FROM users
WHERE email = 'test@example.com';
```

Should show:
- `currentSessionId`: **UNCHANGED** (still the session from Device 1)

### Step 6: Logout from Device 1
```http
POST http://localhost:5000/api/auth/logout
Authorization: Bearer DEVICE_1_ACCESS_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Database Check:**
```sql
SELECT id, email, "currentSessionId", "sessionLastActivity"
FROM users
WHERE email = 'test@example.com';
```

Should show:
- `currentSessionId`: **NULL**
- `sessionLastActivity`: **NULL**

### Step 7: Now login from Device 2 should succeed
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "SecurePass123!"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "NEW_TOKEN_HERE",
    "refreshToken": "NEW_REFRESH_TOKEN"
  }
}
```

**Database Check:**
```sql
SELECT id, email, "currentSessionId"
FROM users
WHERE email = 'test@example.com';
```

Should show:
- `currentSessionId`: **NEW UUID** (different from Device 1)

## Test Scenario 3: Token Invalidation After Logout

### Step 8: Use old token from Device 1 after logout
```http
GET http://localhost:5000/api/users/profile
Authorization: Bearer OLD_DEVICE_1_TOKEN
```

**Expected Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Session is invalid. You may have logged in from another device."
}
```

This proves that old tokens are invalidated when:
1. User logs out
2. User logs in from another device (implicitly invalidates previous session)

## Test Scenario 4: Session Timeout

### Step 9: Login and wait for session timeout
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "SecurePass123!"
}
```

### Step 10: Wait 30+ minutes (or modify SESSION_TIMEOUT_MINUTES for testing)

For testing purposes, you can temporarily set in `.env`:
```env
SESSION_TIMEOUT_MINUTES=1
```

### Step 11: Try to access protected route after timeout
```http
GET http://localhost:5000/api/users/profile
Authorization: Bearer YOUR_TOKEN
```

**Expected Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Session has expired. Please log in again."
}
```

**Database Check:**
```sql
SELECT id, email, "currentSessionId"
FROM users
WHERE email = 'test@example.com';
```

Should show:
- `currentSessionId`: **NULL** (automatically cleared)

## Test Scenario 5: Multiple Login Attempts

### Step 12: Rapid login attempts while already logged in
```bash
# Login once
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!"}'

# Immediately try again (5 times)
for i in {1..5}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"SecurePass123!"}'
  echo "\n---\n"
done
```

**Expected:**
- First login: Success (200)
- Next 5 attempts: All rejected with 409 Conflict
- Rate limiter may kick in after 5 attempts (429 Too Many Requests)

## Test Scenario 6: Password Change Forces Logout

### Step 13: Login
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "SecurePass123!"
}
```

### Step 14: Change password
```http
PUT http://localhost:5000/api/users/change-password
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "currentPassword": "SecurePass123!",
  "newPassword": "NewSecurePass456!"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Password changed successfully. Please log in again."
}
```

### Step 15: Try to use old token
```http
GET http://localhost:5000/api/users/profile
Authorization: Bearer OLD_TOKEN
```

**Expected Response (401):**
```json
{
  "success": false,
  "message": "Session is invalid. You may have logged in from another device."
}
```

## Test Scenario 7: Admin Ban Forces Logout

### Step 16: User is logged in
```http
GET http://localhost:5000/api/users/profile
Authorization: Bearer USER_TOKEN
```

### Step 17: Admin bans the user
```http
PUT http://localhost:5000/api/users/{userId}/status
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "status": "Banned"
}
```

### Step 18: User tries to access protected route
```http
GET http://localhost:5000/api/users/profile
Authorization: Bearer USER_TOKEN
```

**Expected Response (401):**
```json
{
  "success": false,
  "message": "Account has been banned. Please contact support."
}
```

## Database Queries for Verification

### Check active sessions
```sql
SELECT
  id,
  email,
  "currentSessionId",
  "sessionLastActivity",
  "deviceInfo",
  "lastLoginIp"
FROM users
WHERE "currentSessionId" IS NOT NULL;
```

### Check session age
```sql
SELECT
  email,
  "currentSessionId",
  "sessionLastActivity",
  NOW() - "sessionLastActivity" as session_age
FROM users
WHERE "currentSessionId" IS NOT NULL;
```

### Clear all sessions (for testing)
```sql
UPDATE users
SET "currentSessionId" = NULL,
    "sessionLastActivity" = NULL;
```

## Curl Commands for Quick Testing

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "SecurePass123!",
    "role": "Student"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

### Get Profile (replace TOKEN)
```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Logout
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Expected Behavior Summary

| Scenario | Expected Result | Status Code |
|----------|----------------|-------------|
| First login | Success, token returned | 200 |
| Second login while logged in | Rejected | 409 |
| Login after logout | Success | 200 |
| Use old token after logout | Rejected | 401 |
| Use token after timeout | Rejected | 401 |
| Use token after password change | Rejected | 401 |
| Use token after ban | Rejected | 401 |
| Logout clears session | currentSessionId = NULL | 200 |

## Troubleshooting

### Issue: Can login multiple times
**Check:**
1. Is `currentSessionId` actually being set in database?
2. Is the service checking `hasActiveSession()`?
3. Look at logs for any errors

### Issue: Session not clearing on logout
**Check:**
1. Is the logout endpoint being called with valid token?
2. Check `clearSession()` method in repository
3. Verify database update query

### Issue: Tokens work after logout
**Check:**
1. Is JWT Strategy comparing session IDs?
2. Is `currentSessionId` being cleared in database?
3. Check Passport JWT Strategy implementation

## Success Criteria

✅ User can log in successfully
✅ User **cannot** log in from second device while logged in from first
✅ User can log in from second device **after** logging out from first
✅ Old tokens become invalid after logout
✅ Sessions expire after timeout period
✅ Password change forces logout
✅ Admin ban forces logout
✅ Database `currentSessionId` accurately tracks active sessions

## Automated Test Script

Create a file `test-single-device.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:5000/api"
EMAIL="test@example.com"
PASSWORD="SecurePass123!"

echo "=== Test 1: Register User ==="
curl -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"role\":\"Student\"}"

echo "\n\n=== Test 2: First Login ==="
RESPONSE=$(curl -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
TOKEN1=$(echo $RESPONSE | jq -r '.data.accessToken')
echo $RESPONSE

echo "\n\n=== Test 3: Second Login (Should Fail) ==="
curl -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}"

echo "\n\n=== Test 4: Logout ==="
curl -X POST $BASE_URL/auth/logout \
  -H "Authorization: Bearer $TOKEN1"

echo "\n\n=== Test 5: Login Again (Should Succeed) ==="
curl -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}"

echo "\n\n=== Tests Complete ==="
```

Run with:
```bash
chmod +x test-single-device.sh
./test-single-device.sh
```

This comprehensive testing guide ensures the single-device login enforcement works correctly!
