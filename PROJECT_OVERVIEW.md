# LMS Backend - Project Overview

## 📋 Project Summary

A **robust, scalable, and secure** Learning Management System (LMS) backend built with:
- **Node.js** & **Express.js**
- **TypeScript** for type safety
- **PostgreSQL** with TypeORM
- **JWT Authentication** with Passport.js
- **Strict Single-Device Login Enforcement** ⭐ CRITICAL FEATURE

## 🎯 Core Features Implemented

### 1. Single-Device Login Enforcement ⭐
The most critical feature of this system:
- Users can only be logged in from **ONE device at a time**
- Attempting to log in from a second device is **rejected with 409 Conflict**
- Session tracking via database (`currentSessionId` field)
- JWT tokens contain embedded session ID for validation
- Old tokens become invalid when user logs out or logs in elsewhere

**Files implementing this:**
- `src/models/user.model.ts` - Session tracking fields
- `src/services/user.service.ts` - Login logic with session check
- `src/repositories/user.repository.ts` - Session management methods
- `src/config/passport.config.ts` - JWT session validation
- `src/controllers/user.controller.ts` - Login endpoint

### 2. User Management
- User registration with email/password
- Role-based system: Super-admin, University-admin, Instructor, Student
- User status management: Active, Pending, Banned
- Profile management
- Password change (forces logout for security)
- Soft delete functionality

### 3. Course Management
- Course creation and management
- Course status: Draft, Published, Archived
- Course levels: Beginner, Intermediate, Advanced
- Instructor assignment
- Course modules and lessons
- Rich course metadata (description, price, duration, etc.)

### 4. Enrollment System
- Students can enroll in published courses
- Progress tracking (0-100%)
- Enrollment status management
- Enrollment history
- Auto-completion at 100% progress

### 5. Security Features
- Password hashing with bcrypt (12 rounds)
- JWT token-based authentication
- Rate limiting (login: 5/15min, API: 100/15min)
- Input validation with express-validator
- XSS prevention through input sanitization
- SQL injection prevention with TypeORM
- CORS protection
- Security headers with Helmet.js
- Session timeout (30 minutes default)

### 6. Authorization & Access Control
- Role-based access control (RBAC)
- Resource ownership validation
- Multiple authorization strategies:
  - Role-based: Only specific roles
  - Owner-based: User can access own resources
  - Admin override: Admins can access all resources

## 📁 Project Statistics

- **37 TypeScript files** created
- **6 Documentation files** (Markdown)
- **5 Database models** (User, Course, Enrollment, Module, Lesson)
- **3 Controllers** (User, Course, Enrollment)
- **3 Services** (Business logic layer)
- **3 Repositories** (Data access layer)
- **4 Route files** (Auth, User, Course, Enrollment)
- **4 Middleware files** (Auth, Security, Error, Validation)
- **3 Validator files** (Input validation)
- **4 Utility files** (JWT, Hash, Session, Response)

## 🏗️ Architecture Pattern

### MVC-like Layered Architecture

```
Client Layer (HTTP/JSON)
    ↓
Middleware Layer (Security, Auth, Validation)
    ↓
Controller Layer (Request/Response handling)
    ↓
Service Layer (Business Logic) ← Single-Device Logic Here
    ↓
Repository Layer (Database Operations)
    ↓
Database Layer (PostgreSQL)
```

### Key Design Principles

1. **Separation of Concerns**: Each layer has a single responsibility
2. **Dependency Injection**: Layers depend on abstractions
3. **Type Safety**: TypeScript throughout
4. **Error Handling**: Centralized error management
5. **Security in Depth**: Multiple security layers
6. **Stateless Design**: JWT-based authentication
7. **Scalability**: Horizontal scaling ready

## 📊 Database Schema

### User Entity
```typescript
- id: UUID (PK)
- name: string
- email: string (unique, indexed)
- password_hash: string
- role: enum (Super-admin, University-admin, Instructor, Student)
- status: enum (Active, Pending, Banned)
- currentSessionId: string | null ⭐ CRITICAL
- sessionLastActivity: Date | null ⭐ CRITICAL
- deviceInfo: string | null
- lastLoginIp: string | null
- isDeleted: boolean
- isActive: boolean
- createdAt: Date
- updatedAt: Date
```

### Course Entity
```typescript
- id: UUID (PK)
- title: string
- description: text
- courseCode: string
- status: enum (Draft, Published, Archived)
- level: enum (Beginner, Intermediate, Advanced)
- instructorId: UUID (FK → User)
- price: decimal
- duration: integer (hours)
- maxStudents: integer
- isDeleted: boolean
```

