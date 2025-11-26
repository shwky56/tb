import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.model';
import { Enrollment } from './enrollment.model';
import { Module } from './module.model';

export type CourseStatus = 'Draft' | 'Published' | 'Archived';
export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 500 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  courseCode?: string;

  @Column({
    type: 'enum',
    enum: ['Draft', 'Published', 'Archived'],
    default: 'Draft',
  })
  status!: CourseStatus;

  @Column({
    type: 'enum',
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner',
  })
  level!: CourseLevel;

  @Column({ type: 'varchar', length: 255, nullable: true })
  category?: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  thumbnail?: string;

  @Column({ type: 'integer', default: 0 })
  duration!: number; // Duration in hours

  @Column({ type: 'integer', default: 0 })
  maxStudents!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  university?: string;

  @Column({ type: 'boolean', default: false })
  isDeleted!: boolean;

  /**
   * Instructor/Creator relationship
   */
  @Index('idx_course_instructor')
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'instructorId' })
  instructor!: User;

  @Column({ type: 'uuid' })
  instructorId!: string;

  /**
   * Relationships
   */
  @OneToMany(() => Enrollment, (enrollment) => enrollment.course)
  enrollments?: Enrollment[];

  @OneToMany(() => Module, (module) => module.course)
  modules?: Module[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
