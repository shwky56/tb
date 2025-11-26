# LMS Backend - Course Management System

A robust, scalable, and secure Learning Management System (LMS) backend built with Node.js, Express, TypeScript, and PostgreSQL.

## Features

### Core Features
- **User Management** with role-based access control (Super-admin, University-admin, Instructor, Student)
- **Strict Single-Device Login Enforcement** - Users can only be logged in from one device at a time
- **Course Management** - Create, update, publish, and archive courses
- **Enrollment System** - Students can enroll in courses and track progress
- **Secure Authentication** - JWT-based authentication with Passport.js
- **Session Management** - Automatic session timeout and activity tracking

### Security Features
- Single-device login enforcement
- Password hashing with bcrypt
- JWT token-based authentication
- Rate limiting to prevent brute force attacks
- Input sanitization to prevent XSS attacks
- Helmet.js for security headers
- CORS protection
- SQL injection prevention with TypeORM

## Project Structure

```
lms-backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── database.config.ts
│   │   ├── passport.config.ts
│   │   └── logger.config.ts
│   ├── controllers/         # Request handlers
│   │   ├── user.controller.ts
│   │   ├── course.controller.ts
│   │   └── enrollment.controller.ts
│   ├── services/            # Business logic
│   │   ├── user.service.ts
│   │   ├── course.service.ts
│   │   └── enrollment.service.ts
│   ├── repositories/        # Database operations
│   │   ├── user.repository.ts
│   │   ├── course.repository.ts
│   │   └── enrollment.repository.ts
│   ├── models/              # Database models
│   │   ├── user.model.ts
│   │   ├── course.model.ts
│   │   ├── enrollment.model.ts
│   │   ├── module.model.ts
│   │   └── lesson.model.ts
│   ├── middleware/          # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── security.middleware.ts
│   ├── routes/              # API routes
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── course.routes.ts
│   │   ├── enrollment.routes.ts
│   │   └── index.ts
│   ├── validators/          # Input validation
│   │   ├── user.validator.ts
│   │   ├── course.validator.ts
│   │   └── enrollment.validator.ts
│   ├── utils/               # Utility functions
│   │   ├── jwt.util.ts
│   │   ├── hash.util.ts
│   │   ├── session.util.ts
│   │   └── response.util.ts
│   ├── types/               # TypeScript type definitions
│   │   └── express.d.ts
│   ├── constants/           # Application constants
│   │   └── index.ts
│   ├── database/            # Database migrations and seeds
│   │   ├── migrations/
│   │   └── seeds/
│   ├── app.ts               # Express app configuration
│   └── server.ts            # Server entry point
├── logs/                    # Application logs
├── uploads/                 # File uploads directory
├── tests/                   # Test files
├── .env.example             # Environment variables template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd lms-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:
```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=lms_db
JWT_SECRET=your_super_secret_jwt_key
JWT_REFRESH_SECRET=your_refresh_token_secret
```

4. **Create PostgreSQL database**
```bash
createdb lms_db
```

5. **Run database migrations**
```bash
npm run migration:run
```

6. **Start the development server**
```bash
npm run dev
```

The server will start at `http://localhost:5000`

## API Documentation

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "Student",
  "university": "MIT"
}
```

#### Login (Single-Device Enforcement)
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Important:** If a user is already logged in from another device, this endpoint will return a 409 Conflict error.

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <access_token>
```

### User Endpoints

#### Get Profile
```http
GET /api/users/profile
Authorization: Bearer <access_token>
```

#### Update Profile
```http
PUT /api/users/profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "John Updated",
  "university": "Harvard"
}
```

#### List Users (Admin Only)
```http
GET /api/users/list?role=Student&limit=20&offset=0
Authorization: Bearer <access_token>
```

### Course Endpoints

#### Create Course
```http
POST /api/courses
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Introduction to TypeScript",
  "description": "Learn TypeScript from scratch",
  "level": "Beginner",
  "price": 99.99
}
```

#### List Courses
```http
GET /api/courses?status=Published&limit=20&offset=0
```

### Enrollment Endpoints

#### Enroll in Course
```http
POST /api/enrollments
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "courseId": "uuid-of-course"
}
```

## Single-Device Login Implementation

### How It Works

1. **Login Process:**
   - User provides email and password
   - System validates credentials using Passport Local Strategy
   - **CRITICAL CHECK:** System checks if `currentSessionId` in database is NULL
   - If session exists, login is **REJECTED** with error message
   - If no session, generate unique session ID (UUID)
   - Store session ID in database with device info and IP
   - Generate JWT token with embedded session ID
   - Return token to client

2. **Request Validation:**
   - Every authenticated request validates JWT token
   - Passport JWT Strategy extracts session ID from token
   - Compares token session ID with `currentSessionId` in database
   - If mismatch, request is rejected (user logged in elsewhere)
   - If match, update `sessionLastActivity` timestamp

3. **Logout:**
   - Clears `currentSessionId` in database
   - User can now log in from another device

4. **Session Timeout:**
   - Configurable timeout (default: 30 minutes)
   - Inactive sessions are automatically cleared
   - User must log in again after timeout

### Database Fields for Session Management

```typescript
currentSessionId: string | null;     // Active session UUID
sessionLastActivity: Date | null;    // Last activity timestamp
deviceInfo: string | null;           // Browser/device information
lastLoginIp: string | null;          // IP address of login
```

## Development

### Build
```bash
npm run build
```

### Run in Production
```bash
npm start
```

### Run Tests
```bash
npm test
```

### Linting
```bash
npm run lint
npm run lint:fix
```

## User Roles and Permissions

### Super-admin
- Full system access
- Manage all users, courses, and enrollments
- Change user roles and statuses
- System configuration

### University-admin
- Manage users within their university
- Manage courses within their university
- View analytics and reports

### Instructor
- Create and manage their own courses
- View enrolled students
- Grade assignments
- Manage course content

### Student
- Browse and enroll in courses
- Track learning progress
- Submit assignments
- View grades

## Security Best Practices

1. **Environment Variables:** Never commit `.env` file
2. **Password Requirements:** Minimum 8 characters with uppercase, lowercase, number, and special character
3. **Rate Limiting:** Login endpoint limited to 5 attempts per 15 minutes
4. **Session Management:** Automatic timeout after 30 minutes of inactivity
5. **Input Validation:** All inputs validated using express-validator
6. **SQL Injection Prevention:** TypeORM with parameterized queries
7. **XSS Prevention:** Input sanitization middleware
8. **CORS:** Configured for specific origins only

## Error Handling

The application uses a centralized error handling system:

- **400 Bad Request:** Validation errors, invalid input
- **401 Unauthorized:** Missing or invalid authentication
- **403 Forbidden:** Insufficient permissions
- **404 Not Found:** Resource not found
- **409 Conflict:** Already logged in (single-device enforcement)
- **500 Internal Server Error:** Server errors

## Logging

Logs are stored in the `logs/` directory:
- `error.log` - Error-level logs
- `combined.log` - All logs

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License
# tb
