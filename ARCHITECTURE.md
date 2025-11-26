# LMS Backend Architecture

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                            │
│  (Web Browser, Mobile App, Postman, etc.)                       │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP/HTTPS
                         │ JSON
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXPRESS SERVER                              │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Security Middleware Layer                                 │  │
│  │  - Helmet (Security Headers)                               │  │
│  │  - CORS                                                     │  │
│  │  - Rate Limiting                                            │  │
│  │  - Input Sanitization                                       │  │
│  └───────────────────────────────────────────────────────────┘  │
│                         │                                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Authentication Middleware                                 │  │
│  │  - Passport JWT Strategy                                   │  │
│  │  - Session Validation ★ CRITICAL                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                         │                                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Validation Middleware                                     │  │
│  │  - express-validator                                       │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CONTROLLER LAYER                            │
│  - user.controller.ts (Auth, Profile, Management)               │
│  - course.controller.ts (CRUD Operations)                       │
│  - enrollment.controller.ts (Student Enrollments)               │
│                                                                   │
│  Responsibilities:                                               │
│  • Handle HTTP requests/responses                               │
│  • Extract request parameters                                   │
│  • Call appropriate services                                    │
│  • Format responses                                             │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SERVICE LAYER                              │
│  - user.service.ts ★ SINGLE-DEVICE LOGIC                        │
│  - course.service.ts                                            │
│  - enrollment.service.ts                                        │
│                                                                   │
│  Responsibilities:                                               │
│  • Business logic implementation                                │
│  • Data validation                                              │
│  • Cross-repository operations                                  │
│  • Transaction management                                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                     REPOSITORY LAYER                             │
│  - user.repository.ts (Session Management Methods)              │
│  - course.repository.ts                                         │
│  - enrollment.repository.ts                                     │
│                                                                   │
│  Responsibilities:                                               │
│  • Database queries (TypeORM)                                   │
│  • CRUD operations                                              │
│  • Query optimization                                           │
│  • Data mapping                                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                              │
│                      PostgreSQL                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  users   │  │ courses  │  │enrollmnts│  │ modules  │       │
│  │          │  │          │  │          │  │          │       │
│  │ ★session │  │instructor│  │user/crs  │  │ course   │       │
│  │  fields  │  │  status  │  │ progress │  │ lessons  │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

## Single-Device Login Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    LOGIN REQUEST FLOW                            │
└─────────────────────────────────────────────────────────────────┘

1. Client Sends Credentials
   POST /api/auth/login
   { email, password }
         │
         ▼
2. Passport Local Strategy
   ┌────────────────────────┐
   │ Validate Credentials   │
   │ • Query User by Email  │
   │ • Compare Password Hash│
   │ • Check User Status    │
   └────────┬───────────────┘
            │ ✓ Valid
            ▼
3. ★★★ CRITICAL CHECK ★★★
   ┌────────────────────────────────┐
   │ Check currentSessionId in DB   │
   ├────────────────────────────────┤
   │ IF currentSessionId != NULL:   │
   │   ├─→ REJECT (409 Conflict)    │
   │   └─→ "Already logged in"      │
   │                                 │
   │ IF currentSessionId == NULL:   │
   │   └─→ PROCEED TO STEP 4        │
   └────────────────────────────────┘
            │
            ▼
4. Generate Session ID
   sessionId = UUID()
   "550e8400-e29b-41d4-a716-446655440000"
            │
            ▼
5. Store Session in Database
   UPDATE users SET
     currentSessionId = sessionId,
     sessionLastActivity = NOW(),
     deviceInfo = req.headers['user-agent'],
     lastLoginIp = req.ip
            │
            ▼
6. Generate JWT Tokens
   Payload: {
     userId,
     sessionId,  ★ EMBEDDED
     email,
     role
   }
   → accessToken (24h)
   → refreshToken (7d)
            │
            ▼
7. Return to Client
   {
     accessToken,
     refreshToken,
     user: { ... }
   }
```

## Authenticated Request Flow

```
┌─────────────────────────────────────────────────────────────────┐
│              PROTECTED ENDPOINT ACCESS FLOW                      │
└─────────────────────────────────────────────────────────────────┘

