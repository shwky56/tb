import { Repository } from 'typeorm';
import AppDataSource from '../config/database.config';
import { User, UserRole, UserStatus } from '../models/user.model';

export class UserRepository {
  private repository: Repository<User>;

  constructor() {
    this.repository = AppDataSource.getRepository(User);
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    return await this.repository.findOne({
      where: { id, isDeleted: false },
    });
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return await this.repository.findOne({
      where: { email, isDeleted: false },
    });
  }

  /**
   * Create a new user
   */
  async create(userData: Partial<User>): Promise<User> {
    const user = this.repository.create(userData);
    return await this.repository.save(user);
  }

  /**
   * Update user information
   */
  async update(id: string, userData: Partial<User>): Promise<User | null> {
    await this.repository.update(id, userData);
    return await this.findById(id);
  }

  /**
   * Soft delete user
   */
  async softDelete(id: string): Promise<boolean> {
    const result = await this.repository.update(id, {
      isDeleted: true,
      isActive: false,
    });
    return result.affected !== 0;
  }

  /**
   * Get all users with optional filters
   */
  async findAll(options?: {
    role?: UserRole;
    status?: UserStatus;
    university?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ users: User[]; total: number }> {
    const queryBuilder = this.repository
      .createQueryBuilder('user')
      .where('user.isDeleted = :isDeleted', { isDeleted: false });

    if (options?.role) {
      queryBuilder.andWhere('user.role = :role', { role: options.role });
    }

    if (options?.status) {
      queryBuilder.andWhere('user.status = :status', { status: options.status });
    }

    if (options?.university) {
      queryBuilder.andWhere('user.university = :university', { university: options.university });
    }

    const total = await queryBuilder.getCount();

    if (options?.limit) {
      queryBuilder.limit(options.limit);
    }

    if (options?.offset) {
      queryBuilder.offset(options.offset);
    }

    const users = await queryBuilder.getMany();

    return { users, total };
  }

  /**
   * CRITICAL: Set current session ID for single-device login enforcement
   * Called after successful login
   */
  async setSession(userId: string, sessionId: string, deviceInfo?: string, ipAddress?: string): Promise<void> {
    await this.repository.update(userId, {
      currentSessionId: sessionId,
      sessionLastActivity: new Date(),
      deviceInfo,
      lastLoginIp: ipAddress,
    });
  }

  /**
   * CRITICAL: Clear session ID
   * Called during logout or when session expires
   */
  async clearSession(userId: string): Promise<void> {
    await this.repository.update(userId, {
      currentSessionId: null,
      sessionLastActivity: null,
    });
  }

  /**
   * Update session activity timestamp
   * Called on each authenticated request to extend session
   */
  async updateSessionActivity(userId: string): Promise<void> {
    await this.repository.update(userId, {
      sessionLastActivity: new Date(),
    });
  }

  /**
   * Check if user has an active session
   */
  async hasActiveSession(userId: string): Promise<boolean> {
    const user = await this.findById(userId);
    return user !== null && user.currentSessionId !== null;
  }

  /**
   * Update user status (for admin operations)
   */
  async updateStatus(userId: string, status: UserStatus): Promise<User | null> {
    await this.repository.update(userId, { status });
    return await this.findById(userId);
  }

  /**
   * Change user role (for admin operations)
   */
  async updateRole(userId: string, role: UserRole): Promise<User | null> {
    await this.repository.update(userId, { role });
    return await this.findById(userId);
  }

  /**
   * Check if email already exists
   */
  async emailExists(email: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { email, isDeleted: false },
    });
    return count > 0;
  }

  /**
   * Set password reset token
   */
  async setPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    await this.repository.update(userId, {
      passwordResetToken: token,
      passwordResetExpires: expiresAt,
    });
  }

  /**
   * Clear password reset token
   */
  async clearPasswordResetToken(userId: string): Promise<void> {
    await this.repository.update(userId, {
      passwordResetToken: null,
      passwordResetExpires: null,
    });
  }

  /**
   * Find user by password reset token
   */
  async findByPasswordResetToken(token: string): Promise<User | null> {
    return await this.repository.findOne({
      where: {
        passwordResetToken: token,
        isDeleted: false,
      },
    });
  }
}
