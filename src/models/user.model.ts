import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { Enrollment } from './enrollment.model';

export type UserRole = 'Super-admin' | 'University-admin' | 'Instructor' | 'Student';
export type UserStatus = 'Active' | 'Pending' | 'Banned';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Index('idx_user_email')
  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  password_hash!: string;

  @Column({
    type: 'enum',
    enum: ['Super-admin', 'University-admin', 'Instructor', 'Student'],
    default: 'Student',
  })
  role!: UserRole;

  @Column({ type: 'varchar', length: 255, nullable: true })
  university?: string;

  @Column({
    type: 'enum',
    enum: ['Active', 'Pending', 'Banned'],
    default: 'Pending',
  })
  status!: UserStatus;

  @Column({ type: 'boolean', default: false })
  isDeleted!: boolean;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  /**
   * CRITICAL FOR SINGLE-DEVICE LOGIN ENFORCEMENT
   * Stores the unique session ID of the currently active session
   * If null, user is not logged in from any device
   * If not null, user has an active session on a device
   */
  @Index('idx_user_session')
  @Column({ type: 'varchar', length: 500, nullable: true })
  currentSessionId!: string | null;

  /**
   * Timestamp of the last activity in the current session
   * Used for session timeout validation
   */
  @Column({ type: 'timestamp', nullable: true })
  sessionLastActivity!: Date | null;

  /**
   * Optional: Track the device/browser information
   */
  @Column({ type: 'varchar', length: 500, nullable: true })
  deviceInfo?: string | null;

  /**
   * Optional: Store IP address of current session for security
   */
  @Column({ type: 'varchar', length: 50, nullable: true })
  lastLoginIp?: string | null;

  /**
   * Optional: Email verification token
   */
  @Column({ type: 'varchar', length: 500, nullable: true })
  emailVerificationToken?: string | null;

  /**
   * Optional: Password reset token
   */
  @Column({ type: 'varchar', length: 500, nullable: true })
  passwordResetToken?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  passwordResetExpires?: Date | null;

  /**
   * Relationships
   */
  @OneToMany(() => Enrollment, (enrollment) => enrollment.user)
  enrollments?: Enrollment[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
