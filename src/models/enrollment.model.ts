import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from './user.model';
import { Course } from './course.model';

export type EnrollmentStatus = 'Pending' | 'Active' | 'Completed' | 'Dropped' | 'Suspended';

@Entity('enrollments')
@Unique(['userId', 'courseId']) // Prevent duplicate enrollments
export class Enrollment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('idx_enrollment_user')
  @ManyToOne(() => User, (user) => user.enrollments, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'uuid' })
  userId!: string;

  @Index('idx_enrollment_course')
  @ManyToOne(() => Course, (course) => course.enrollments, { nullable: false })
  @JoinColumn({ name: 'courseId' })
  course!: Course;

  @Column({ type: 'uuid' })
  courseId!: string;

  @Column({
    type: 'enum',
    enum: ['Pending', 'Active', 'Completed', 'Dropped', 'Suspended'],
    default: 'Pending',
  })
  status!: EnrollmentStatus;

  @Column({ type: 'timestamp', nullable: true })
  enrolledAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ type: 'integer', default: 0 })
  progress!: number; // Percentage (0-100)

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  grade?: number;

  @Column({ type: 'boolean', default: false })
  isDeleted!: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
