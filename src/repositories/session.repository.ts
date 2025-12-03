import { Repository } from 'typeorm';
import AppDataSource from '../config/database.config';
import { Session } from '../models/session.model';

export class SessionRepository {
  private repository: Repository<Session>;

  constructor() {
    this.repository = AppDataSource.getRepository(Session);
  }

  /**
   * Create a new session
   */
  async create(sessionData: Partial<Session>): Promise<Session> {
    const session = this.repository.create(sessionData);
    return await this.repository.save(session);
  }

  /**
   * Find session by session ID
   */
  async findBySessionId(sessionId: string): Promise<Session | null> {
    return await this.repository.findOne({
      where: { sessionId, isActive: true },
    });
  }

  /**
   * Get all active sessions for a user
   */
  async findActiveSessionsByUserId(userId: string): Promise<Session[]> {
    return await this.repository.find({
      where: { userId, isActive: true },
      order: { lastActivity: 'DESC' },
    });
  }

  /**
   * Count active sessions for a user
   */
  async countActiveSessionsByUserId(userId: string): Promise<number> {
    return await this.repository.count({
      where: { userId, isActive: true },
    });
  }

  /**
   * Update session last activity
   */
  async updateLastActivity(sessionId: string): Promise<void> {
    await this.repository.update(
      { sessionId },
      { lastActivity: new Date() }
    );
  }

  /**
   * Deactivate a specific session (logout)
   */
  async deactivateSession(sessionId: string): Promise<boolean> {
    const result = await this.repository.update(
      { sessionId, isActive: true },
      { isActive: false }
    );
    return (result.affected ?? 0) > 0;
  }

  /**
   * Deactivate session by ID (for user to kill their own sessions)
   */
  async deactivateSessionById(sessionId: string, userId: string): Promise<boolean> {
    const result = await this.repository.update(
      { id: sessionId, userId, isActive: true },
      { isActive: false }
    );
    return (result.affected ?? 0) > 0;
  }

  /**
   * Deactivate all sessions for a user
   */
  async deactivateAllUserSessions(userId: string): Promise<void> {
    await this.repository.update(
      { userId, isActive: true },
      { isActive: false }
    );
  }

  /**
   * Delete the oldest session for a user
   * Used when user exceeds max sessions (2)
   */
  async deleteOldestSession(userId: string): Promise<void> {
    const sessions = await this.repository.find({
      where: { userId, isActive: true },
      order: { lastActivity: 'ASC' },
      take: 1,
    });

    if (sessions.length > 0) {
      await this.repository.update(
        { id: sessions[0].id },
        { isActive: false }
      );
    }
  }

  /**
   * Clean up expired sessions (older than timeout)
   */
  async cleanupExpiredSessions(timeoutMinutes: number): Promise<void> {
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() - timeoutMinutes);

    await this.repository
      .createQueryBuilder()
      .update(Session)
      .set({ isActive: false })
      .where('isActive = :isActive', { isActive: true })
      .andWhere('lastActivity < :expiryTime', { expiryTime })
      .execute();
  }

  /**
   * Get session by ID and user ID (for authorization)
   */
  async findByIdAndUserId(sessionId: string, userId: string): Promise<Session | null> {
    return await this.repository.findOne({
      where: { id: sessionId, userId },
    });
  }
}
