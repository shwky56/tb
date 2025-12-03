import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.model';

/**
 * Session Entity
 * Tracks active login sessions for multi-device support
 * Enforces maximum 2 concurrent sessions per user
 */
@Entity('sessions')
@Index(['userId', 'isActive'])
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * User ID - foreign key to users table
   */
  @Index('idx_session_user')
  @Column({ type: 'uuid' })
  userId!: string;

  /**
   * Unique session identifier stored in JWT
   */
  @Index('idx_session_id')
  @Column({ type: 'varchar', length: 500, unique: true })
  sessionId!: string;

  /**
   * Device/browser information from user-agent
   */
  @Column({ type: 'varchar', length: 500, nullable: true })
  deviceInfo?: string;

  /**
   * IP address of the session
   */
  @Column({ type: 'varchar', length: 50, nullable: true })
  ipAddress?: string;

  /**
   * Last activity timestamp - updated on each request
   */
  @Column({ type: 'timestamp' })
  lastActivity!: Date;

  /**
   * Session active status
   */
  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  /**
   * Relationship to User
   */
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