1. Client Request
   GET /api/users/profile
   Authorization: Bearer <JWT_TOKEN>
         │
         ▼
2. Extract JWT
   Authorization Header
   → Parse "Bearer <token>"
         │
         ▼
3. Verify JWT Signature
   ┌────────────────────────┐
   │ JWT.verify(token)      │
   │ • Check expiration     │
   │ • Validate signature   │
   │ • Extract payload      │
   └────────┬───────────────┘
            │
            ▼
4. Extract Session ID from Token
   payload = {
     userId: "abc-123",
     sessionId: "550e8400...",  ★
     email: "user@example.com",
     role: "Student"
   }
            │
            ▼
5. Query Database
   SELECT * FROM users
   WHERE id = payload.userId
         │
         ▼
6. ★★★ SESSION VALIDATION ★★★
   ┌─────────────────────────────────────┐
   │ Compare Session IDs                 │
   ├─────────────────────────────────────┤
   │ IF token.sessionId !=               │
   │    db.currentSessionId:             │
   │   ├─→ REJECT (401)                  │
   │   └─→ "Logged in elsewhere"         │
   │                                      │
   │ IF token.sessionId ==                │
   │    db.currentSessionId:             │
   │   └─→ PROCEED TO STEP 7             │
   └─────────────────────────────────────┘
            │
            ▼
7. Check Session Timeout
   age = NOW() - sessionLastActivity
   IF age > SESSION_TIMEOUT:
     ├─→ Clear Session
     └─→ REJECT (401)
   ELSE:
     └─→ PROCEED
            │
            ▼
8. Update Last Activity
   UPDATE users SET
     sessionLastActivity = NOW()
   WHERE id = userId
            │
            ▼
9. Attach User to Request
   req.user = userObject
            │
            ▼
10. Execute Controller Logic
    → Service → Repository → Database
            │
            ▼
11. Return Response
```

## Role-Based Access Control Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    RBAC ARCHITECTURE                             │
└─────────────────────────────────────────────────────────────────┘

User Roles Hierarchy:
┌──────────────────┐
│   Super-admin    │ ← Full system access
├──────────────────┤
│ University-admin │ ← University scope
├──────────────────┤
│   Instructor     │ ← Own courses
├──────────────────┤
│    Student       │ ← Enrolled courses
└──────────────────┘

Authorization Middleware Flow:
┌─────────────────────────────────────────┐
│ Request → authenticate()                │
│             │                            │
│             ▼                            │
│         Is Logged In?                   │
│         │         │                     │
│        No        Yes                    │
│         │         │                     │
│     401 Unauth   ▼                      │
│            authorize([roles])           │
│                  │                       │
│                  ▼                       │
│            Has Required Role?           │
│            │              │              │
│           Yes             No             │
│            │              │              │
│         ALLOW         403 Forbidden      │
└─────────────────────────────────────────┘
```

## Data Model Relationships

```
┌──────────────┐
│    User      │
├──────────────┤
│ id (PK)      │
│ email        │
│ password_hash│
│ role         │◄────────┐
│ status       │         │
│ ★sessionId   │         │
│ ★lastActivity│         │
└──────┬───────┘         │
       │                 │
       │ 1               │ 1
       │                 │
       │ *               │
┌──────▼───────┐   ┌────▼──────┐
│ Enrollment   │   │  Course   │
├──────────────┤   ├───────────┤
│ id (PK)      │   │ id (PK)   │
│ userId (FK)  │   │ title     │
│ courseId(FK) │───┤ instructor│
│ status       │ * │ status    │
│ progress     │   │ price     │
└──────────────┘   └─────┬─────┘
                         │ 1
                         │
                         │ *
                   ┌─────▼─────┐
                   │  Module   │
                   ├───────────┤
                   │ id (PK)   │
                   │ courseId  │
                   │ title     │
                   └─────┬─────┘
                         │ 1
                         │
                         │ *
                   ┌─────▼─────┐
                   │  Lesson   │
                   ├───────────┤
                   │ id (PK)   │
                   │ moduleId  │
                   │ type      │
                   │ content   │
                   └───────────┘
```

