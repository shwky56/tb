# LMS Backend - Complete File Structure

## Directory Tree

```
lms-backend/
│
├── src/                                    # Main source code directory
│   │
│   ├── config/                             # Configuration files
│   │   ├── database.config.ts              # TypeORM database connection setup
│   │   ├── passport.config.ts              # Passport.js authentication strategies
│   │   └── logger.config.ts                # Winston logger configuration
│   │
│   ├── controllers/                        # Request handlers (MVC Controllers)
│   │   ├── user.controller.ts              # User management endpoints
│   │   ├── course.controller.ts            # Course management endpoints
│   │   └── enrollment.controller.ts        # Enrollment management endpoints
│   │
│   ├── services/                           # Business logic layer
│   │   ├── user.service.ts                 # User business logic & single-device login
│   │   ├── course.service.ts               # Course business logic
│   │   └── enrollment.service.ts           # Enrollment business logic
│   │
│   ├── repositories/                       # Database interaction layer
│   │   ├── user.repository.ts              # User database operations
│   │   ├── course.repository.ts            # Course database operations
│   │   └── enrollment.repository.ts        # Enrollment database operations
│   │
│   ├── models/                             # TypeORM entity definitions
│   │   ├── user.model.ts                   # User entity with session fields
│   │   ├── course.model.ts                 # Course entity
│   │   ├── enrollment.model.ts             # Enrollment entity
│   │   ├── module.model.ts                 # Module entity (course sections)
│   │   └── lesson.model.ts                 # Lesson entity
│   │
│   ├── middleware/                         # Express middleware functions
│   │   ├── auth.middleware.ts              # Authentication & authorization
│   │   ├── validation.middleware.ts        # Request validation handler
│   │   ├── error.middleware.ts             # Error handling & async wrapper
│   │   └── security.middleware.ts          # Security headers & rate limiting
│   │
│   ├── routes/                             # Express route definitions
│   │   ├── auth.routes.ts                  # Authentication routes
│   │   ├── user.routes.ts                  # User management routes
│   │   ├── course.routes.ts                # Course management routes
│   │   ├── enrollment.routes.ts            # Enrollment routes
│   │   └── index.ts                        # Route aggregator
│   │
│   ├── validators/                         # Input validation schemas
│   │   ├── user.validator.ts               # User input validation rules
│   │   ├── course.validator.ts             # Course input validation rules
│   │   └── enrollment.validator.ts         # Enrollment input validation rules
│   │
│   ├── utils/                              # Utility/helper functions
│   │   ├── jwt.util.ts                     # JWT generation & verification
│   │   ├── hash.util.ts                    # Password hashing utilities
│   │   ├── session.util.ts                 # Session ID & device info extraction
│   │   └── response.util.ts                # Standardized API response helpers
│   │
│   ├── types/                              # TypeScript type definitions
│   │   └── express.d.ts                    # Express request augmentation
│   │
│   ├── constants/                          # Application constants
│   │   └── index.ts                        # Enums, messages, configurations
│   │
│   ├── database/                           # Database-related files
│   │   ├── migrations/                     # TypeORM migrations
│   │   └── seeds/                          # Database seed files
│   │
│   ├── app.ts                              # Express app configuration
│   └── server.ts                           # Application entry point
│
├── logs/                                   # Application logs directory
│   ├── error.log                           # Error logs
│   └── combined.log                        # All logs
│
├── uploads/                                # File uploads directory
│   └── .gitkeep
│
├── tests/                                  # Test files
│   ├── unit/                               # Unit tests
│   ├── integration/                        # Integration tests
│   └── e2e/                                # End-to-end tests
│
├── .env                                    # Environment variables (gitignored)
├── .env.example                            # Environment variables template
├── .gitignore                              # Git ignore rules
├── .eslintrc.json                          # ESLint configuration
├── .prettierrc.json                        # Prettier configuration
├── jest.config.js                          # Jest test configuration
├── nodemon.json                            # Nodemon configuration
├── package.json                            # NPM dependencies & scripts
├── tsconfig.json                           # TypeScript configuration
├── README.md                               # Project documentation
├── SINGLE_DEVICE_LOGIN_LOGIC.md            # Single-device login detailed docs
└── FILE_STRUCTURE.md                       # This file
```

