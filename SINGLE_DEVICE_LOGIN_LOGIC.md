# Single-Device Login Implementation - Detailed Logic Flow

## Overview
This document details the implementation of strict single-device login enforcement in the LMS backend system. This ensures that a user can only be logged in from ONE device at any given time.

## Database Schema

### User Model - Session Fields
```typescript
currentSessionId: string | null;     // UUID of active session (NULL = not logged in)
sessionLastActivity: Date | null;    // Timestamp of last authenticated request
deviceInfo: string | null;           // User agent string from login
lastLoginIp: string | null;          // IP address from login
```

## Login Flow (CRITICAL)

### Step 1: Initial Credential Validation
**Location:** `src/controllers/user.controller.ts` - `loginUser` function

```typescript
// Passport Local Strategy validates email and password
passport.authenticate('local', { session: false }, async (err, user, info) => {
  // Credentials validated at this point
})
```

**What happens:**
- User provides email and password
- Passport Local Strategy (in `src/config/passport.config.ts`) queries database
- Password hash is compared using bcrypt
- User status and account flags are checked
- If valid, user object is returned

### Step 2: Single-Device Session Check (CRITICAL)
**Location:** `src/controllers/user.controller.ts` - `loginUser` function

```typescript
// CRITICAL CHECK: Verify no active session exists
const hasActiveSession = await userService.hasActiveSession(user.id);
if (hasActiveSession) {
  return sendError(
    res,
    'You are already logged in from another device. Please log out of your other session first.',
    undefined,
    409 // Conflict status code
  );
}
```

**What happens:**
- Check if `user.currentSessionId` is NOT NULL in database
- If NOT NULL → User already logged in elsewhere → **REJECT** with 409 Conflict
- If NULL → User not logged in anywhere → **PROCEED** to Step 3

**Implementation:** `src/repositories/user.repository.ts`
```typescript
async hasActiveSession(userId: string): Promise<boolean> {
  const user = await this.findById(userId);
  return user !== null && user.currentSessionId !== null;
}
```

### Step 3: Generate Unique Session ID
**Location:** `src/services/user.service.ts` - `loginUser` function

```typescript
// Generate unique session ID for this login
const sessionId = generateSessionId(); // Returns UUID v4
```

**What happens:**
- Generate a new UUID v4 (e.g., `"550e8400-e29b-41d4-a716-446655440000"`)
- This becomes the unique identifier for this login session
- Will be stored in database and embedded in JWT

### Step 4: Store Session in Database
**Location:** `src/services/user.service.ts` - `loginUser` function

```typescript
// Update user's session in database
await this.userRepository.setSession(user.id, sessionId, deviceInfo, ipAddress);
```

**Implementation:** `src/repositories/user.repository.ts`
```typescript
async setSession(userId: string, sessionId: string, deviceInfo?: string, ipAddress?: string) {
  await this.repository.update(userId, {
    currentSessionId: sessionId,
    sessionLastActivity: new Date(),
    deviceInfo,
    lastLoginIp: ipAddress,
  });
}
```

**What happens:**
- Update database record for user
- Set `currentSessionId` = generated session ID
- Set `sessionLastActivity` = current timestamp
- Store device info and IP address for security tracking

### Step 5: Generate JWT Tokens
**Location:** `src/services/user.service.ts` - `loginUser` function

```typescript
const tokenPayload = {
  userId: user.id,
  sessionId,           // CRITICAL: Session ID embedded in token
  email: user.email,
  role: user.role,
};

const accessToken = generateAccessToken(tokenPayload);
const refreshToken = generateRefreshToken(tokenPayload);
```

**What happens:**
- Create JWT payload with session ID embedded
- Sign JWT with secret key
- Set expiration time (default 24h for access, 7d for refresh)
- Return both tokens to client

### Step 6: Return Tokens to Client
```typescript
return {
  accessToken,
  refreshToken,
  user: userInfo,
};
```

## Authenticated Request Validation

### On Every Protected Route Request

**Location:** `src/config/passport.config.ts` - JWT Strategy

```typescript
passport.use(new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
  // Extract user ID and session ID from JWT payload
  const { userId, sessionId } = jwtPayload;

  // Find user in database
  const user = await userRepository.findById(userId);

  // CRITICAL: Validate session ID matches current session
  if (user.currentSessionId !== sessionId) {
    return done(null, false, {
      message: 'Session is invalid. You may have logged in from another device.'
    });
  }

  // Check session timeout
  const sessionAge = Date.now() - new Date(user.sessionLastActivity).getTime();
  if (sessionAge > sessionTimeout) {
    await userRepository.clearSession(userId);
    return done(null, false, { message: 'Session has expired.' });
  }

  // Update last activity
  await userRepository.updateSessionActivity(userId);

  return done(null, user);
}));
```

