import { UserRepository } from '../repositories/user.repository';
import { SessionRepository } from '../repositories/session.repository';
import { User, UserRole, UserStatus } from '../models/user.model';
import { hashPassword } from '../utils/hash.util';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.util';
import { generateSessionId } from '../utils/session.util';

export class UserService {
  private userRepository: UserRepository;
  private sessionRepository: SessionRepository;
  private readonly MAX_SESSIONS = 2;

  constructor() {
    this.userRepository = new UserRepository();
    this.sessionRepository = new SessionRepository();
  }

  /**
   * Create a new user (registration)
   */
  async createUser(userData: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    university?: string;
  }): Promise<User> {
    // Check if email already exists
    const emailExists = await this.userRepository.emailExists(userData.email);
    if (emailExists) {
      throw new Error('Email already registered');
    }

    // Hash password
    const password_hash = await hashPassword(userData.password);

    // Create user with default values
    const user = await this.userRepository.create({
      name: userData.name,
      email: userData.email.toLowerCase(),
      password_hash,
      role: userData.role || 'Student',
      university: userData.university,
      status: 'Pending', // Requires approval or email verification
      isActive: true,
      isDeleted: false,
      currentSessionId: null,
      sessionLastActivity: null,
    });

    // Remove password hash from returned object
    const { password_hash: _, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  /**
   * CRITICAL: Login with 2-device limit enforcement
   *
   * Login Flow:
   * 1. Validate credentials (handled by Passport Local Strategy)
   * 2. Check active session count
   * 3. If user has 2 active sessions, remove the oldest one
   * 4. Create new session and generate JWT
   * 5. Return tokens to client
   */
  async loginUser(
    user: User,
    deviceInfo?: string,
    ipAddress?: string
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    user: Partial<User>;
  }> {
    // Check how many active sessions the user has
    const activeSessionCount = await this.sessionRepository.countActiveSessionsByUserId(user.id);

    // If user has reached max sessions (2), remove the oldest one
    if (activeSessionCount >= this.MAX_SESSIONS) {
      await this.sessionRepository.deleteOldestSession(user.id);
    }

    // Generate unique session ID for this login
    const sessionId = generateSessionId();

    // Create new session in database
    await this.sessionRepository.create({
      userId: user.id,
      sessionId,
      deviceInfo,
      ipAddress,
      lastActivity: new Date(),
      isActive: true,
    });

    // Generate JWT tokens with session ID embedded
    const tokenPayload = {
      userId: user.id,
      sessionId,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Return tokens and user info (without sensitive data)
    const { password_hash, currentSessionId, ...userInfo } = user;

    return {
      accessToken,
      refreshToken,
      user: userInfo,
    };
  }

  /**
   * Logout user - deactivates current session
   */
  // @ts-ignore
  async logoutUser(userId: string, sessionId: string): Promise<void> {
    await this.sessionRepository.deactivateSession(sessionId);
  }

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<Partial<User>> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const { password_hash, currentSessionId, ...userProfile } = user;
    return userProfile;
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    userId: string,
    updates: {
      name?: string;
      email?: string;
      university?: string;
      phoneNumber?: string;
      dateOfBirth?: Date;
      address?: string;
      city?: string;
      country?: string;
      bio?: string;
    }
  ): Promise<Partial<User>> {
    // If email is being updated, check if it already exists
    if (updates.email) {
      const emailExists = await this.userRepository.emailExists(updates.email);
      const currentUser = await this.userRepository.findById(userId);
      
      // Only throw error if email exists and belongs to different user
      if (emailExists && currentUser?.email.toLowerCase() !== updates.email.toLowerCase()) {
        throw new Error('Email already in use by another account');
      }
      
      // Normalize email to lowercase
      updates.email = updates.email.toLowerCase();
    }

    const user = await this.userRepository.update(userId, updates);
    if (!user) {
      throw new Error('User not found');
    }

    const { password_hash, currentSessionId, ...userProfile } = user;
    return userProfile;
  }

  /**
   * Change password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const bcrypt = require('bcryptjs');
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const password_hash = await hashPassword(newPassword);

    // Update password and clear all sessions (force re-login)
    await this.userRepository.update(userId, { password_hash });
    await this.userRepository.clearSession(userId);
  }

  /**
   * List all users (Admin only)
   */
  async listUsers(options?: {
    role?: UserRole;
    status?: UserStatus;
    university?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ users: Partial<User>[]; total: number }> {
    const { users, total } = await this.userRepository.findAll(options);

    // Remove sensitive data
    const sanitizedUsers = users.map(({ password_hash, currentSessionId, ...user }) => user);

    return { users: sanitizedUsers, total };
  }

  /**
   * Update user status (Admin only)
   */
  async updateUserStatus(userId: string, status: UserStatus): Promise<Partial<User>> {
    const user = await this.userRepository.updateStatus(userId, status);
    if (!user) {
      throw new Error('User not found');
    }

    // If banning user, clear their session
    if (status === 'Banned') {
      await this.userRepository.clearSession(userId);
    }

    const { password_hash, currentSessionId, ...userProfile } = user;
    return userProfile;
  }

  /**
   * Update user role (Admin only)
   */
  async updateUserRole(userId: string, role: UserRole): Promise<Partial<User>> {
    const user = await this.userRepository.updateRole(userId, role);
    if (!user) {
      throw new Error('User not found');
    }

    const { password_hash, currentSessionId, ...userProfile } = user;
    return userProfile;
  }

  /**
   * Delete user (Soft delete)
   */
  async deleteUser(userId: string): Promise<void> {
    const deleted = await this.userRepository.softDelete(userId);
    if (!deleted) {
      throw new Error('User not found');
    }

    // Clear session when deleting
    await this.userRepository.clearSession(userId);
  }

  /**
   * Check if user has active session
   */
  async hasActiveSession(userId: string): Promise<boolean> {
    const count = await this.sessionRepository.countActiveSessionsByUserId(userId);
    return count > 0;
  }

  /**
   * Get all active sessions for a user
   */
  async getUserSessions(userId: string): Promise<any[]> {
    const sessions = await this.sessionRepository.findActiveSessionsByUserId(userId);
    return sessions.map(session => ({
      id: session.id,
      deviceInfo: session.deviceInfo,
      ipAddress: session.ipAddress,
      lastActivity: session.lastActivity,
      createdAt: session.createdAt,
    }));
  }

  /**
   * Kill a specific session (user can kill their own sessions)
   */
  async killSession(userId: string, sessionId: string): Promise<boolean> {
    return await this.sessionRepository.deactivateSessionById(sessionId, userId);
  }

  /**
   * Admin force logout - deactivates all sessions for a user
   */
  async adminForceLogout(userId: string): Promise<void> {
    await this.sessionRepository.deactivateAllUserSessions(userId);
  }
}