## File Descriptions by Layer

### Configuration Layer (`src/config/`)

| File | Purpose | Key Features |
|------|---------|--------------|
| `database.config.ts` | Database connection setup | TypeORM DataSource, connection pooling |
| `passport.config.ts` | Authentication strategies | Local & JWT strategies, session validation |
| `logger.config.ts` | Logging configuration | Winston logger, file & console output |

### Controller Layer (`src/controllers/`)

| File | Purpose | Key Endpoints |
|------|---------|---------------|
| `user.controller.ts` | User management | register, login, logout, profile, listUsers |
| `course.controller.ts` | Course management | create, update, delete, list, publish |
| `enrollment.controller.ts` | Enrollment management | enroll, progress, status updates |

### Service Layer (`src/services/`)

| File | Purpose | Critical Logic |
|------|---------|----------------|
| `user.service.ts` | User business logic | **Single-device login enforcement**, password management |
| `course.service.ts` | Course business logic | Course lifecycle management |
| `enrollment.service.ts` | Enrollment business logic | Enrollment validation, progress tracking |

### Repository Layer (`src/repositories/`)

| File | Purpose | Key Methods |
|------|---------|-------------|
| `user.repository.ts` | User database operations | setSession(), clearSession(), hasActiveSession() |
| `course.repository.ts` | Course database operations | CRUD operations with filtering |
| `enrollment.repository.ts` | Enrollment database operations | User/course enrollment queries |

### Model Layer (`src/models/`)

| File | Entity | Key Fields |
|------|--------|-----------|
| `user.model.ts` | User | **currentSessionId**, sessionLastActivity, role, status |
| `course.model.ts` | Course | title, instructor, status, price |
| `enrollment.model.ts` | Enrollment | user, course, progress, status |
| `module.model.ts` | Module | course sections/chapters |
| `lesson.model.ts` | Lesson | individual learning units |

### Middleware Layer (`src/middleware/`)

| File | Purpose | Key Functions |
|------|---------|---------------|
| `auth.middleware.ts` | Authentication & authorization | authenticate(), authorize(), authorizeOwnerOrAdmin() |
| `validation.middleware.ts` | Input validation | validate() wrapper for express-validator |
| `error.middleware.ts` | Error handling | errorHandler(), asyncHandler() |
| `security.middleware.ts` | Security | Rate limiting, XSS prevention, helmet |

### Route Layer (`src/routes/`)

| File | Prefix | Purpose |
|------|--------|---------|
| `auth.routes.ts` | `/api/auth` | Authentication endpoints |
| `user.routes.ts` | `/api/users` | User management endpoints |
| `course.routes.ts` | `/api/courses` | Course management endpoints |
| `enrollment.routes.ts` | `/api/enrollments` | Enrollment endpoints |
| `index.ts` | `/api` | Route aggregator & health check |

### Validator Layer (`src/validators/`)

| File | Purpose | Validations |
|------|---------|-------------|
| `user.validator.ts` | User input validation | Email format, password strength, role validation |
| `course.validator.ts` | Course input validation | Title length, price validation, level validation |
| `enrollment.validator.ts` | Enrollment input validation | UUID validation, status validation |

### Utility Layer (`src/utils/`)

| File | Purpose | Key Functions |
|------|---------|---------------|
| `jwt.util.ts` | JWT operations | generateAccessToken(), verifyAccessToken() |
| `hash.util.ts` | Password hashing | hashPassword(), comparePassword() |
| `session.util.ts` | Session management | generateSessionId(), extractDeviceInfo() |
| `response.util.ts` | API responses | sendSuccess(), sendError(), sendPaginated() |