**What happens:**
1. Extract `sessionId` from JWT token
2. Query database for user
3. **CRITICAL COMPARISON:** Compare JWT `sessionId` with database `currentSessionId`
4. If mismatch → User logged in from different device → **REJECT** with 401
5. If match → Check session timeout
6. If expired → Clear session → **REJECT** with 401
7. If valid → Update activity timestamp → **ALLOW** request

## Logout Flow

**Location:** `src/controllers/user.controller.ts` - `logoutUser` function

```typescript
await userService.logoutUser(user.id);
```

**Implementation:** `src/repositories/user.repository.ts`
```typescript
async clearSession(userId: string): Promise<void> {
  await this.repository.update(userId, {
    currentSessionId: null,
    sessionLastActivity: null,
  });
}
```

**What happens:**
- Set `currentSessionId` to NULL in database
- Set `sessionLastActivity` to NULL
- User can now log in from another device

## Session Timeout

**Configuration:** `.env`
```env
SESSION_TIMEOUT_MINUTES=30
```

**Logic:**
- Every authenticated request checks session age
- If `(current time - sessionLastActivity) > timeout` → Clear session
- Default: 30 minutes of inactivity

## Security Scenarios

### Scenario 1: User tries to log in from Device B while logged in on Device A

```
1. User logged in on Device A
   - Database: currentSessionId = "session-A-uuid"

2. User attempts login from Device B
   - System checks: currentSessionId != null
   - LOGIN REJECTED: "You are already logged in from another device"

3. User must logout from Device A first
   - Logout clears: currentSessionId = null

4. User can now login from Device B
   - Database: currentSessionId = "session-B-uuid"
```

### Scenario 2: User's session expires due to inactivity

```
1. User logged in
   - Database: sessionLastActivity = 2024-01-01 10:00:00

2. User makes request at 10:35:00
   - Session age = 35 minutes
   - Timeout = 30 minutes
   - Session EXPIRED
   - System clears currentSessionId
   - Request REJECTED: "Session has expired"

3. User must login again
```

### Scenario 3: User changes password

```
1. Password change requested
   - src/services/user.service.ts - changePassword()

2. After password update:
   - Clear currentSessionId (force logout)
   - User must login with new password

3. Security benefit:
   - If someone else changed password, original user is logged out
```

## Key Files Reference

1. **Database Model:** `src/models/user.model.ts`
   - Session field definitions

2. **Repository:** `src/repositories/user.repository.ts`
   - `setSession()` - Store session ID
   - `clearSession()` - Remove session ID
   - `hasActiveSession()` - Check if user logged in
   - `updateSessionActivity()` - Update timestamp

3. **Service:** `src/services/user.service.ts`
   - `loginUser()` - Main login logic with session check

4. **Controller:** `src/controllers/user.controller.ts`
   - `loginUser()` - Login endpoint
   - `logoutUser()` - Logout endpoint

5. **Passport Config:** `src/config/passport.config.ts`
   - JWT Strategy with session validation

6. **Utilities:** `src/utils/session.util.ts`
   - `generateSessionId()` - Create UUID
   - `extractDeviceInfo()` - Get user agent
   - `extractIpAddress()` - Get IP address

## Testing Single-Device Login

### Test Case 1: Normal Login
```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password"
}

Expected: 200 OK with tokens
Database: currentSessionId = "new-uuid"
```

### Test Case 2: Attempt Second Login
```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password"
}

Expected: 409 Conflict
Message: "You are already logged in from another device..."
Database: currentSessionId remains unchanged
```

### Test Case 3: Logout and Re-login
```bash
1. POST /api/auth/logout
   Expected: 200 OK
   Database: currentSessionId = null

2. POST /api/auth/login
   Expected: 200 OK with new tokens
   Database: currentSessionId = "new-uuid-2"
```

### Test Case 4: Use Token After Logout
```bash
1. Login and receive token
2. Logout (clears session)
3. Use old token on protected route

Expected: 401 Unauthorized
Message: "Session is invalid..."
```

## Summary

The single-device login enforcement works through:

1. **Database tracking** of active session via `currentSessionId`
2. **Login-time check** that rejects if session already exists
3. **Request-time validation** that compares JWT session ID with database
4. **Logout mechanism** that clears the session, allowing new login
5. **Timeout management** that automatically clears expired sessions

This ensures strict one-device-at-a-time access while maintaining security and user experience.
