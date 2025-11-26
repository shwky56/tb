import { Request, Response } from 'express';
import passport from 'passport';
import { UserService } from '../services/user.service';
import { sendSuccess, sendError } from '../utils/response.util';
import { extractDeviceInfo, extractIpAddress } from '../utils/session.util';
import { UserRole, UserStatus } from '../models/user.model';

const userService = new UserService();

/**
 * Register a new user
 * POST /api/auth/register
 */
export const registerUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name, email, password, role, university } = req.body;

    const user = await userService.createUser({
      name,
      email,
      password,
      role,
      university,
    });

    return sendSuccess(
      res,
      'User registered successfully. Your account is pending approval.',
      { user },
      201
    );
  } catch (error: any) {
    return sendError(res, error.message || 'Registration failed', undefined, 400);
  }
};

/**
 * CRITICAL: Login user with single-device enforcement
 * POST /api/auth/login
 *
 * Login Flow:
 * 1. Passport Local Strategy validates email and password
 * 2. Check if user already has an active session (currentSessionId in DB)
 * 3. If active session exists, REJECT login with error message
 * 4. If no active session, generate new unique session ID
 * 5. Store session ID in database along with device info and IP
 * 6. Generate JWT tokens with embedded session ID
 * 7. Return tokens to client
 *
 * Session Validation on Subsequent Requests:
 * - Passport JWT Strategy extracts session ID from token
 * - Compares it with currentSessionId in database
 * - If mismatch, user logged in from different device, reject request
 */
export const loginUser = async (req: Request, res: Response): Promise<Response> => {
  return new Promise((resolve) => {
    // Step 1 & 2: Use Passport Local Strategy to validate credentials
    passport.authenticate('local', { session: false }, async (err: Error, user: any, info: any) => {
      try {
        // Handle authentication errors
        if (err) {
          return resolve(sendError(res, 'Internal server error during login', undefined, 500));
        }

        // Handle invalid credentials
        if (!user) {
          const message = info?.message || 'Invalid credentials';
          return resolve(sendError(res, message, undefined, 401));
        }

        // Step 3: CRITICAL - Check for existing active session
        // This enforces single-device login policy
        const hasActiveSession = await userService.hasActiveSession(user.id);
        if (hasActiveSession) {
          return resolve(
            sendError(
              res,
              'You are already logged in from another device. Please log out of your other session first.',
              undefined,
              409 // Conflict status code
            )
          );
        }

        // Step 4-7: Generate session and tokens
        const deviceInfo = extractDeviceInfo(req);
        const ipAddress = extractIpAddress(req);

        const loginResult = await userService.loginUser(user, deviceInfo, ipAddress);

        return resolve(
          sendSuccess(res, 'Login successful', {
            accessToken: loginResult.accessToken,
            refreshToken: loginResult.refreshToken,
            user: loginResult.user,
          })
        );
      } catch (error: any) {
        return resolve(sendError(res, error.message || 'Login failed', undefined, 400));
      }
    })(req, res);
  });
};

/**
 * Logout user - clears session from database
 * POST /api/auth/logout
 * Requires authentication
 */
export const logoutUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = req.user as any;

    if (!user) {
      return sendError(res, 'Unauthorized', undefined, 401);
    }

    await userService.logoutUser(user.id);

    return sendSuccess(res, 'Logout successful');
  } catch (error: any) {
    return sendError(res, error.message || 'Logout failed', undefined, 400);
  }
};

/**
 * Get current user profile
 * GET /api/users/profile
 * Requires authentication
 */
export const getProfile = async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = req.user as any;

    if (!user) {
      return sendError(res, 'Unauthorized', undefined, 401);
    }

    const profile = await userService.getUserProfile(user.id);

    return sendSuccess(res, 'Profile retrieved successfully', { user: profile });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to retrieve profile', undefined, 400);
  }
};

/**
 * Update user profile
 * PUT /api/users/profile
 * Requires authentication
 */
export const updateProfile = async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = req.user as any;
    const { name, university } = req.body;

    if (!user) {
      return sendError(res, 'Unauthorized', undefined, 401);
    }

    const updatedProfile = await userService.updateUserProfile(user.id, {
      name,
      university,
    });

    return sendSuccess(res, 'Profile updated successfully', { user: updatedProfile });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update profile', undefined, 400);
  }
};

/**
 * Change password
 * PUT /api/users/change-password
 * Requires authentication
 */
export const changePassword = async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = req.user as any;
    const { currentPassword, newPassword } = req.body;

    if (!user) {
      return sendError(res, 'Unauthorized', undefined, 401);
    }

    await userService.changePassword(user.id, currentPassword, newPassword);

    return sendSuccess(res, 'Password changed successfully. Please log in again.');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to change password', undefined, 400);
  }
};

/**
 * List all users (Admin only)
 * GET /api/users
 * Requires authentication and Super-admin role
 */
export const listUsers = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { role, status, university, limit = '20', offset = '0' } = req.query;

    const options = {
      role: role as UserRole | undefined,
      status: status as UserStatus | undefined,
      university: university as string | undefined,
      limit: parseInt(limit as string, 10),
      offset: parseInt(offset as string, 10),
    };

    const { users, total } = await userService.listUsers(options);

    return sendSuccess(res, 'Users retrieved successfully', { users, total });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to retrieve users', undefined, 400);
  }
};

/**
 * Get user by ID (Admin only)
 * GET /api/users/:userId
 * Requires authentication
 */
export const getUserById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { userId } = req.params;

    const user = await userService.getUserProfile(userId);

    return sendSuccess(res, 'User retrieved successfully', { user });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to retrieve user', undefined, 404);
  }
};

/**
 * Update user status (Admin only)
 * PUT /api/users/:userId/status
 * Requires authentication and admin role
 */
export const updateUserStatus = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    const user = await userService.updateUserStatus(userId, status as UserStatus);

    return sendSuccess(res, 'User status updated successfully', { user });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update user status', undefined, 400);
  }
};

/**
 * Update user role (Admin only)
 * PUT /api/users/:userId/role
 * Requires authentication and Super-admin role
 */
export const updateUserRole = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const user = await userService.updateUserRole(userId, role as UserRole);

    return sendSuccess(res, 'User role updated successfully', { user });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update user role', undefined, 400);
  }
};

/**
 * Delete user (Soft delete)
 * DELETE /api/users/:userId
 * Requires authentication and Super-admin role
 */
export const deleteUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { userId } = req.params;

    await userService.deleteUser(userId);

    return sendSuccess(res, 'User deleted successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to delete user', undefined, 400);
  }
};
