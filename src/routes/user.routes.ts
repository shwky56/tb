import { Router, type Router as RouterType } from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  listUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  getUserSessions,
  killSession,
  adminForceLogout,
} from '../controllers/user.controller';
import {
  updateProfileValidator,
  changePasswordValidator,
  updateUserStatusValidator,
  updateUserRoleValidator,
} from '../validators/user.validator';
import { validate } from '../middleware/validation.middleware';
import { authenticate, authorize, authorizeOwnerOrAdmin } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router: RouterType = Router();

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get current user profile
 *     description: Retrieve the authenticated user's profile information
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/profile', authenticate, asyncHandler(getProfile));

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     tags:
 *       - Users
 *     summary: Update user profile
 *     description: Update the authenticated user's profile information including personal details, contact info, and bio
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 255
 *                 example: John Smith
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.smith@example.com
 *               university:
 *                 type: string
 *                 maxLength: 255
 *                 example: Harvard University
 *               phoneNumber:
 *                 type: string
 *                 maxLength: 20
 *                 pattern: '^[+]?[\d\s\-()]+$'
 *                 example: +1 (555) 123-4567
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: 1990-05-15
 *               address:
 *                 type: string
 *                 maxLength: 500
 *                 example: 123 Main Street, Apt 4B
 *               city:
 *                 type: string
 *                 maxLength: 100
 *                 example: New York
 *               country:
 *                 type: string
 *                 maxLength: 100
 *                 example: United States
 *               bio:
 *                 type: string
 *                 maxLength: 1000
 *                 example: Software developer passionate about education technology
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
 *                   example: Profile updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put(
  '/profile',
  authenticate,
  validate(updateProfileValidator),
  asyncHandler(updateProfile)
);

/**
 * @swagger
 * /api/users/change-password:
 *   put:
 *     tags:
 *       - Users
 *     summary: Change user password
 *     description: Change the password for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 example: OldPass123!
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: NewSecurePass123!
 *     responses:
 *       200:
 *         description: Password changed successfully
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
 *                   example: Password changed successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put(
  '/change-password',
  authenticate,
  validate(changePasswordValidator),
  asyncHandler(changePassword)
);

/**
 * @swagger
 * /api/users/list:
 *   get:
 *     tags:
 *       - Users
 *     summary: List all users
 *     description: Get a list of all users in the system (Super-admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [Student, Instructor, University-admin, Super-admin]
 *         description: Filter by role
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/list', authenticate, authorize(['Super-admin']), asyncHandler(listUsers));

/**
 * @swagger
 * /api/users/sessions:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user's active sessions
 *     description: Retrieve all active sessions for the authenticated user (supports 2-device limit)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sessions retrieved successfully
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
 *                   example: Sessions retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     sessions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           deviceInfo:
 *                             type: string
 *                             example: Chrome 120.0.0 / Windows 10
 *                           ipAddress:
 *                             type: string
 *                             example: 192.168.1.100
 *                           lastActivity:
 *                             type: string
 *                             format: date-time
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/sessions', authenticate, asyncHandler(getUserSessions));

/**
 * @swagger
 * /api/users/sessions/{sessionId}:
 *   delete:
 *     tags:
 *       - Users
 *     summary: Kill a specific session
 *     description: Terminate a specific session. Users can only terminate their own sessions.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Session ID to terminate
 *     responses:
 *       200:
 *         description: Session terminated successfully
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
 *                   example: Session terminated successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Session not found or already inactive
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/sessions/:sessionId', authenticate, asyncHandler(killSession));

/**
 * @swagger
 * /api/users/{userId}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user by ID
 *     description: Retrieve a specific user's information (Owner or Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:userId', authenticate, authorizeOwnerOrAdmin('userId'), asyncHandler(getUserById));

/**
 * @route   PUT /api/users/:userId/status
 * @desc    Update user status (Admin only)
 * @access  Private (Super-admin, University-admin)
 */
router.put(
  '/:userId/status',
  authenticate,
  authorize(['Super-admin', 'University-admin']),
  validate(updateUserStatusValidator),
  asyncHandler(updateUserStatus)
);

/**
 * @route   PUT /api/users/:userId/role
 * @desc    Update user role (Super-admin only)
 * @access  Private (Super-admin)
 */
router.put(
  '/:userId/role',
  authenticate,
  authorize(['Super-admin']),
  validate(updateUserRoleValidator),
  asyncHandler(updateUserRole)
);

/**
 * @swagger
 * /api/users/{userId}:
 *   delete:
 *     tags:
 *       - Users
 *     summary: Delete user
 *     description: Delete a user from the system (Super-admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
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
 *                   example: User deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete('/:userId', authenticate, authorize(['Super-admin']), asyncHandler(deleteUser));

/**
 * @swagger
 * /api/users/{userId}/force-logout:
 *   post:
 *     tags:
 *       - Users
 *     summary: Admin force logout user
 *     description: Force logout a user from all devices (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID to force logout
 *     responses:
 *       200:
 *         description: User logged out successfully from all devices
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
 *                   example: User logged out successfully from all devices
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post(
  '/:userId/force-logout',
  authenticate,
  authorize(['Super-admin', 'University-admin']),
  asyncHandler(adminForceLogout)
);

export default router;
