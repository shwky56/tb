import { Router, type Router as RouterType } from 'express';
import { registerUser, loginUser, logoutUser } from '../controllers/user.controller';
import { registerValidator, loginValidator } from '../validators/user.validator';
import { validate } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { loginRateLimiter } from '../middleware/security.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router: RouterType = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register a new user
 *     description: |
 *       Create a new user account in the Learning Management System.
 *       
 *       **Features:**
 *       - Automatic JWT token generation upon successful registration
 *       - Email uniqueness validation
 *       - Password strength enforcement
 *       - Role-based access control
 *       - Default user status set to 'Pending' (requires admin activation)
 *       
 *       **Password Requirements:**
 *       - Minimum 8 characters
 *       - At least one uppercase letter
 *       - At least one lowercase letter
 *       - At least one number
 *       - At least one special character (@$!%*?&)
 *       
 *       **Available Roles:**
 *       - `Student` (default) - Regular learner access
 *       - `Instructor` - Course creation and management
 *       - `University-admin` - University-level administration
 *       - `Super-admin` - Full system access
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 255
 *                 description: Full name of the user
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 maxLength: 255
 *                 description: Unique email address (will be normalized)
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 pattern: ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$
 *                 description: Strong password meeting complexity requirements
 *                 example: SecurePass123!
 *               role:
 *                 type: string
 *                 enum: [Student, Instructor, University-admin, Super-admin]
 *                 default: Student
 *                 description: User role determining access level
 *                 example: Student
 *               university:
 *                 type: string
 *                 maxLength: 255
 *                 description: Optional university affiliation
 *                 example: MIT
 *           examples:
 *             student:
 *               summary: Register as Student
 *               value:
 *                 name: Jane Smith
 *                 email: jane.smith@university.edu
 *                 password: SecurePass123!
 *                 role: Student
 *                 university: Harvard University
 *             instructor:
 *               summary: Register as Instructor
 *               value:
 *                 name: Dr. Robert Johnson
 *                 email: r.johnson@university.edu
 *                 password: TeachPass456!
 *                 role: Instructor
 *                 university: Stanford University
 *     responses:
 *       201:
 *         description: User registered successfully. Returns user data and JWT token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                           example: 550e8400-e29b-41d4-a716-446655440000
 *                         name:
 *                           type: string
 *                           example: John Doe
 *                         email:
 *                           type: string
 *                           example: john.doe@example.com
 *                         role:
 *                           type: string
 *                           example: Student
 *                         university:
 *                           type: string
 *                           nullable: true
 *                           example: MIT
 *                         status:
 *                           type: string
 *                           enum: [Active, Pending, Banned]
 *                           example: Pending
 *                         isActive:
 *                           type: boolean
 *                           example: true
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: 2025-11-28T01:00:00.000Z
 *                     token:
 *                       type: string
 *                       description: JWT authentication token (valid for session duration)
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6ImpvaG4uZG9lQGV4YW1wbGUuY29tIiwicm9sZSI6IlN0dWRlbnQiLCJpYXQiOjE3MzI3NTIwMDAsImV4cCI6MTczMjgzODQwMH0.signature
 *             examples:
 *               success:
 *                 summary: Successful registration
 *                 value:
 *                   success: true
 *                   message: User registered successfully
 *                   data:
 *                     user:
 *                       id: 550e8400-e29b-41d4-a716-446655440000
 *                       name: John Doe
 *                       email: john.doe@example.com
 *                       role: Student
 *                       university: MIT
 *                       status: Pending
 *                       isActive: true
 *                       createdAt: 2025-11-28T01:00:00.000Z
 *                     token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Validation error - Invalid or missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Validation failed
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                         example: password
 *                       message:
 *                         type: string
 *                         example: Password must contain uppercase, lowercase, number, and special character
 *             examples:
 *               weakPassword:
 *                 summary: Weak password error
 *                 value:
 *                   success: false
 *                   message: Validation failed
 *                   errors:
 *                     - field: password
 *                       message: Password must contain uppercase, lowercase, number, and special character
 *               invalidEmail:
 *                 summary: Invalid email format
 *                 value:
 *                   success: false
 *                   message: Validation failed
 *                   errors:
 *                     - field: email
 *                       message: Invalid email format
 *               missingFields:
 *                 summary: Missing required fields
 *                 value:
 *                   success: false
 *                   message: Validation failed
 *                   errors:
 *                     - field: name
 *                       message: Name is required
 *                     - field: email
 *                       message: Email is required
 *                     - field: password
 *                       message: Password is required
 *       409:
 *         description: Conflict - Email address already registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Email already exists
 *             example:
 *               success: false
 *               message: Email already exists
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
router.post('/register', validate(registerValidator), asyncHandler(registerUser));

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login user
 *     description: Authenticate user and receive JWT token. Enforces single-device login.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePass123!
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Too many login attempts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', loginRateLimiter, validate(loginValidator), asyncHandler(loginUser));

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Logout user
 *     description: Logout the current user and invalidate the session
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Logout successful
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/logout', authenticate, asyncHandler(logoutUser));

export default router;
