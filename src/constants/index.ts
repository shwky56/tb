/**
 * Application Constants
 */

// User roles hierarchy
export const USER_ROLES = {
  SUPER_ADMIN: 'Super-admin',
  UNIVERSITY_ADMIN: 'University-admin',
  INSTRUCTOR: 'Instructor',
  STUDENT: 'Student',
} as const;

// User statuses
export const USER_STATUSES = {
  ACTIVE: 'Active',
  PENDING: 'Pending',
  BANNED: 'Banned',
} as const;

// Course statuses
export const COURSE_STATUSES = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  ARCHIVED: 'Archived',
} as const;

// Course levels
export const COURSE_LEVELS = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
} as const;

// Enrollment statuses
export const ENROLLMENT_STATUSES = {
  PENDING: 'Pending',
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  DROPPED: 'Dropped',
  SUSPENDED: 'Suspended',
} as const;

// Lesson types
export const LESSON_TYPES = {
  VIDEO: 'Video',
  TEXT: 'Text',
  QUIZ: 'Quiz',
  ASSIGNMENT: 'Assignment',
  DOCUMENT: 'Document',
} as const;

// API response messages
export const MESSAGES = {
  // Success messages
  SUCCESS: {
    REGISTER: 'User registered successfully',
    LOGIN: 'Login successful',
    LOGOUT: 'Logout successful',
    PROFILE_UPDATED: 'Profile updated successfully',
    PASSWORD_CHANGED: 'Password changed successfully',
    COURSE_CREATED: 'Course created successfully',
    ENROLLMENT_SUCCESS: 'Successfully enrolled in course',
  },

  // Error messages
  ERROR: {
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'You do not have permission to access this resource',
    NOT_FOUND: 'Resource not found',
    VALIDATION_FAILED: 'Validation failed',
    INTERNAL_SERVER: 'Internal server error',
    EMAIL_EXISTS: 'Email already registered',
    INVALID_CREDENTIALS: 'Invalid email or password',
    ACCOUNT_DELETED: 'Account has been deleted',
    ACCOUNT_INACTIVE: 'Account is not active',
    ACCOUNT_BANNED: 'Account has been banned',
    ACCOUNT_PENDING: 'Account is pending approval',
    SESSION_EXPIRED: 'Session has expired',
    ALREADY_LOGGED_IN: 'You are already logged in from another device. Please log out of your other session first.',
    SESSION_INVALID: 'Session is invalid. You may have logged in from another device.',
  },
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  DEFAULT_OFFSET: 0,
} as const;

// File upload limits
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB in bytes
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/ogg'],
} as const;

// Session configuration
export const SESSION = {
  DEFAULT_TIMEOUT_MINUTES: 30,
  REFRESH_TOKEN_EXPIRY_DAYS: 7,
  ACCESS_TOKEN_EXPIRY_HOURS: 24,
} as const;

// Password requirements
export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL_CHAR: true,
} as const;
