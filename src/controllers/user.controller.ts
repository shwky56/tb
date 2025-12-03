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
 * CRITICAL: Login user with 2-device limit enforcement
 * POST /api/auth/login
 *
 * Login Flow:
 * 1. Passport Local Strategy validates email and password
 * 2. Check active session count
 * 3. If user has 2 active sessions, automatically logout the oldest one
 * 4. Create new session and generate JWT tokens
 * 5. Return tokens to client
 *
 * Session Validation on Subsequent Requests:
 * - Passport JWT Strategy extracts session ID from token
 * - Checks if session exists and is active in database
 * - If session is inactive, reject request
 */
export const loginUser = async (req: Request, res: Response): Promise<Response> => {
  return new Promise((resolve) => {
    // Step 1: Use Passport Local Strategy to validate credentials
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

        // Step 2-4: Generate session and tokens (handles 2-device limit internally)
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
 * Logout user - deactivates current session
 * POST /api/auth/logout
 * Requires authentication
 */
export const logoutUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = req.user as any;

    if (!user || !user.sessionId) {
      return sendError(res, 'Unauthorized', undefined, 401);
    }

    await userService.logoutUser(user.id, user.sessionId);

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
    const { name, email, university, phoneNumber, dateOfBirth, address, city, country, bio } = req.body;

    if (!user) {
      return sendError(res, 'Unauthorized', undefined, 401);
    }

    const updatedProfile = await userService.updateUserProfile(user.id, {
      name,
      email,
      university,
      phoneNumber,
      dateOfBirth,
      address,
      city,
      country,
      bio,
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

/**
 * Get user's active sessions
 * GET /api/users/sessions
 * Requires authentication
 */
export const getUserSessions = async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = req.user as any;

    if (!user) {
      return sendError(res, 'Unauthorized', undefined, 401);
    }

    const sessions = await userService.getUserSessions(user.id);

    return sendSuccess(res, 'Sessions retrieved successfully', { sessions });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to retrieve sessions', undefined, 400);
  }
};

/**
 * Kill a specific session
 * DELETE /api/users/sessions/:sessionId
 * Requires authentication
 */
export const killSession = async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = req.user as any;
    const { sessionId } = req.params;

    if (!user) {
      return sendError(res, 'Unauthorized', undefined, 401);
    }

    const success = await userService.killSession(user.id, sessionId);

    if (!success) {
      return sendError(res, 'Session not found or already inactive', undefined, 404);
    }

    return sendSuccess(res, 'Session terminated successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to terminate session', undefined, 400);
  }
};

/**
 * Admin force logout user
 * POST /api/users/:userId/force-logout
 * Requires authentication and admin role
 */
export const adminForceLogout = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { userId } = req.params;

    await userService.adminForceLogout(userId);

    return sendSuccess(res, 'User logged out successfully from all devices');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to force logout user', undefined, 400);
  }
};