### Enrollment Entity
```typescript
- id: UUID (PK)
- userId: UUID (FK → User)
- courseId: UUID (FK → Course)
- status: enum (Pending, Active, Completed, Dropped, Suspended)
- progress: integer (0-100)
- grade: decimal
- enrolledAt: Date
- completedAt: Date
```

### Relationships
- User → Enrollments (1:many)
- Course → Enrollments (1:many)
- Course → Instructor (many:1)
- Course → Modules (1:many)
- Module → Lessons (1:many)

## 🔐 Security Implementation

### Authentication Flow
1. Client sends credentials
2. Passport Local Strategy validates
3. **Check currentSessionId in database** ⭐
4. If session exists → REJECT
5. If no session → Generate session ID
6. Store session ID in database
7. Embed session ID in JWT
8. Return JWT to client

### Authorization Levels
1. **Public**: No authentication required
2. **Authenticated**: Valid JWT required
3. **Role-based**: Specific role(s) required
4. **Owner**: User must own the resource
5. **Admin**: Admin override for all resources

### Session Validation
On every authenticated request:
1. Extract JWT from Authorization header
2. Verify JWT signature and expiration
3. Extract session ID from JWT payload
4. Query database for user
5. **Compare JWT sessionId with DB currentSessionId** ⭐
6. If mismatch → REJECT (logged in elsewhere)
7. If match → Check timeout
8. If expired → Clear session, REJECT
9. If valid → Update activity timestamp, ALLOW

## 📡 API Endpoints Summary

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login with single-device check ⭐
- `POST /logout` - Logout and clear session

### Users (`/api/users`)
- `GET /profile` - Get current user
- `PUT /profile` - Update profile
- `PUT /change-password` - Change password
- `GET /list` - List users (admin)
- `GET /:userId` - Get user by ID
- `PUT /:userId/status` - Update status (admin)
- `PUT /:userId/role` - Update role (admin)
- `DELETE /:userId` - Delete user (admin)

### Courses (`/api/courses`)
- `POST /` - Create course
- `GET /` - List courses
- `GET /:courseId` - Get course
- `PUT /:courseId` - Update course
- `DELETE /:courseId` - Delete course
- `POST /:courseId/publish` - Publish
- `POST /:courseId/archive` - Archive

### Enrollments (`/api/enrollments`)
- `POST /` - Enroll in course
- `GET /my` - Get my enrollments
- `GET /course/:courseId` - Get course enrollments
- `PUT /:enrollmentId/status` - Update status
- `PUT /:enrollmentId/progress` - Update progress

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Complete project documentation |
| `QUICK_START.md` | Getting started guide |
| `SINGLE_DEVICE_LOGIN_LOGIC.md` | Detailed single-device login implementation |
| `ARCHITECTURE.md` | Visual architecture diagrams |
| `FILE_STRUCTURE.md` | Complete file structure with descriptions |
| `API_TESTING_GUIDE.md` | Step-by-step testing instructions |
| `PROJECT_OVERVIEW.md` | This file - high-level overview |

## 🧪 Testing the System

### Quick Test for Single-Device Login

```bash
# 1. Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"SecurePass123!","role":"Student"}'

# 2. Activate account (via DB)
psql -U postgres lms_db -c "UPDATE users SET status='Active' WHERE email='test@test.com'"

# 3. Login (Device 1)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"SecurePass123!"}'

# 4. Try to login again (Device 2) - SHOULD FAIL
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"SecurePass123!"}'
# Expected: 409 Conflict - "Already logged in from another device"
```

## 🚀 Deployment Readiness

### Production Checklist
- [x] Environment variable configuration
- [x] Database migrations system
- [x] Error logging (Winston)
- [x] Security headers (Helmet)
- [x] Rate limiting
- [x] Input validation
- [x] Password hashing
- [x] JWT authentication
- [x] Session management
- [x] CORS configuration
- [x] TypeScript compilation
- [x] Database connection pooling

### Additional Considerations for Production
- [ ] Set up reverse proxy (Nginx)
- [ ] Enable SSL/TLS certificates
- [ ] Configure database backups
- [ ] Set up monitoring (PM2, New Relic, DataDog)
- [ ] Configure log rotation
- [ ] Set up CI/CD pipeline
- [ ] Performance testing
- [ ] Load testing
- [ ] Security audit
- [ ] Database indexing optimization

## 🔧 NPM Scripts