## Data Flow Architecture

### 1. Authentication Request Flow
```
Client Request
    ↓
Routes (auth.routes.ts)
    ↓
Validators (user.validator.ts)
    ↓
Controllers (user.controller.ts)
    ↓
Passport Strategy (passport.config.ts)
    ↓
Services (user.service.ts) ← SINGLE-DEVICE CHECK
    ↓
Repositories (user.repository.ts)
    ↓
Database (PostgreSQL)
    ↓
Response to Client
```

### 2. Authenticated Request Flow
```
Client Request with JWT
    ↓
Routes (*.routes.ts)
    ↓
Auth Middleware (auth.middleware.ts)
    ↓
Passport JWT Strategy ← SESSION VALIDATION
    ↓
Controllers
    ↓
Services
    ↓
Repositories
    ↓
Database
    ↓
Response to Client
```

### 3. Single-Device Login Flow
```
Login Attempt
    ↓
Validate Credentials (passport.config.ts)
    ↓
Check currentSessionId in DB (user.service.ts)
    ├─→ IF NOT NULL: REJECT (409 Conflict)
    └─→ IF NULL: Generate Session ID
                ↓
          Store in Database
                ↓
          Embed in JWT
                ↓
          Return to Client
```

## Environment Variables Required

### Database
- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`

### JWT
- `JWT_SECRET`, `JWT_EXPIRES_IN`
- `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES_IN`

### Server
- `NODE_ENV`, `PORT`, `API_VERSION`

### Security
- `BCRYPT_ROUNDS`, `SESSION_TIMEOUT_MINUTES`
- `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS`

### Optional
- `CORS_ORIGIN`, `LOG_LEVEL`, `LOG_FILE_PATH`

## Key Design Patterns

### 1. Separation of Concerns
- **Controllers:** Handle HTTP requests/responses
- **Services:** Contain business logic
- **Repositories:** Handle database operations
- **Models:** Define data structure

### 2. Dependency Injection
- Services inject repositories
- Controllers inject services
- Loose coupling between layers

### 3. Middleware Chain
```
Request → Security → Rate Limit → Auth → Validation → Controller → Response
```

### 4. Error Handling
- Centralized error handler
- Async wrapper for route handlers
- Consistent error response format

### 5. Repository Pattern
- Abstract database operations
- Easy to test and mock
- ORM-agnostic design

## Security Features by File

| File | Security Feature |
|------|------------------|
| `user.model.ts` | Session tracking fields |
| `passport.config.ts` | JWT session validation |
| `auth.middleware.ts` | Role-based access control |
| `security.middleware.ts` | Rate limiting, XSS prevention |
| `hash.util.ts` | Bcrypt password hashing |
| `jwt.util.ts` | Secure token generation |
| `user.service.ts` | **Single-device enforcement** |

## Testing Strategy

### Unit Tests (`tests/unit/`)
- Test individual functions
- Mock dependencies
- Test utilities, services

### Integration Tests (`tests/integration/`)
- Test API endpoints
- Test database operations
- Test middleware chains

### E2E Tests (`tests/e2e/`)
- Test complete user flows
- Test single-device login scenarios
- Test authentication flows

## Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET`
- [ ] Set `DB_SYNCHRONIZE=false`
- [ ] Configure proper CORS origins
- [ ] Set up SSL/TLS
- [ ] Enable rate limiting
- [ ] Configure logging
- [ ] Set up database backups
- [ ] Monitor session timeouts
- [ ] Test single-device login

## Summary

This file structure implements:
- ✅ **MVC-like architecture** with clear separation
- ✅ **Single-device login enforcement**
- ✅ **Role-based access control**
- ✅ **Comprehensive security middleware**
- ✅ **Input validation**
- ✅ **Error handling**
- ✅ **Logging**
- ✅ **Type safety with TypeScript**
- ✅ **Scalable and maintainable codebase**