## Security Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY ARCHITECTURE                         │
└─────────────────────────────────────────────────────────────────┘

Layer 1: Network Security
├─ HTTPS/TLS
├─ CORS Policy
└─ Firewall Rules

Layer 2: Application Security
├─ Helmet.js (Security Headers)
├─ Rate Limiting
│  ├─ Login: 5 requests / 15 min
│  └─ API: 100 requests / 15 min
├─ Input Sanitization (XSS Prevention)
└─ Content Security Policy

Layer 3: Authentication
├─ Password Hashing (bcrypt, 12 rounds)
├─ JWT Tokens (signed, expiring)
└─ ★ Session Validation (Single-Device)

Layer 4: Authorization
├─ Role-Based Access Control (RBAC)
├─ Resource Ownership Checks
└─ Permission Validation

Layer 5: Data Security
├─ SQL Injection Prevention (TypeORM)
├─ Parameterized Queries
├─ Data Encryption (passwords)
└─ Soft Deletes (isDeleted flag)

Layer 6: Session Security
├─ ★ Single-Device Enforcement
├─ Session Timeout (30 min default)
├─ Activity Tracking
└─ Device/IP Logging
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                  PRODUCTION DEPLOYMENT                           │
└─────────────────────────────────────────────────────────────────┘

Internet
   │
   ▼
┌──────────────┐
│ Load Balancer│ (Nginx/AWS ALB)
└──────┬───────┘
       │
       ├─────────┬─────────┬─────────┐
       ▼         ▼         ▼         ▼
   ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐
   │ Node │  │ Node │  │ Node │  │ Node │
   │ App  │  │ App  │  │ App  │  │ App  │
   │ #1   │  │ #2   │  │ #3   │  │ #4   │
   └───┬──┘  └───┬──┘  └───┬──┘  └───┬──┘
       │         │         │         │
       └─────────┴─────────┴─────────┘
                 │
                 ▼
        ┌─────────────────┐
        │   PostgreSQL    │
        │   (Primary)     │
        └────────┬────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
   ┌─────────┐      ┌─────────┐
   │Replica 1│      │Replica 2│
   └─────────┘      └─────────┘

Additional Services:
├─ Redis (Session Store - if needed)
├─ S3/Cloud Storage (File Uploads)
├─ CloudWatch/DataDog (Monitoring)
└─ CloudFlare (CDN/DDoS Protection)
```

## Error Handling Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   ERROR HANDLING FLOW                            │
└─────────────────────────────────────────────────────────────────┘

Request
   │
   ▼
┌──────────────────┐
│ asyncHandler()   │ ← Wraps all route handlers
│ (catches errors) │
└────────┬─────────┘
         │ Error Thrown
         ▼
┌──────────────────┐
│ errorHandler()   │
├──────────────────┤
│ • Log Error      │ → Winston Logger → logs/error.log
│ • Sanitize       │
│ • Send Response  │
└────────┬─────────┘
         │
         ▼
    HTTP Response
    {
      success: false,
      message: "Error message",
      stack: "..." (dev only)
    }

Error Types:
├─ 400 Bad Request (Validation)
├─ 401 Unauthorized (Auth)
├─ 403 Forbidden (Permissions)
├─ 404 Not Found (Resource)
├─ 409 Conflict ★ (Already Logged In)
├─ 429 Too Many Requests (Rate Limit)
└─ 500 Internal Server Error
```

## Summary

This architecture provides:

✅ **Layered Architecture** - Clear separation of concerns
✅ **Single-Device Enforcement** - Session-based validation
✅ **Security in Depth** - Multiple security layers
✅ **Scalability** - Stateless design (JWT)
✅ **Maintainability** - Modular structure
✅ **Type Safety** - TypeScript throughout
✅ **Error Handling** - Centralized and comprehensive
✅ **Monitoring** - Logging and activity tracking
✅ **RBAC** - Fine-grained access control
✅ **Database Integrity** - TypeORM with migrations
