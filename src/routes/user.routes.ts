import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  listUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
  deleteUser,
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

const router = Router();

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticate, asyncHandler(getProfile));

/**
 * @route   PUT /api/users/profile
 * @desc    Update current user profile
 * @access  Private
 */
router.put(
  '/profile',
  authenticate,
  validate(updateProfileValidator),
  asyncHandler(updateProfile)
);

/**
 * @route   PUT /api/users/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put(
  '/change-password',
  authenticate,
  validate(changePasswordValidator),
  asyncHandler(changePassword)
);

/**
 * @route   GET /api/users
 * @desc    List all users (Admin only)
 * @access  Private (Super-admin)
 */
router.get('/list', authenticate, authorize(['Super-admin']), asyncHandler(listUsers));

/**
 * @route   GET /api/users/:userId
 * @desc    Get user by ID
 * @access  Private (Owner or Admin)
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
 * @route   DELETE /api/users/:userId
 * @desc    Delete user (Super-admin only)
 * @access  Private (Super-admin)
 */
router.delete('/:userId', authenticate, authorize(['Super-admin']), asyncHandler(deleteUser));

export default router;