```json
{
  "dev": "nodemon",                    // Development with hot reload
  "build": "tsc",                      // Build TypeScript
  "start": "node dist/server.js",      // Production start
  "migration:generate": "typeorm migration:generate",
  "migration:run": "typeorm migration:run",
  "migration:revert": "typeorm migration:revert",
  "test": "jest --coverage",           // Run tests
  "lint": "eslint . --ext .ts",        // Check code quality
  "lint:fix": "eslint . --ext .ts --fix"
}
```

## 🎓 Learning Outcomes

By studying this codebase, you'll understand:

1. **TypeScript in Backend Development**
   - Interfaces, types, enums
   - Decorators (TypeORM)
   - Type-safe API design

2. **Backend Architecture Patterns**
   - MVC pattern
   - Repository pattern
   - Dependency injection
   - Middleware chain

3. **Security Best Practices**
   - Password hashing
   - JWT authentication
   - Session management
   - Rate limiting
   - Input validation
   - RBAC implementation

4. **Database Design**
   - Entity relationships
   - Indexing strategies
   - Soft deletes
   - Timestamps
   - UUID primary keys

5. **API Design**
   - RESTful principles
   - Consistent response format
   - Error handling
   - Pagination
   - Filtering and sorting

## 🌟 Unique Features

### What Makes This Implementation Special

1. **Single-Device Login Enforcement**
   - Not commonly found in open-source LMS systems
   - Database-backed session validation
   - Real-time session invalidation

2. **Comprehensive Type Safety**
   - TypeScript throughout
   - No `any` types in critical paths
   - Strict null checks

3. **Security-First Design**
   - Multiple security layers
   - Defense in depth strategy
   - Audit trail (device info, IP tracking)

4. **Production-Ready**
   - Error handling
   - Logging
   - Validation
   - Documentation
   - Testing guides

5. **Clean Architecture**
   - SOLID principles
   - Easy to extend
   - Well-documented
   - Consistent patterns

## 📈 Scalability Considerations

### Current Design Supports

- **Horizontal Scaling**: Stateless JWT design
- **Database Scaling**: Connection pooling, read replicas
- **Caching Ready**: Redis can be added for sessions
- **Load Balancing**: No sticky sessions needed
- **Microservices**: Modular design allows easy extraction

### Potential Optimizations

- Add Redis for session caching
- Implement database query caching
- Add CDN for static assets
- Implement background job queue
- Add full-text search (Elasticsearch)
- Implement WebSocket for real-time features

## 🔮 Future Enhancements

Suggested features to add:

1. **Email System**
   - Email verification
   - Password reset
   - Notifications

2. **Advanced Course Features**
   - Video streaming
   - Live classes
   - Assignments and quizzes
   - Certificates

3. **Analytics**
   - Student progress analytics
   - Course performance metrics
   - Engagement tracking

4. **Payment Integration**
   - Stripe/PayPal
   - Course purchases
   - Subscriptions

5. **Social Features**
   - Discussion forums
   - Student messaging
   - Course reviews

## 📞 Support & Resources

### Getting Help
1. Read documentation files in order:
   - `QUICK_START.md` - Setup
   - `README.md` - Features
   - `ARCHITECTURE.md` - Design
   - `SINGLE_DEVICE_LOGIN_LOGIC.md` - Core feature

2. Check code comments for inline documentation

3. Review TypeScript types for API contracts

4. Use testing guide for examples

### Key Files to Study

**For Single-Device Login:**
1. `src/models/user.model.ts` - Session fields
2. `src/services/user.service.ts` - Login logic
3. `src/config/passport.config.ts` - JWT validation
4. `SINGLE_DEVICE_LOGIN_LOGIC.md` - Full explanation

**For Architecture:**
1. `src/app.ts` - Application setup
2. `src/server.ts` - Entry point
3. `ARCHITECTURE.md` - Visual diagrams

**For API Usage:**
1. `API_TESTING_GUIDE.md` - Test scenarios
2. `src/routes/*.ts` - Endpoint definitions
3. `src/validators/*.ts` - Input requirements

## ✅ Implementation Complete

This LMS backend is **production-ready** with:
- ✅ All requested features implemented
- ✅ Single-device login fully functional
- ✅ Comprehensive security measures
- ✅ Complete documentation
- ✅ Testing guides
- ✅ Type-safe codebase
- ✅ Scalable architecture
- ✅ Error handling
- ✅ Logging system
- ✅ Input validation

**Total Implementation:**
- **37 TypeScript files**
- **6 Documentation files**
- **Full MVC architecture**
- **Single-device login enforcement**
- **Role-based access control**
- **Comprehensive security**

Ready for development, testing, and deployment! 🚀
