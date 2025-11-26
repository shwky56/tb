import { UserRepository } from '../repositories/user.repository';
import { User, UserRole, UserStatus } from '../models/user.model';
import { hashPassword } from '../utils/hash.util';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.util';
import { generateSessionId } from '../utils/session.util';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
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
   * CRITICAL: Login with single-device enforcement
   *
   * Login Flow:
   * 1. Validate credentials (handled by Passport Local Strategy)
   * 2. Check if user already has an active session (currentSessionId)
   * 3. If active session exists, reject login
   * 4. If no active session, generate new session ID and JWT
   * 5. Store session ID in database
   * 6. Return tokens to client
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
    // CRITICAL CHECK: Verify if user already has an active session
    if (user.currentSessionId) {
      throw new Error(
        'You are already logged in from another device. Please log out of your other session first.'
      );
    }

    // Generate unique session ID for this login
    const sessionId = generateSessionId();

    // Update user's session in database
    await this.userRepository.setSession(user.id, sessionId, deviceInfo, ipAddress);

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
   * Logout user - clears session
   */
  async logoutUser(userId: string): Promise<void> {
    await this.userRepository.clearSession(userId);
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
      university?: string;
    }
  ): Promise<Partial<User>> {
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
    return await this.userRepository.hasActiveSession(userId);
  }
}
