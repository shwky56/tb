import { Router } from 'express';
import { registerUser, loginUser, logoutUser } from '../controllers/user.controller';
import { registerValidator, loginValidator } from '../validators/user.validator';
import { validate } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { loginRateLimiter } from '../middleware/security.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validate(registerValidator), asyncHandler(registerUser));

/**
 * @route   POST /api/auth/login
 * @desc    Login user with single-device enforcement
 * @access  Public
 */
router.post('/login', loginRateLimiter, validate(loginValidator), asyncHandler(loginUser));

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and clear session
 * @access  Private
 */
router.post('/logout', authenticate, asyncHandler(logoutUser));

export default router;
